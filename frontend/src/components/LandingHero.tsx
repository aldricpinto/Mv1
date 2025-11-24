"use client";

import { GoogleLogin } from "@react-oauth/google";
import { motion, useScroll, useTransform, useMotionTemplate, useMotionValue } from "framer-motion";
import { useState, useRef, useEffect } from "react";

type Props = {
  onCredential: (credential: string) => void;
  clientIdMissing: boolean;
};

const LOGOS = [
  "Billie Eilish", "The Kid LAROI", "Olivia Rodrigo", "Lil Nas X",
  "Tate McRae", "Central Cee", "Ice Spice", "Dominic Fike",
  "PinkPantheress", "Conan Gray"
];

const CARDS = [
  { title: "PERSONALIZED", desc: "CURATED JUST FOR YOU", color: "from-retro-neon/20 to-black" },
  { title: "TIMELESS", desc: "CLASSIC VIBES, MODERN TECH", color: "from-retro-orange/20 to-black" },
  { title: "DYNAMIC", desc: "EVOLVING WITH YOUR MOOD", color: "from-retro-olive/20 to-black" },
];

export function LandingHero({ onCredential, clientIdMissing }: Props) {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const scale = useTransform(scrollY, [0, 300], [1, 0.9]);

  // Flashlight effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div
      className="relative min-h-screen flex flex-col items-center overflow-hidden bg-retro-olive"
      onMouseMove={handleMouseMove}
    >
      {/* Retro Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(204,255,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(204,255,0,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0),rgba(26,28,20,0.8))] pointer-events-none" />

      <motion.div
        style={{ opacity, scale }}
        className="relative z-10 flex flex-col items-center justify-center min-h-[90vh] text-center px-4"
      >
        {/* M-800 Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="h-16 w-16 bg-retro-neon flex items-center justify-center text-black font-black text-sm shadow-[0_0_20px_rgba(204,255,0,0.4)]">
            M-800
          </div>
        </motion.div>

        {/* Staggered Text Reveal */}
        <div className="overflow-hidden mb-4">
          <motion.h1
            className="text-6xl md:text-9xl font-black tracking-tighter text-retro-neon leading-none"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.1 } }
            }}
          >
            {"THE PLUG".split("").map((char, i) => (
              <motion.span
                key={i}
                variants={{
                  hidden: { y: "100%" },
                  visible: { y: 0 }
                }}
                transition={{ duration: 0.8, ease: [0.2, 0.65, 0.3, 0.9] }}
                className="inline-block"
              >
                {char === " " ? "\u00A0" : char}
              </motion.span>
            ))}
          </motion.h1>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-xl md:text-2xl font-mono tracking-[0.3em] text-retro-neon/60 uppercase mb-12"
        >
          AUDIO INTELLIGENCE
        </motion.p>

        {/* Google Login Button Wrapper */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1 }}
          className="relative group"
        >
          {clientIdMissing ? (
            <div className="rounded-none border border-retro-orange/30 bg-retro-orange/10 p-4 text-retro-orange font-mono text-xs uppercase tracking-widest">
              <p>[ ERROR: MISSING_CLIENT_ID ]</p>
            </div>
          ) : (
            <div className="relative p-[2px] overflow-hidden bg-retro-neon/20">
              <div className="absolute inset-0 border border-retro-neon/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative bg-black p-1">
                <GoogleLogin
                  onSuccess={(resp) => {
                    if (resp.credential) onCredential(resp.credential);
                  }}
                  onError={() => console.error("Login Failed")}
                  theme="filled_black"
                  shape="rectangular"
                  size="large"
                  text="continue_with"
                />
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Marquee Section */}
      <div className="w-full py-8 border-y border-retro-neon/10 bg-black/20 backdrop-blur-sm overflow-hidden relative z-10">
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-retro-olive to-transparent z-20" />
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-retro-olive to-transparent z-20" />

        <div className="flex animate-marquee whitespace-nowrap">
          {[...LOGOS, ...LOGOS, ...LOGOS].map((logo, i) => (
            <span key={i} className="mx-12 text-xl font-mono text-retro-neon/40 uppercase tracking-widest">
              {logo}
            </span>
          ))}
        </div>
      </div>

      {/* 3-Card Carousel with Flashlight */}
      <div className="relative z-10 w-full max-w-6xl mx-auto py-32 px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {CARDS.map((card, i) => (
            <Card key={i} {...card} mouseX={mouseX} mouseY={mouseY} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Card({ title, desc, color, mouseX, mouseY, index }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.2 }}
      className="group relative bg-black/40 border border-retro-neon/20 p-8 overflow-hidden hover:border-retro-neon/50 transition-colors duration-500"
    >
      <motion.div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(204, 255, 0, 0.1),
              transparent 80%
            )
          `,
        }}
      />
      <div className={`absolute inset-0 bg-gradient-to-b ${color} opacity-10`} />

      <h3 className="relative text-2xl font-black text-retro-neon mb-2 uppercase tracking-tight">{title}</h3>
      <p className="relative text-retro-neon/60 font-mono text-xs tracking-widest">{desc}</p>

      {/* Corner Accents */}
      <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-retro-neon/30" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-retro-neon/30" />
    </motion.div>
  );
}
