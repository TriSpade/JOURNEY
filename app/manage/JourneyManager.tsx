"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { Destination, UserIdentity } from "@/lib/types";

const emptyForm = { title: "", location: "", plannedDate: "", status: "wishlist", notes: "" };
const reactions = ["❤️", "😍", "✨", "👍", "🥰"];
const statusLabels = { wishlist: "Wishlist", planned: "Direncanakan", visited: "Sudah dikunjungi" } as const;

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...options, headers: { "Content-Type": "application/json", ...options?.headers } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error ?? "Terjadi kesalahan. Coba lagi.");
  return data as T;
}

function formatDate(value: string | null) {
  if (!value) return "Tanggal fleksibel";
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(new Date(`${value}T00:00:00`));
}

export default function JourneyManager() {
  const [user, setUser] = useState<UserIdentity | null>(null);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [drafts, setDrafts] = useState<Record<number, string>>({});

  const loadDestinations = useCallback(async () => {
    try {
      const data = await request<{ destinations: Destination[] }>("/api/destinations");
      setDestinations(data.destinations);
    } catch (reason) {
      if (reason instanceof Error && !reason.message.includes("login")) setError(reason.message);
    }
  }, []);

  useEffect(() => {
    request<{ user: UserIdentity }>("/api/auth/me")
      .then(({ user: current }) => { setUser(current); return loadDestinations(); })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [loadDestinations]);

  useEffect(() => {
    if (!user) return;
    const timer = window.setInterval(() => void loadDestinations(), 6000);
    return () => window.clearInterval(timer);
  }, [user, loadDestinations]);

  const login = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setBusy(true); setError("");
    const data = new FormData(event.currentTarget);
    try {
      const result = await request<{ user: UserIdentity }>("/api/auth/login", { method: "POST", body: JSON.stringify({ username: data.get("username"), password: data.get("password") }) });
      setUser(result.user); await loadDestinations();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Login gagal."); }
    finally { setBusy(false); }
  };

  const logout = async () => {
    await request("/api/auth/logout", { method: "POST" });
    setUser(null); setDestinations([]);
  };

  const openCreate = () => { setEditingId(null); setForm(emptyForm); setShowForm(true); setError(""); };
  const openEdit = (destination: Destination) => {
    setEditingId(destination.id);
    setForm({ title: destination.title, location: destination.location, plannedDate: destination.plannedDate ?? "", status: destination.status, notes: destination.notes });
    setShowForm(true); setError("");
  };

  const saveDestination = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setBusy(true); setError("");
    try {
      await request(editingId ? `/api/destinations/${editingId}` : "/api/destinations", { method: editingId ? "PATCH" : "POST", body: JSON.stringify(form) });
      setShowForm(false); setForm(emptyForm); setEditingId(null); await loadDestinations();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Gagal menyimpan destinasi."); }
    finally { setBusy(false); }
  };

  const removeDestination = async (destination: Destination) => {
    if (!window.confirm(`Hapus ${destination.title} beserta semua pesan dan reaction?`)) return;
    await request(`/api/destinations/${destination.id}`, { method: "DELETE" });
    await loadDestinations();
  };

  const toggleReaction = async (destinationId: number, emoji: string) => {
    await request(`/api/destinations/${destinationId}/reactions`, { method: "POST", body: JSON.stringify({ emoji }) });
    await loadDestinations();
  };

  const sendMessage = async (event: FormEvent<HTMLFormElement>, destinationId: number) => {
    event.preventDefault();
    const body = drafts[destinationId]?.trim();
    if (!body) return;
    setDrafts((current) => ({ ...current, [destinationId]: "" }));
    await request(`/api/destinations/${destinationId}/messages`, { method: "POST", body: JSON.stringify({ body }) });
    await loadDestinations();
  };

  const removeMessage = async (id: number) => {
    await request(`/api/messages/${id}`, { method: "DELETE" });
    await loadDestinations();
  };

  if (loading) return <main className="manager manager--center"><div className="manager-loader">♡</div><p>Menyiapkan ruang kalian…</p></main>;

  if (!user) return (
    <main className="manager manager--login">
      <Link className="manager-back" href="/">← Kembali ke cerita</Link>
      <section className="login-card">
        <span className="login-card__heart">♡</span>
        <p className="manager-eyebrow">Dimas & Anita</p>
        <h1>Ruang kecil<br /><i>milik kita berdua.</i></h1>
        <p>Masuk untuk menyusun destinasi, memberikan reaction, dan meninggalkan pesan satu sama lain.</p>
        <form onSubmit={login}>
          <label>Siapa kamu?<select name="username" defaultValue="dimas"><option value="dimas">Dimas</option><option value="anita">Anita</option></select></label>
          <label>Kata sandi<input name="password" type="password" autoComplete="current-password" required placeholder="Masukkan kata sandi" /></label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="manager-primary" type="submit" disabled={busy}>{busy ? "Membuka…" : "Masuk ke ruang kita →"}</button>
        </form>
      </section>
    </main>
  );

  return (
    <main className="manager">
      <header className="manager-header">
        <Link className="manager-brand" href="/"><span>♡</span><div><strong>Our Journey</strong><small>Dimas & Anita</small></div></Link>
        <div className="manager-user"><span>Halo, <strong>{user.displayName}</strong></span><button onClick={logout}>Keluar</button></div>
      </header>
      <section className="manager-hero">
        <div><p className="manager-eyebrow">Our private planner</p><h1>Mimpi yang akan<br /><i>kita datangi bersama.</i></h1><p>Tambah tempat baru, diskusikan rencananya, lalu simpan semua antusiasme di satu ruang.</p></div>
        <button className="manager-primary" onClick={openCreate}>＋ Tambah destinasi</button>
      </section>
      <section className="manager-stats" aria-label="Ringkasan destinasi">
        <div><strong>{destinations.length}</strong><span>Semua destinasi</span></div>
        <div><strong>{destinations.filter((item) => item.status === "planned").length}</strong><span>Direncanakan</span></div>
        <div><strong>{destinations.filter((item) => item.status === "visited").length}</strong><span>Sudah dikunjungi</span></div>
      </section>
      {error && <p className="form-error manager-notice" role="alert">{error}</p>}
      {destinations.length === 0 ? (
        <section className="manager-empty"><span>⌖</span><h2>Belum ada destinasi</h2><p>Mulai dari satu tempat yang selalu ingin kalian datangi.</p><button className="manager-primary" onClick={openCreate}>Buat destinasi pertama</button></section>
      ) : (
        <section className="destination-grid">
          {destinations.map((destination, index) => (
            <article className="destination-card" key={destination.id}>
              <div className="destination-card__top"><span className={`status status--${destination.status}`}>{statusLabels[destination.status]}</span><span className="destination-card__number">{String(index + 1).padStart(2, "0")}</span></div>
              <h2>{destination.title}</h2><p className="destination-location">⌖ {destination.location || "Lokasi belum ditentukan"}</p>
              <div className="destination-meta"><span><small>Tanggal</small><strong>{formatDate(destination.plannedDate)}</strong></span></div>
              {destination.notes && <p className="destination-notes">{destination.notes}</p>}
              <p className="destination-author">Ditambahkan oleh {destination.createdBy.displayName}</p>
              <div className="reaction-row">
                {reactions.map((emoji) => {
                  const current = destination.reactions.find((item) => item.emoji === emoji);
                  return <button key={emoji} className={current?.reactedByMe ? "reaction reaction--active" : "reaction"} onClick={() => toggleReaction(destination.id, emoji)} title={current?.users.join(", ")}><span>{emoji}</span>{current?.count ? <b>{current.count}</b> : null}</button>;
                })}
              </div>
              <div className="message-panel">
                <div className="message-panel__title"><strong>Pesan kalian</strong><span>{destination.messages.length}</span></div>
                <div className="message-list">
                  {destination.messages.length === 0 && <p className="message-empty">Belum ada pesan. Tinggalkan satu untuk pasanganmu ♡</p>}
                  {destination.messages.map((message) => <div className={message.user.id === user.id ? "message message--mine" : "message"} key={message.id}><div><strong>{message.user.displayName}</strong><p>{message.body}</p></div>{message.user.id === user.id && <button onClick={() => removeMessage(message.id)} aria-label="Hapus pesan">×</button>}</div>)}
                </div>
                <form className="message-form" onSubmit={(event) => sendMessage(event, destination.id)}><input value={drafts[destination.id] ?? ""} onChange={(event) => setDrafts((current) => ({ ...current, [destination.id]: event.target.value }))} placeholder="Tulis pesan…" maxLength={500} /><button type="submit" aria-label="Kirim pesan">→</button></form>
              </div>
              <div className="destination-actions"><button onClick={() => openEdit(destination)}>Edit</button><button className="danger" onClick={() => removeDestination(destination)}>Hapus</button></div>
            </article>
          ))}
        </section>
      )}
      {showForm && <div className="modal-backdrop" onMouseDown={(event) => { if (event.currentTarget === event.target) setShowForm(false); }}><section className="destination-modal" role="dialog" aria-modal="true" aria-labelledby="destination-form-title"><button className="modal-close" onClick={() => setShowForm(false)} aria-label="Tutup">×</button><p className="manager-eyebrow">Our next chapter</p><h2 id="destination-form-title">{editingId ? "Edit destinasi" : "Destinasi baru"}</h2><form onSubmit={saveDestination}><label>Nama destinasi<input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required maxLength={120} placeholder="Contoh: Yogyakarta" /></label><label>Lokasi<input value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} maxLength={160} placeholder="Kota atau tempat spesifik" /></label><div className="form-row"><label>Tanggal<input type="date" value={form.plannedDate} onChange={(event) => setForm({ ...form, plannedDate: event.target.value })} /></label><label>Status<select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}><option value="wishlist">Wishlist</option><option value="planned">Direncanakan</option><option value="visited">Sudah dikunjungi</option></select></label></div><label>Catatan<textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} maxLength={1500} rows={4} placeholder="Hal yang ingin dilakukan, tempat makan, atau catatan kecil…" /></label>{error && <p className="form-error">{error}</p>}<button className="manager-primary" disabled={busy} type="submit">{busy ? "Menyimpan…" : editingId ? "Simpan perubahan" : "Tambahkan ke perjalanan"}</button></form></section></div>}
    </main>
  );
}
