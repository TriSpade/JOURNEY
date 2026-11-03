"use client";

import { useState } from "react";
import InlineVideoReference from "./InlineVideoReference";

type PlanKey = "A" | "B" | "C";

type BucketItem = {
  title: string;
  meta: string;
  tag?: "Instagram" | "TikTok";
  href?: string;
};

const plans: Record<PlanKey, { label: string; description: string; items: BucketItem[] }> = {
  A: {
    label: "Rencana utama",
    description: "Rute utama dari Kawah Putih sampai Braga.",
    items: [
      { title: "Kawah Putih", meta: "06.00–10.30 · Rancabali, Ciwidey", tag: "Instagram", href: "https://www.instagram.com/reels/DHvu2qhyZXz/" },
      { title: "Sunan Ibu", meta: "Kawasan Kawah Putih, Ciwidey", tag: "TikTok", href: "https://www.tiktok.com/@andinostory/video/7511990098645306631" },
      { title: "Kawah Rengganis", meta: "13.30–15.00 · Rancabali, Ciwidey", tag: "TikTok", href: "https://www.tiktok.com/@eunike_octaviani/video/7667905164656839956" },
      { title: "Kebun Teh Rancabali", meta: "15.00–15.30 · Rancabali, Ciwidey", tag: "TikTok", href: "https://www.tiktok.com/@neorentalmotorbdg/video/7276414435416100101" },
      { title: "Kebun Stroberi Ciwidey", meta: "16.15–16.45 · Jalur Ciwidey", tag: "Instagram", href: "https://www.instagram.com/reels/C6YBhfPv2R2/" },
      { title: "Braga", meta: "19.00–19.45 · Bandung", tag: "TikTok", href: "https://www.tiktok.com/@mainbandung.yuk/video/7701695826116054290" },
    ],
  },
  B: {
    label: "Macet sedang",
    description: "Cadangan saat destinasi penuh atau jadwal terlambat sekitar 60 menit.",
    items: [
      { title: "Kawah Putih + Sunan Ibu, atau Ranca Upas", meta: "07.30–09.30 · Rancabali, Ciwidey", tag: "Instagram", href: "https://www.instagram.com/reels/DHvu2qhyZXz/" },
      { title: "Ranca Upas jika belum dikunjungi", meta: "09.30–10.30 · Ciwidey", tag: "Instagram", href: "https://www.instagram.com/p/DOiqN0PCav8/" },
      { title: "Makan siang", meta: "10.30–11.30 · Sekitar Ciwidey" },
      { title: "Situ Patenggang", meta: "11.30–13.00 · Pengganti Rengganis" },
      { title: "Foto Kebun Teh Rancabali", meta: "13.00–13.30 · Rancabali, Ciwidey", tag: "TikTok", href: "https://www.tiktok.com/@neorentalmotorbdg/video/7276414435416100101" },
      { title: "Mulai kembali menuju Bandung", meta: "13.30–14.00 · Ciwidey menuju Bandung" },
      { title: "Perjalanan dan buffer kemacetan", meta: "14.00–19.00 · Menuju Bandung" },
      { title: "Braga jika memungkinkan", meta: "19.00–20.00 · Bandung", tag: "TikTok", href: "https://www.tiktok.com/@mainbandung.yuk/video/7701695826116054290" },
    ],
  },
  C: {
    label: "Macet berat",
    description: "Fallback paling aman dengan lebih sedikit titik dan buffer lebih panjang.",
    items: [
      { title: "Kawah Putih + Sunan Ibu", meta: "06.00–09.00 · Rancabali, Ciwidey", tag: "Instagram", href: "https://www.instagram.com/reels/DHvu2qhyZXz/" },
      { title: "Istirahat dan makan lebih awal", meta: "09.00–11.30 · Sekitar Ciwidey" },
      { title: "Ranca Upas opsional", meta: "11.30–13.00 · Ciwidey", tag: "Instagram", href: "https://www.instagram.com/p/DOiqN0PCav8/" },
      { title: "Kembali ke Bandung + buffer besar", meta: "13.00–18.00 · Ciwidey menuju Bandung" },
      { title: "Makan malam dekat penginapan", meta: "18.00–19.30 · Bandung" },
      { title: "Braga opsional", meta: "19.30–20.15 · Bandung", tag: "TikTok", href: "https://www.tiktok.com/@mainbandung.yuk/video/7701695826116054290" },
    ],
  },
};

export default function JourneyPlanBucket() {
  const [activePlan, setActivePlan] = useState<PlanKey>("A");
  const plan = plans[activePlan];

  return (
    <>
      <div className="bucket-plan-tabs" role="tablist" aria-label="Pilih rencana perjalanan">
        {(Object.keys(plans) as PlanKey[]).map((key) => (
          <button
            type="button"
            role="tab"
            aria-selected={activePlan === key}
            aria-controls="bucket-plan-panel"
            className={activePlan === key ? "is-active" : ""}
            key={key}
            onClick={() => setActivePlan(key)}
          >
            <strong>Plan {key}</strong>
            <span>{plans[key].label}</span>
          </button>
        ))}
      </div>

      <div className="bucket-plan-summary" aria-live="polite">
        <strong>{plan.items.length} titik perjalanan</strong>
        <span>{plan.description}</span>
      </div>

      <div className="bucket__list" id="bucket-plan-panel" role="tabpanel">
        {plan.items.map((item, index) => (
          <article className="bucket-row reveal-on-scroll" key={`${activePlan}-${item.title}`}>
            <span className="bucket-row__index">{String(index + 1).padStart(2, "0")}</span>
            <span className="bucket-row__check" aria-hidden="true" />
            <div><h3>{item.title}</h3><p>{item.meta}</p></div>
            {item.href && item.tag ? (
              <>
                <span className="bucket-row__tag">{item.tag}</span>
                <InlineVideoReference url={item.href} label={`Putar ${item.title}`} title={item.title} variant="row" />
              </>
            ) : (
              <span className="bucket-row__pending">Referensi menyusul</span>
            )}
          </article>
        ))}
      </div>
    </>
  );
}
