"use client";

import { createContext, type ReactNode, useContext, useState } from "react";

type ReferenceVideoContextValue = {
  openId: string | null;
  setOpenId: (id: string | null) => void;
};

const ReferenceVideoContext = createContext<ReferenceVideoContextValue | null>(null);

export function ReferenceVideoProvider({ children }: { children: ReactNode }) {
  const [openId, setOpenId] = useState<string | null>(null);
  return <ReferenceVideoContext.Provider value={{ openId, setOpenId }}>{children}</ReferenceVideoContext.Provider>;
}

function getEmbed(url: string) {
  const tiktok = url.match(/tiktok\.com\/@[^/]+\/video\/(\d+)/i);
  if (tiktok) {
    return `https://www.tiktok.com/player/v1/${tiktok[1]}?controls=1&progress_bar=1&play_button=1&volume_control=1&fullscreen_button=1&autoplay=0&music_info=1&description=1&rel=0`;
  }

  const instagram = url.match(/instagram\.com\/reels?\/([^/?#]+)/i);
  if (instagram) return `https://www.instagram.com/p/${instagram[1]}/embed/`;

  return null;
}

type InlineVideoReferenceProps = {
  url: string;
  label: string;
  title: string;
  variant?: "story" | "row";
};

export default function InlineVideoReference({ url, label, title, variant = "story" }: InlineVideoReferenceProps) {
  const context = useContext(ReferenceVideoContext);
  const fallbackState = useState(false);
  const referenceId = `${variant}:${title}`;
  const open = context ? context.openId === referenceId : fallbackState[0];
  const embedUrl = getEmbed(url);

  if (!embedUrl) return null;

  return (
    <div className={`inline-reference inline-reference--${variant}${open ? " is-open" : ""}`}>
      <button
        type="button"
        className={variant === "story" ? "story-card__link" : "inline-reference__round"}
        aria-expanded={open}
        aria-label={open ? `Tutup referensi ${title}` : `Putar referensi ${title}`}
        onClick={() => context ? context.setOpenId(open ? null : referenceId) : fallbackState[1]((value) => !value)}
      >
        {variant === "story" ? <>{open ? "Tutup video" : label} <span>{open ? "↑" : "▶"}</span></> : <span>{open ? "↑" : "▶"}</span>}
      </button>
      {open && (
        <div className="inline-reference__player">
          <iframe
            src={embedUrl}
            title={`Referensi video ${title}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
          />
        </div>
      )}
    </div>
  );
}
