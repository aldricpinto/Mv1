"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMuseFlow } from "@/hooks/useMuseFlow";
import { LandingHero } from "@/components/LandingHero";
import { Dashboard } from "@/components/Dashboard";
import { BottomPlayer } from "@/components/BottomPlayer";
import { YoutubeLinker } from "@/components/YoutubeLinker";

const googleMissing = !process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export default function Home() {
  const {
    user,
    authReady,
    handleGoogleCredential,
    linkYoutube,
    logout,
    playlist,
    setPlaylist,
    currentTrack,
    selectTrack,
  } = useMuseFlow();

  // Loading State
  if (!authReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-blue-500 tracking-widest uppercase font-medium"
        >
          Loading The Plug...
        </motion.div>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen bg-black text-white selection:bg-blue-500/30 selection:text-blue-200">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.1),transparent_50%)]" />

      <AnimatePresence mode="wait">
        {!user ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <LandingHero
              onCredential={handleGoogleCredential}
              clientIdMissing={googleMissing}
            />
          </motion.div>
        ) : !user.has_youtube_auth ? (
          <motion.div
            key="yt-link"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex min-h-screen items-center justify-center p-4"
          >
            <div className="relative max-w-md w-full bg-retro-olive border-2 border-retro-olive-dark p-8 shadow-[0_0_40px_rgba(204,255,0,0.1)]">
              {/* Decorative Corner */}
              <div className="absolute top-0 right-0 w-8 h-8 bg-retro-neon clip-path-corner" style={{ clipPath: "polygon(100% 0, 0 0, 100% 100%)" }} />

              <div className="mx-auto mb-8 h-20 w-20 bg-black border border-retro-neon/30 flex items-center justify-center relative group">
                <div className="absolute inset-0 bg-retro-neon/10 animate-pulse" />
                <svg viewBox="0 0 24 24" className="h-10 w-10 text-retro-orange relative z-10" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.005 3.005 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
              </div>

              <h2 className="text-2xl font-bold text-white mb-4 uppercase tracking-widest text-center">
                Link <span className="text-retro-neon">Database</span>
              </h2>

              <p className="text-zinc-400 mb-8 text-center font-mono text-sm leading-relaxed">
                ACCESS REQUIRED: Connect YouTube Music to enable sonic generation and archival protocols.
              </p>

              <YoutubeLinker userId={user.user_id} onLink={linkYoutube} />

              <div className="mt-8 pt-6 border-t border-retro-neon/20 text-center">
                <button onClick={logout} className="text-xs font-mono text-retro-orange hover:text-white transition-colors uppercase tracking-widest">
                  [ ABORT SEQUENCE ]
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Dashboard
              user={user}
              onSignOut={logout}
              onPlay={(track, playlistTracks) => {
                selectTrack(track);
              }}
              currentTrack={currentTrack}
              playlist={playlist}
              setPlaylist={setPlaylist}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Player */}
      {currentTrack && playlist && (
        <BottomPlayer
          track={currentTrack}
          playlist={playlist.tracks}
          onNext={() => {
            const idx = playlist.tracks.findIndex(t => t.video_id === currentTrack.video_id);
            if (idx < playlist.tracks.length - 1) selectTrack(playlist.tracks[idx + 1]);
          }}
          onPrev={() => {
            const idx = playlist.tracks.findIndex(t => t.video_id === currentTrack.video_id);
            if (idx > 0) selectTrack(playlist.tracks[idx - 1]);
          }}
          onShuffle={() => {
            const shuffled = [...playlist.tracks].sort(() => Math.random() - 0.5);
            setPlaylist({ ...playlist, tracks: shuffled });
          }}
        />
      )}
    </main>
  );
}
