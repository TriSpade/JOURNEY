"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Destination, UserIdentity } from "@/lib/types";

const emptyForm = { title: "", location: "", plannedDate: "", status: "wishlist", plan: "A", notes: "", videoUrls: "" };
const reactions = ["❤️", "😍", "✨", "👍", "🥰"];
const statusLabels = { wishlist: "Wishlist", planned: "Direncanakan", visited: "Sudah dikunjungi" } as const;
const planOptions = {
  A: { title: "Plan A", eyebrow: "Rencana utama", description: "Rute utama yang sudah disusun dari Kawah Putih sampai Braga.", priority: "Kawah Putih → Rengganis → Kebun Teh → Stroberi → Braga" },
  B: { title: "Plan B", eyebrow: "Destinasi penuh / macet sedang", description: "Gunakan jika antrean Kawah Putih panjang, Rengganis penuh, atau jadwal terlambat sekitar 60 menit.", priority: "Kawah Putih atau Ranca Upas → Situ Patenggang → Kebun Teh → Bandung" },
  C: { title: "Plan C", eyebrow: "Macet berat", description: "Fallback paling aman: lebih sedikit titik, pulang lebih awal, dan buffer lebih panjang.", priority: "Kawah Putih → kembali Bandung lebih awal → makan dekat penginapan" },
} as const;

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

function PhotoCarousel({ destination, onRemove }: { destination: Destination; onRemove: (id: number, label: string) => void }) {
  const [current, setCurrent] = useState(0);
  if (!destination.photos.length) return <div className="destination-carousel destination-carousel--empty"><span>⌖</span><p>Tambahkan foto untuk menghidupkan rencana ini.</p></div>;
  const activeIndex = current % destination.photos.length;
  const active = destination.photos[activeIndex];
  const move = (direction: number) => setCurrent((index) => (index + direction + destination.photos.length) % destination.photos.length);
  return (
    <div className="destination-carousel">
      <div className="destination-carousel__stage">
        <Image src={active.url} alt={active.label} fill sizes="(max-width: 900px) 100vw, 55vw" unoptimized priority={false} />
        <div className="destination-carousel__shade" />
        <div className="destination-carousel__caption"><small>Destinasi {String(activeIndex + 1).padStart(2, "0")}</small><strong>{active.label}</strong></div>
        <button className="destination-carousel__delete" onClick={() => onRemove(active.id, "foto")} aria-label={`Hapus foto ${active.label}`}>×</button>
        {destination.photos.length > 1 && <><button className="destination-carousel__arrow destination-carousel__arrow--prev" onClick={() => move(-1)} aria-label="Foto sebelumnya">‹</button><button className="destination-carousel__arrow destination-carousel__arrow--next" onClick={() => move(1)} aria-label="Foto berikutnya">›</button><span className="destination-carousel__count">{activeIndex + 1} / {destination.photos.length}</span></>}
      </div>
      {destination.photos.length > 1 && <div className="destination-carousel__thumbs">{destination.photos.map((photo, index) => <button className={index === activeIndex ? "is-active" : ""} key={photo.id} onClick={() => setCurrent(index)} aria-label={`Tampilkan ${photo.label}`}><Image src={photo.url} alt="" fill sizes="84px" unoptimized /><span>{photo.label}</span></button>)}</div>}
    </div>
  );
}

