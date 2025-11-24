"use client";

import { motion } from "framer-motion";
import { Waveform } from "./Waveform";

type Props = {
  onBegin: () => void;
};

export function WelcomePanel({ onBegin }: Props) {
  return (
    <motion.section
      className="rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-950 via-black to-zinc-900 p-10 text-white shadow-2xl"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <p className="text-sm uppercase tracking-[0.4em] text-zinc-400">The Plug</p>
      <h1 className="mt-4 text-4xl font-semibold leading-snug text-white sm:text-5xl">
        Your AI DJ<br />
        For the moods you can feel.
      </h1>
      <p className="mt-4 max-w-xl text-lg text-zinc-400">
        Share a vibe, a memory, or a craving. The Plug listens, interprets with Gemini, and crafts a playlist journey
        through YouTube Music with cinematic transitions.
      </p>
      <button
        className="btn-ripple mt-8 inline-flex items-center justify-center rounded-full border border-white/30 px-8 py-3 text-base font-medium tracking-wide text-white"
        onClick={onBegin}
      >
        Start vibing ?
      </button>
      <Waveform />
    </motion.section>
  );
}
