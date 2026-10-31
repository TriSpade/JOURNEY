"use client";

import { useEffect, useRef, useState } from "react";

const progression = [
  [261.63, 329.63, 392, 493.88],
  [220, 261.63, 329.63, 392],
  [174.61, 220, 261.63, 329.63],
  [196, 246.94, 293.66, 392],
];

const melody = [659.25, 587.33, 523.25, 493.88, 440, 523.25, 392, 493.88];

function addTone(
  context: AudioContext,
  destination: AudioNode,
  frequency: number,
  start: number,
  duration: number,
  volume: number,
  type: OscillatorType = "sine",
) {
  const oscillator = context.createOscillator();
  const envelope = context.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  envelope.gain.setValueAtTime(0.0001, start);
  envelope.gain.exponentialRampToValueAtTime(volume, start + 0.65);
  envelope.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(envelope).connect(destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.05);
}

function schedulePhrase(context: AudioContext, destination: AudioNode) {
  const start = context.currentTime + 0.08;
  progression.forEach((chord, chordIndex) => {
    chord.forEach((frequency, noteIndex) => {
      addTone(context, destination, frequency / 2, start + chordIndex * 4 + noteIndex * 0.08, 4.7, 0.042, "sine");
      addTone(context, destination, frequency, start + chordIndex * 4 + noteIndex * 0.08, 4.2, 0.012, "triangle");
    });
  });
  melody.forEach((frequency, index) => {
    addTone(context, destination, frequency, start + index * 2, 1.75, 0.018, "sine");
  });
}

export default function MusicPlayer() {
  const [playing, setPlaying] = useState(false);
  const contextRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const timerRef = useRef<number | null>(null);

  const stop = () => {
    if (timerRef.current !== null) window.clearInterval(timerRef.current);
    timerRef.current = null;
    const context = contextRef.current;
    const master = masterRef.current;
    if (context && master) {
      master.gain.cancelScheduledValues(context.currentTime);
      master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), context.currentTime);
      master.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.35);
      window.setTimeout(() => void context.close(), 420);
    }
    contextRef.current = null;
    masterRef.current = null;
    setPlaying(false);
  };

  const start = async () => {
    const context = new AudioContext();
    const filter = context.createBiquadFilter();
    const master = context.createGain();
    filter.type = "lowpass";
    filter.frequency.value = 1850;
    filter.Q.value = 0.45;
    master.gain.value = 0.62;
    filter.connect(master).connect(context.destination);
    contextRef.current = context;
    masterRef.current = master;
    await context.resume();
    schedulePhrase(context, filter);
    timerRef.current = window.setInterval(() => schedulePhrase(context, filter), 16_000);
    setPlaying(true);
  };

  const toggle = () => {
    if (playing) stop();
    else void start();
  };

  useEffect(() => () => {
    if (timerRef.current !== null) window.clearInterval(timerRef.current);
    void contextRef.current?.close();
  }, []);

  return (
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
  );
}
