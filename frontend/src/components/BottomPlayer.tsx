"use client";

import { useState, useEffect } from "react";
import YouTube, { YouTubeEvent } from "react-youtube";
import type { Track } from "@/types/muse";
import { motion, AnimatePresence } from "framer-motion";

import { TrackThumbnail } from "./TrackThumbnail";

type Props = {
    track: Track;
    playlist: Track[];
    onNext: () => void;
    onPrev: () => void;
    onShuffle: () => void;
};

export function BottomPlayer({ track, playlist, onNext, onPrev, onShuffle }: Props) {
    const [player, setPlayer] = useState<any>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(100);
    const [showQueue, setShowQueue] = useState(false);

    useEffect(() => {
        if (!player) return;
        const interval = setInterval(() => {
            const currentTime = player.getCurrentTime();
            const duration = player.getDuration();
            if (duration) {
                setDuration(duration);
                setProgress((currentTime / duration) * 100);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [player]);

    const togglePlay = () => {
        if (!player) return;
        if (isPlaying) {
            player.pauseVideo();
        } else {
            player.playVideo();
        }
        setIsPlaying(!isPlaying);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const [isMuted, setIsMuted] = useState(false);
    const [prevVolume, setPrevVolume] = useState(100);

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!player || !duration) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = x / rect.width;
        const newTime = percentage * duration;

        player.seekTo(newTime);
        setProgress(percentage * 100);
    };

    const toggleMute = () => {
        if (!player) return;
        if (isMuted) {
            player.unMute();
            player.setVolume(prevVolume);
            setVolume(prevVolume);
            setIsMuted(false);
        } else {
            setPrevVolume(volume);
            player.mute();
            setVolume(0);
            setIsMuted(true);
        }
    };

    return (
        <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-retro-olive border-t-4 border-retro-olive-dark shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
        >
            {/* Cassette Window Decoration */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-8 bg-retro-olive-dark rounded-t-xl border-t border-x border-retro-neon/20 flex items-center justify-center gap-4">
                <div className="w-2 h-2 rounded-full bg-retro-orange animate-pulse" />
                <span className="text-[10px] font-mono text-retro-neon uppercase tracking-widest">Tape Running</span>
                <div className="w-2 h-2 rounded-full bg-retro-orange animate-pulse" />
            </div>

            <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-8">
                {/* Track Info */}
                <div className="flex items-center gap-4 w-1/3">
                    <div className="relative w-16 h-16 bg-black border border-retro-neon/30 overflow-hidden group">
                        <TrackThumbnail
                            src={track.thumbnail_url}
                            alt={track.title}
                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                        />
                        {/* Scanline overlay */}
                        <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] pointer-events-none opacity-50" />
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] bg-retro-neon text-black px-1 font-bold">A-SIDE</span>
                            <h3 className="font-bold text-white truncate uppercase tracking-tight">{track.title}</h3>
                        </div>
                        <p className="text-xs font-mono text-retro-neon truncate">{track.artist}</p>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex flex-col items-center gap-2 w-1/3">
                    <div className="flex items-center gap-4">
                        <button onClick={onPrev} className="p-2 text-retro-neon hover:text-white transition-colors">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" /></svg>
                        </button>

                        <button
                            onClick={togglePlay}
                            className="w-12 h-12 bg-retro-orange text-black flex items-center justify-center hover:bg-[#ff571a] transition-colors shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none"
                        >
                            {isPlaying ? (
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                            ) : (
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                            )}
                        </button>

                        <button onClick={onNext} className="p-2 text-retro-neon hover:text-white transition-colors">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" /></svg>
                        </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full flex items-center gap-3 text-[10px] font-mono text-retro-neon">
                        <span>{formatTime((progress / 100) * duration)}</span>
                        <div
                            className="flex-1 h-2 bg-black border border-retro-olive-dark relative group cursor-pointer"
                            onClick={handleSeek}
                        >
                            <div
                                className="absolute top-0 left-0 bottom-0 bg-retro-neon/50 pointer-events-none"
                                style={{ width: `${progress}%` }}
                            />
                            <div
                                className="absolute top-0 bottom-0 w-1 bg-retro-neon pointer-events-none"
                                style={{ left: `${progress}%` }}
                            />
                        </div>
                        <span>{formatTime(duration)}</span>
                    </div>
                </div>

                {/* Volume & Queue */}
                <div className="flex items-center justify-end gap-4 w-1/3">
                    <div className="flex items-center gap-2">
                        <button onClick={toggleMute} className="text-retro-neon hover:text-white transition-colors">
                            {isMuted || volume === 0 ? (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>
                            ) : (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon></svg>
                            )}
                        </button>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={volume}
                            onChange={(e) => {
                                const v = parseInt(e.target.value);
                                setVolume(v);
                                player?.setVolume(v);
                                if (v > 0 && isMuted) setIsMuted(false);
                            }}
                            className="w-24 h-1 bg-black appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-retro-neon"
                        />
                    </div>
                    <button
                        onClick={() => setShowQueue(!showQueue)}
                        className={`transition-colors ${showQueue ? "text-retro-orange" : "text-retro-neon hover:text-white"}`}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                    </button>
                </div>
            </div>

            {/* Hidden YouTube Player */}
            <div className="hidden">
                <YouTube
                    videoId={track.video_id}
                    opts={{ playerVars: { autoplay: 1, controls: 0 } }}
                    onReady={(e: YouTubeEvent) => {
                        setPlayer(e.target);
                        setIsPlaying(true);
                        e.target.setVolume(volume);
                    }}
                    onStateChange={(e: YouTubeEvent) => setIsPlaying(e.data === 1)}
                    onEnd={onNext}
                />
            </div>

            {/* Queue Overlay */}
            <AnimatePresence>
                {showQueue && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="absolute bottom-full right-4 mb-4 w-80 bg-retro-olive border border-retro-neon shadow-xl p-4 max-h-96 overflow-y-auto"
                    >
                        <h4 className="text-xs font-bold text-retro-neon uppercase mb-4 border-b border-retro-neon/30 pb-2">Tape Sequence</h4>
                        <div className="space-y-2">
                            {playlist.map((t, i) => (
                                <div
                                    key={`${t.video_id}-${i}`}
                                    className={`flex items-center gap-3 p-2 text-xs font-mono cursor-pointer hover:bg-retro-neon/10 ${t.video_id === track.video_id ? "text-retro-orange" : "text-zinc-400"}`}
                                >
                                    <span className="w-4">{i + 1}</span>
                                    <span className="truncate flex-1">{t.title}</span>
                                    <span>{t.duration || "--:--"}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
