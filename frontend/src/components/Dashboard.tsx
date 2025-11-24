"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { PromptForm } from "./PromptForm";
import { PlaylistColumn } from "./PlaylistColumn";
import { ArchiveDrawer } from "./ArchiveDrawer";
import type { MuseSession, PlaylistResponse, Track } from "@/types/muse";
import { createPlaylist, clearHistory, getHistory } from "@/lib/api";

type Props = {
    user: MuseSession;
    onSignOut: () => void;
    onPlay: (track: Track, playlist: Track[]) => void;
    currentTrack: Track | null;
    playlist: PlaylistResponse | null;
    setPlaylist: (p: PlaylistResponse | null) => void;
};

export function Dashboard({ user, onSignOut, onPlay, currentTrack, playlist, setPlaylist }: Props) {
    const [history, setHistory] = useState<PlaylistResponse[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [isArchiveOpen, setIsArchiveOpen] = useState(false);
    const [theme, setTheme] = useState<"dark" | "light">("dark");

    useEffect(() => {
        loadHistory();
        // Initialize theme from system preference or default to dark
        document.documentElement.setAttribute("data-theme", "dark");
    }, [user.user_id]);

    const toggleTheme = () => {
        const newTheme = theme === "dark" ? "light" : "dark";
        setTheme(newTheme);
        document.documentElement.setAttribute("data-theme", newTheme);
    };

    async function loadHistory() {
        try {
            const hist = await getHistory(user.user_id);
            setHistory(hist);
        } catch (e) {
            console.error("Failed to load history", e);
        }
    }

    async function handleCreatePlaylist() {
        if (!playlist) return;

        if (!user.has_youtube_auth) {
            alert("YouTube Music is not linked. Please reconnect.");
            return;
        }

        setIsCreating(true);
        try {
            const videoIds = playlist.tracks.map(t => t.video_id).filter((id): id is string => !!id);
            if (videoIds.length === 0) {
                throw new Error("No valid tracks to save.");
            }
            const res = await createPlaylist(user.user_id, `The Plug: ${playlist.mood.playlist_title || playlist.mood.primary_mood}`, videoIds);

            // Show success message with link
            const playlistUrl = `https://music.youtube.com/playlist?list=${res.playlist_id}`;
            if (confirm("Playlist created successfully! Open in YouTube Music?")) {
                window.open(playlistUrl, "_blank");
            }
        } catch (e: any) {
            console.error("Playlist creation failed:", e);
            alert(`Failed to create playlist: ${e.message || "Unknown error"}`);
        } finally {
            setIsCreating(false);
        }
    }

    async function handleClearHistory() {
        if (confirm("Clear all history?")) {
            await clearHistory(user.user_id);
            setHistory([]);
        }
    }

    const { scrollY } = useScroll();
    const backgroundY = useTransform(scrollY, [0, 500], [0, 200]);
    const backgroundOpacity = useTransform(scrollY, [0, 300], [0.05, 0]);

    return (
        <div className="min-h-screen pb-40 relative bg-retro-olive transition-colors duration-500 overflow-hidden">
            {/* Decorative Grid Lines */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-24 left-0 right-0 h-px bg-retro-neon/10" />
                <div className="absolute top-0 bottom-0 left-12 w-px bg-retro-neon/10" />
                <div className="absolute top-0 bottom-0 right-12 w-px bg-retro-neon/10" />
                {/* Grid Background */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(204,255,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(204,255,0,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
            </div>

            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 py-4 bg-retro-olive/95 backdrop-blur-md border-b border-retro-neon/20 transition-colors duration-500">
                {/* Left: Branding / Device ID */}
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-retro-neon flex items-center justify-center text-black font-black text-xs shadow-[0_0_15px_rgba(204,255,0,0.4)]">
                        M-800
                    </div>
                    <div className="flex flex-col">
                        <span className="text-2xl font-black tracking-tighter text-retro-neon leading-none">
                            THE PLUG
                        </span>
                        <span className="text-[10px] font-mono text-retro-neon/60 tracking-[0.2em] leading-none">
                            AUDIO INTELLIGENCE
                        </span>
                    </div>
                </div>

                {/* Right: Control Deck */}
                <div className="flex items-center border border-retro-neon/30 bg-black/20 backdrop-blur-sm">
                    {/* System Status */}
                    <div className="hidden md:flex items-center gap-3 px-4 py-2 border-r border-retro-neon/30 text-[10px] font-mono text-retro-neon/70">
                        <span>SYS.ONLINE</span>
                        <span className="w-1.5 h-1.5 bg-retro-neon rounded-full animate-pulse shadow-[0_0_5px_currentColor]" />
                    </div>

                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="px-4 py-2 border-r border-retro-neon/30 text-[10px] font-mono text-retro-neon hover:bg-retro-neon hover:text-black transition-all uppercase tracking-widest"
                    >
                        {theme === "dark" ? "LIGHT" : "DARK"}
                    </button>

                    {/* Archive Toggle */}
                    <button
                        onClick={() => setIsArchiveOpen(true)}
                        className="px-4 py-2 border-r border-retro-neon/30 text-[10px] font-mono text-retro-neon hover:bg-retro-neon hover:text-black transition-all uppercase tracking-widest flex items-center gap-2"
                    >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
                        ARCHIVE
                    </button>

                    {/* User Profile */}
                    <div className="flex items-center gap-3 px-4 py-2 border-r border-retro-neon/30 bg-retro-neon/5">
                        <img src={user.picture} alt={user.name} className="h-5 w-5 grayscale opacity-80" />
                        <span className="text-[10px] font-mono text-retro-neon uppercase tracking-widest">{user.name}</span>
                    </div>

                    {/* Eject */}
                    <button
                        onClick={onSignOut}
                        className="px-4 py-2 text-[10px] font-mono text-retro-orange hover:bg-retro-orange hover:text-black transition-all uppercase tracking-widest flex items-center gap-2"
                    >
                        EJECT
                    </button>
                </div>
            </header>

            <main className={`container mx-auto px-4 md:px-16 relative z-10 transition-all duration-500 ${playlist ? 'pt-32' : 'h-[calc(100vh-100px)] flex flex-col justify-center'}`}>
                {/* Centered Prompt Section */}
                <div className={`mx-auto w-full max-w-2xl text-center relative ${playlist ? 'mb-12' : 'mb-0'}`}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-12 relative"
                    >
                        {/* Background Text */}


                        <h2 className="text-3xl md:text-4xl font-bold text-white relative z-10 uppercase tracking-[0.2em] drop-shadow-lg">
                            What's <span className="text-retro-neon">the word</span>
                        </h2>
                        <div className="w-24 h-1 bg-retro-neon mx-auto mt-6 shadow-[0_0_10px_rgba(204,255,0,0.5)]" />
                    </motion.div>

                    <div className="relative z-20">
                        <PromptForm
                            onSubmit={(p) => {
                                setPlaylist(p);
                                loadHistory();
                            }}
                            userId={user.user_id}
                        />
                    </div>
                </div>

                {/* Results Section */}
                <AnimatePresence mode="wait">
                    {playlist && (
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 40 }}
                            className="grid grid-cols-1 gap-12 lg:grid-cols-12"
                        >
                            {/* Left: Mood & Actions */}
                            <div className="lg:col-span-4 space-y-8">
                                <div className="glass-panel p-6 relative overflow-hidden bg-retro-surface/40 border border-retro-neon/20">
                                    <div className="absolute top-0 right-0 bg-retro-orange text-black text-xs font-bold px-2 py-1">
                                        REC
                                    </div>
                                    <h2 className="text-3xl font-bold text-retro-neon mb-2 uppercase transform scale-y-110">
                                        {playlist.mood.playlist_title || playlist.mood.primary_mood}
                                    </h2>
                                    <div className="h-px w-full bg-retro-neon/50 mb-4" />
                                    <p className="text-sm font-mono text-zinc-300 mb-6 leading-relaxed">
                                        {playlist.mood.narrative}
                                    </p>

                                    <div className="flex flex-wrap gap-2 mb-8">
                                        {playlist.mood.keywords.map((k, i) => (
                                            <span key={i} className="text-xs font-mono text-retro-neon border border-retro-neon/30 px-2 py-1 bg-retro-neon/5">
                                                {k.toUpperCase()}
                                            </span>
                                        ))}
                                    </div>

                                    <button
                                        onClick={handleCreatePlaylist}
                                        disabled={isCreating}
                                        className="w-full btn-primary flex items-center justify-center gap-2"
                                    >
                                        {isCreating ? "PROCESSING..." : "SAVE TO TAPE"}
                                    </button>
                                </div>
                            </div>

                            {/* Right: Tracks */}
                            <div className="lg:col-span-8">
                                <PlaylistColumn
                                    playlist={playlist}
                                    onSelect={(track) => onPlay(track, playlist.tracks)}
                                    currentTrack={currentTrack}
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </main>

            {/* Archive Drawer */}
            <ArchiveDrawer
                isOpen={isArchiveOpen}
                onClose={() => setIsArchiveOpen(false)}
                history={history}
                onSelect={setPlaylist}
                onClear={handleClearHistory}
            />
        </div>
    );
}
