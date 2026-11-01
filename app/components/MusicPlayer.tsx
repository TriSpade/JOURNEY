"use client";

import { useEffect, useRef, useState } from "react";

const musicSource = "/the_mountain-france-romance-375982.mp3";

export default function MusicPlayer() {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stop = () => {
    audioRef.current?.pause();
    setPlaying(false);
  };

  const start = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.38;
    try {
      await audio.play();
      setPlaying(true);
    } catch {
      setPlaying(false);
    }
  };

  const toggle = () => {
    if (audioRef.current?.paused === false) stop();
    else void start();
  };

  useEffect(() => {
    const audio = audioRef.current;
    const startFromIntro = () => {
      if (audio?.paused !== false) void start();
    };
    window.addEventListener("journey:start-music", startFromIntro);
    return () => {
      window.removeEventListener("journey:start-music", startFromIntro);
      audio?.pause();
    };
  }, []);

  return (
    <>
      <audio ref={audioRef} src={musicSource} loop preload="auto" />
      <button
        className={`music-player${playing ? " music-player--playing" : ""}`}
        type="button"
        onClick={toggle}
        aria-pressed={playing}
        aria-label={playing ? "Hentikan musik romantis" : "Putar musik romantis"}
      >
        <span className="music-player__disc" aria-hidden="true">
          {playing ? <span className="music-player__bars"><i /><i /><i /></span> : <span className="music-player__play">▶</span>}
        </span>
        <span className="music-player__copy">
          <small>Our melody</small>
          <strong>{playing ? "Sedang diputar" : "Putar musik"}</strong>
        </span>
      </button>
    </>
  );
}
