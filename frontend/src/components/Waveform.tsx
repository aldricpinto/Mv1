"use client";

import { motion } from "framer-motion";

export function Waveform() {
  const bars = Array.from({ length: 24 });
  return (
    <div className="flex items-end justify-center gap-1 py-6">
      {bars.map((_, index) => (
        <motion.span
          key={index}
          className="inline-block w-1 rounded-full bg-white/70"
          animate={{
            height: [8, 48, 16],
            opacity: [0.3, 1, 0.6],
          }}
          transition={{
            repeat: Infinity,
            duration: 1.8,
            delay: index * 0.05,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
