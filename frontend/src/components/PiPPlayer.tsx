"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import YouTube, { YouTubeEvent } from "react-youtube";
import type { Track } from "@/types/muse";

interface Props {
    track: Track | null;
    playlist?: Track[];
    onClose: () => void;
    onNext?: () => void;
    onPrev?: () => void;
}

export function PiPPlayer({ track, playlist = [], onClose, onNext, onPrev }: Props) {
    const [expanded, setExpanded] = useState(true);
    const [visible, setVisible] = useState(false);
    const [isPlaying, setIsPlaying] = useState(true);
    const [player, setPlayer] = useState<any>(null);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        if (track) {
            setVisible(true);
            setExpanded(true);
        }
    }, [track]);

    // Progress poller
    useEffect(() => {
        if (!player || !isPlaying) return;
        const interval = setInterval(() => {
            const curr = player.getCurrentTime();
            const dur = player.getDuration();
            setProgress(curr);
            setDuration(dur);
        }, 1000);
        return () => clearInterval(interval);
    }, [player, isPlaying]);

    if (!visible || !track) return null;

    const togglePlay = () => {
        if (!player) return;
        if (isPlaying) {
            player.pauseVideo();
        } else {
            player.playVideo();
        }
        setIsPlaying(!isPlaying);
    };

    const formatTime = (secs: number) => {
        if (!secs) return "0:00";
        const m = Math.floor(secs / 60);
        const s = Math.floor(secs % 60);
        return `${m}:${s.toString().padStart(2, "0")}`;
    };

    const handleOpenPlaylist = () => {
        if (!playlist.length) return;
        const ids = playlist.map(t => t.video_id).join(",");
        window.open(`https://www.youtube.com/watch_videos?video_ids=${ids}`, "_blank");
    };

    return (
        <AnimatePresence>
            <motion.div
                drag
                dragMomentum={false}
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className={`fixed bottom-6 right-6 z-50 overflow-hidden rounded-3xl border border-gold/20 bg-black/90 shadow-2xl backdrop-blur transition-all duration-500 ${expanded ? "w-[360px]" : "w-[300px]"
                    }`}
            >
                {/* Header / Controls */}
                <div className="flex items-center justify-between px-4 py-3 text-white bg-gradient-to-r from-zinc-900 to-black border-b border-white/5 cursor-move">
                    <div className="flex items-center gap-3 overflow-hidden">
                        {/* Mini Art if collapsed */}
                        {!expanded && (
                            <div className="h-8 w-8 rounded-full bg-gold/20 flex items-center justify-center text-xs text-gold">
                                ♪
                            </div>
                        )}
                        <div className="min-w-0">
                            <p className="text-xs uppercase tracking-[0.2em] text-gold truncate">Now Playing</p>
                            <p className="text-sm font-semibold truncate">{track.title}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setExpanded(!expanded)}
                            className="p-2 text-zinc-400 hover:text-white transition-colors"
                        >
                            {expanded ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 14 10 14 10 20"></polyline><polyline points="20 10 14 10 14 4"></polyline></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>
                            )}
                        </button>
                        <button
                            onClick={() => {
                                setVisible(false);
                                onClose();
                            }}
                            className="p-2 text-zinc-400 hover:text-red-400 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </div>
                </div>

                {/* Video Area */}
                <motion.div
                    animate={{ height: expanded ? "auto" : 0, opacity: expanded ? 1 : 0 }}
                    className="overflow-hidden bg-black"
                >
                    <div className="aspect-video w-full relative">
                        <YouTube
                            videoId={track.video_id}
                            className="h-full w-full"
                            iframeClassName="h-full w-full"
                            opts={{
                                playerVars: {
                                    autoplay: 1,
                                    modestbranding: 1,
                                    controls: 0,
                                    disablekb: 1,
                                },
                            }}
                            onReady={(e: YouTubeEvent) => {
                                setPlayer(e.target);
                                setIsPlaying(true);
                            }}
                            onStateChange={(e: YouTubeEvent) => {
                                setIsPlaying(e.data === 1);
                            }}
                            onEnd={onNext}
                        />
                        {/* Overlay to prevent direct interaction if desired, or allow it */}
                    </div>

                    {/* Progress Bar */}
                    <div className="px-4 py-3">
                        <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden cursor-pointer" onClick={(e) => {
                            if (!player || !duration) return;
                            const rect = e.currentTarget.getBoundingClientRect();
                            const x = e.clientX - rect.left;
                            const pct = x / rect.width;
                            player.seekTo(pct * duration, true);
                        }}>
                            <div
                                className="h-full bg-gold rounded-full transition-all duration-300"
                                style={{ width: `${(progress / (duration || 1)) * 100}%` }}
                            />
                        </div>
                        <div className="flex justify-between mt-1 text-[10px] text-zinc-500">
                            <span>{formatTime(progress)}</span>
                            <span>{formatTime(duration)}</span>
                        </div>

                        {/* Controls */}
                        <div className="flex justify-center items-center gap-6 mt-2 pb-2">
                            <button onClick={onPrev} className="text-zinc-400 hover:text-white disabled:opacity-30" disabled={!onPrev}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="19 20 9 12 19 4 19 20"></polygon><line x1="5" y1="19" x2="5" y2="5"></line></svg>
                            </button>

                            <button
                                onClick={togglePlay}
                                className="h-10 w-10 rounded-full bg-gold text-black flex items-center justify-center hover:scale-105 transition-transform"
                            >
                                {isPlaying ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="0" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="0" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                                )}
                            </button>

                            <button onClick={onNext} className="text-zinc-400 hover:text-white disabled:opacity-30" disabled={!onNext}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 4 15 12 5 20 5 4"></polygon><line x1="19" y1="5" x2="19" y2="19"></line></svg>
                            </button>
                        </div>

                        {/* External Links */}
                        <div className="flex justify-center gap-4 mt-2">
                            <a
                                href={`https://music.youtube.com/watch?v=${track.video_id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] uppercase tracking-widest text-gold/60 hover:text-gold hover:underline flex items-center gap-1"
                            >
                                <span>Song</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                            </a>

                            {playlist.length > 0 && (
                                <button
                                    onClick={handleOpenPlaylist}
                                    className="text-[10px] uppercase tracking-widest text-gold/60 hover:text-gold hover:underline flex items-center gap-1"
                                >
                                    <span>Playlist</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                                </button>
                            )}
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
