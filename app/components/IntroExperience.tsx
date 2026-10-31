"use client";

import { useEffect, useState } from "react";

export default function IntroExperience() {
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, []);

  const enter = () => {
    window.dispatchEvent(new Event("journey:start-music"));
    setLeaving(true);
    window.setTimeout(() => setVisible(false), 900);
  };

  if (!visible) return null;

  return (
    <div className={`intro${leaving ? " intro--leaving" : ""}`} role="dialog" aria-modal="true" aria-labelledby="intro-title">
      <div className="intro__image" aria-hidden="true" />
      <div className="intro__veil" aria-hidden="true" />
      <div className="intro__frame" aria-hidden="true" />
      <div className="intro__content">
        <span className="intro__heart" aria-hidden="true">♡</span>
        <p>Dimas &amp; Anita · Our Journey</p>
        <h1 id="intro-title">Are you <i>ready?</i></h1>
        <span className="intro__note">for our next beautiful chapter</span>
        <button type="button" onClick={enter} disabled={leaving}>
          <span>Let&apos;s go</span><i>↗</i>
        </button>
        <small>Best experienced with sound on</small>
      </div>
    </div>
  );
}
