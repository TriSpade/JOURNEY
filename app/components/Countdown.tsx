"use client";

import { useEffect, useState } from "react";

const target = new Date("2026-11-15T00:00:00+07:00").getTime();

function getTimeLeft() {
  const difference = Math.max(0, target - Date.now());
  return { hari: Math.floor(difference / 86_400_000), jam: Math.floor((difference / 3_600_000) % 24), menit: Math.floor((difference / 60_000) % 60), detik: Math.floor((difference / 1_000) % 60) };
}

export default function Countdown() {
  const [time, setTime] = useState({ hari: 0, jam: 0, menit: 0, detik: 0 });
  useEffect(() => { const update = () => setTime(getTimeLeft()); update(); const timer = window.setInterval(update, 1000); return () => window.clearInterval(timer); }, []);
  return (
    <div className="countdown__clock reveal-on-scroll" aria-label={`${time.hari} hari, ${time.jam} jam, ${time.menit} menit, ${time.detik} detik menuju perjalanan`}>
      {Object.entries(time).map(([label, value]) => <div className="time-unit" key={label}><strong>{String(value).padStart(2, "0")}</strong><span>{label}</span></div>)}
    </div>
  );
}