function embedVideoUrl(url: string) {
  const tiktok = url.match(/tiktok\.com\/@[^/]+\/video\/(\d+)/i);
  if (tiktok) return { provider: "TikTok", url: `https://www.tiktok.com/player/v1/${tiktok[1]}?controls=1&progress_bar=1&play_button=1&volume_control=1&fullscreen_button=1&autoplay=0&music_info=1&description=1&rel=0` };
  const instagram = url.match(/instagram\.com\/reels?\/([^/?#]+)/i);
  if (instagram) return { provider: "Instagram", url: `https://www.instagram.com/p/${instagram[1]}/embed/` };
  return null;
}

function VideoPlayer({ destination, onRemove }: { destination: Destination; onRemove: (id: number, label: string) => void }) {
  const [current, setCurrent] = useState(0);
  const activeIndex = current % destination.videos.length;
  const active = destination.videos[activeIndex];
  const embed = embedVideoUrl(active.url);
  return (
    <div className="destination-video-player">
      <div className="destination-video-player__header"><div><small>Referensi perjalanan</small><strong>{active.label || destination.title}</strong></div><span>{activeIndex + 1} / {destination.videos.length}</span></div>
      <div className="destination-video-player__stage">
        {embed ? <iframe src={embed.url} title={`${active.label} — ${embed.provider}`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; fullscreen; gyroscope; picture-in-picture; web-share" allowFullScreen loading="lazy" /> : <div className="destination-video-player__fallback"><span>▶</span><p>Preview tidak tersedia untuk tautan ini.</p></div>}
      </div>
      <div className="destination-video-player__footer">
        {destination.videos.length > 1 && <div className="destination-video-player__nav"><button onClick={() => setCurrent((activeIndex - 1 + destination.videos.length) % destination.videos.length)}>←</button><button onClick={() => setCurrent((activeIndex + 1) % destination.videos.length)}>→</button></div>}
        <a href={active.url} target="_blank" rel="noreferrer">Buka di {embed?.provider ?? "sumber"} ↗</a>
        <button className="destination-video-player__delete" onClick={() => onRemove(active.id, "referensi video")}>Hapus referensi</button>
      </div>
    </div>
  );
}

export default function JourneyManager() {
  const [user, setUser] = useState<UserIdentity | null>(null);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [activePlan, setActivePlan] = useState<Destination["plan"]>("A");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoLabels, setPhotoLabels] = useState("");
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

  const openCreate = () => { setEditingId(null); setForm({ ...emptyForm, plan: activePlan }); setPhotos([]); setPhotoLabels(""); setShowForm(true); setError(""); };
  const openEdit = (destination: Destination) => {
    setEditingId(destination.id);
    setForm({ title: destination.title, location: destination.location, plannedDate: destination.plannedDate ?? "", status: destination.status, plan: destination.plan, notes: destination.notes, videoUrls: destination.videos.map((video) => video.url).join("\n") });
    setPhotos([]);
    setPhotoLabels("");
    setShowForm(true); setError("");
  };

  const saveDestination = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const payload = { ...form, videoUrls: form.videoUrls.split(/\r?\n/).map((url) => url.trim()).filter(Boolean) };
      const result = await request<{ id?: number }>(editingId ? `/api/destinations/${editingId}` : "/api/destinations", { method: editingId ? "PATCH" : "POST", body: JSON.stringify(payload) });
      const destinationId = editingId ?? result.id;
      if (photos.length && destinationId) {
        const photoData = new FormData();
        photos.forEach((photo) => photoData.append("photos", photo));
        photoData.append("labels", JSON.stringify(photoLabels.split(/\r?\n/).map((label) => label.trim())));
        const upload = await fetch(`/api/destinations/${destinationId}/photos`, { method: "POST", body: photoData });
        const uploadResult = await upload.json().catch(() => ({}));
        if (!upload.ok) throw new Error(uploadResult.error ?? "Gagal mengunggah foto.");
      }
      setShowForm(false); setForm(emptyForm); setPhotos([]); setPhotoLabels(""); setEditingId(null); await loadDestinations();
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

  const removeMedia = async (mediaId: number, label: string) => {
    if (!window.confirm(`Hapus ${label} ini?`)) return;
    await request(`/api/media/${mediaId}`, { method: "DELETE" });
    await loadDestinations();
  };

  const visibleDestinations = destinations.filter((destination) => destination.plan === activePlan);

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
      <section className="plan-switcher" aria-label="Pilih rencana perjalanan">
        {(Object.keys(planOptions) as Destination["plan"][]).map((plan) => <button key={plan} className={activePlan === plan ? "is-active" : ""} onClick={() => setActivePlan(plan)}><small>{planOptions[plan].eyebrow}</small><strong>{planOptions[plan].title}</strong><span>{planOptions[plan].description}</span></button>)}
      </section>
      <aside className={`plan-guidance plan-guidance--${activePlan.toLowerCase()}`}><div><small>Kapan digunakan</small><p>{planOptions[activePlan].description}</p></div><div><small>Urutan prioritas</small><strong>{planOptions[activePlan].priority}</strong></div><span>Jadwal simulasi · bukan estimasi lalu lintas real-time</span></aside>
      <section className="manager-stats" aria-label="Ringkasan destinasi">
        <div><strong>{visibleDestinations.length}</strong><span>Destinasi {planOptions[activePlan].title}</span></div>
        <div><strong>{visibleDestinations.filter((item) => item.status === "planned").length}</strong><span>Direncanakan</span></div>
        <div><strong>{visibleDestinations.filter((item) => item.status === "visited").length}</strong><span>Sudah dikunjungi</span></div>
      </section>
      {error && <p className="form-error manager-notice" role="alert">{error}</p>}
      {visibleDestinations.length === 0 ? (
        <section className="manager-empty"><span>⌖</span><h2>{planOptions[activePlan].title} belum memiliki destinasi</h2><p>Tambahkan jadwal simulasi atau titik cadangan untuk rencana ini.</p><button className="manager-primary" onClick={openCreate}>Tambah destinasi {planOptions[activePlan].title}</button></section>
      ) : (
        <section className="destination-grid">
          {visibleDestinations.map((destination, index) => (
            <article className="destination-card" key={destination.id}>
              {destination.photos.length > 0 ? <PhotoCarousel destination={destination} onRemove={removeMedia} /> : destination.videos.length > 0 ? <VideoPlayer destination={destination} onRemove={removeMedia} /> : <PhotoCarousel destination={destination} onRemove={removeMedia} />}
              <div className="destination-card__body">
                <div className="destination-card__top"><div className="destination-card__badges"><span className={`plan-badge plan-badge--${destination.plan.toLowerCase()}`}>Plan {destination.plan}</span><span className={`status status--${destination.status}`}>{statusLabels[destination.status]}</span></div><span className="destination-card__number">{String(index + 1).padStart(2, "0")}</span></div>
                <h2>{destination.title}</h2><p className="destination-location">⌖ {destination.location || "Lokasi belum ditentukan"}</p>
                <div className="destination-meta"><span><small>Tanggal</small><strong>{formatDate(destination.plannedDate)}</strong></span></div>
                {destination.notes && <p className="destination-notes">{destination.notes}</p>}
                {destination.photos.length > 0 && destination.videos.length > 0 && <div className="video-list">{destination.videos.map((video, videoIndex) => <div className="video-reference" key={video.id}><a href={video.url} target="_blank" rel="noreferrer"><span>▶</span><div><small>{video.label || `Referensi video ${videoIndex + 1}`}</small><strong>Buka inspirasi perjalanan ↗</strong></div></a><button onClick={() => removeMedia(video.id, "referensi video")} aria-label="Hapus referensi video">×</button></div>)}</div>}
                <p className="destination-author">Ditambahkan oleh {destination.createdBy.displayName}</p>
                <div className="destination-actions"><button onClick={() => openEdit(destination)}>Edit</button><button className="danger" onClick={() => removeDestination(destination)}>Hapus</button></div>
              </div>
              <div className="destination-card__social">
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
              </div>
            </article>
          ))}
        </section>
      )}
      {showForm && <div className="modal-backdrop" onMouseDown={(event) => { if (event.currentTarget === event.target) setShowForm(false); }}><section className="destination-modal" role="dialog" aria-modal="true" aria-labelledby="destination-form-title"><button className="modal-close" onClick={() => setShowForm(false)} aria-label="Tutup">×</button><p className="manager-eyebrow">Our next chapter</p><h2 id="destination-form-title">{editingId ? "Edit destinasi" : "Destinasi baru"}</h2><form onSubmit={saveDestination}><label>Nama destinasi<input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required maxLength={120} placeholder="Contoh: Yogyakarta" /></label><label>Lokasi<input value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} maxLength={160} placeholder="Kota atau tempat spesifik" /></label><label>Rencana perjalanan<select value={form.plan} onChange={(event) => setForm({ ...form, plan: event.target.value })}><option value="A">Plan A · Utama</option><option value="B">Plan B · Ramai / macet sedang</option><option value="C">Plan C · Macet berat</option></select></label><div className="form-row"><label>Tanggal<input type="date" value={form.plannedDate} onChange={(event) => setForm({ ...form, plannedDate: event.target.value })} /></label><label>Status<select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}><option value="wishlist">Wishlist</option><option value="planned">Direncanakan</option><option value="visited">Sudah dikunjungi</option></select></label></div><label>Foto destinasi<input className="file-input" type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={(event) => { const selected = Array.from(event.target.files ?? []); setPhotos(selected); setPhotoLabels(selected.map((file) => file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ")).join("\n")); }} /><small className="field-help">Bisa pilih beberapa foto · JPG, PNG, atau WebP · maksimal 8 MB per foto · maksimal 12 foto{photos.length ? ` · ${photos.length} foto dipilih` : ""}</small></label>{photos.length > 0 && <label>Label foto<textarea value={photoLabels} onChange={(event) => setPhotoLabels(event.target.value)} rows={Math.min(photos.length, 5)} placeholder={"Kawah Putih\nKebun Teh Rancabali"} /><small className="field-help">Satu label per baris sesuai urutan foto.</small></label>}<label>Referensi video<textarea value={form.videoUrls} onChange={(event) => setForm({ ...form, videoUrls: event.target.value })} maxLength={10000} rows={3} placeholder={"https://youtube.com/...\nhttps://tiktok.com/..."} /><small className="field-help">Satu link per baris · maksimal 20 link. Boleh dikosongkan dan ditambahkan nanti.</small></label><label>Catatan<textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} maxLength={1500} rows={4} placeholder="Hal yang ingin dilakukan, tempat makan, atau catatan kecil…" /></label>{error && <p className="form-error">{error}</p>}<button className="manager-primary" disabled={busy} type="submit">{busy ? "Menyimpan…" : editingId ? "Simpan perubahan" : "Tambahkan ke perjalanan"}</button></form></section></div>}
    </main>
  );
}
