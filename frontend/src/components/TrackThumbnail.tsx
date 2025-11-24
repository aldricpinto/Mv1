import { useState } from "react";

type Props = {
    src?: string;
    alt: string;
    className?: string;
};

export function TrackThumbnail({ src, alt, className = "" }: Props) {
    const [hasError, setHasError] = useState(false);

    if (!src || hasError) {
        return (
            <div className={`flex items-center justify-center bg-retro-olive-dark border border-retro-neon/20 ${className}`}>
                <div className="flex items-center justify-center text-retro-neon/30">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M9 18V5l12-2v13" />
                        <circle cx="6" cy="18" r="3" />
                        <circle cx="18" cy="16" r="3" />
                    </svg>
                </div>
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={alt}
            className={className}
            onError={() => setHasError(true)}
        />
    );
}
