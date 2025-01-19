import React, { useRef, useState } from 'react';
import useVideoControls from '../hooks/useVideoControls';

interface VideoPlayerProps {
    src: string;
    onClose: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, onClose }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isControlsVisible, setIsControlsVisible] = useState(true);
    const {
        isPlaying,
        currentTime,
        duration,
        volume,
        togglePlay,
        handleTimeUpdate,
        handleVolumeChange,
        handleSeek,
    } = useVideoControls(videoRef);

    // Convert local file path to URL
    const videoUrl = `http://localhost:3000/api/video?path=${encodeURIComponent(src)}`;

    // Format time in MM:SS
    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <div 
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
            onMouseMove={() => {
                setIsControlsVisible(true);
                // Hide controls after 2 seconds of no mouse movement
                setTimeout(() => setIsControlsVisible(false), 2000);
            }}
        >
            <div className="relative w-full max-w-5xl aspect-video">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute -top-10 right-0 text-white/80 hover:text-white text-xl z-10 
                             transition-colors duration-200 px-4 py-2 rounded-lg hover:bg-white/10"
                >
                    ✕
                </button>
                
                <div className="relative h-full group">
                    {/* Video element */}
                    <video
                        ref={videoRef}
                        src={videoUrl}
                        className="w-full h-full object-contain"
                        onTimeUpdate={handleTimeUpdate}
                    />
                    
                    {/* Play/Pause overlay on video click */}
                    <div 
                        className="absolute inset-0 flex items-center justify-center cursor-pointer"
                        onClick={togglePlay}
                    >
                        {!isPlaying && (
                            <span className="text-white/80 text-6xl opacity-0 group-hover:opacity-100 
                                         transition-opacity duration-200">
                                ▶️
                            </span>
                        )}
                    </div>

                    {/* Controls overlay */}
                    <div 
                        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent 
                                  pt-20 pb-4 px-6 transition-opacity duration-300
                                  ${isControlsVisible ? 'opacity-100' : 'opacity-0'}`}
                    >
                        <div className="flex flex-col gap-3">
                            {/* Progress bar */}
                            <div className="flex items-center gap-3 text-white/90 text-sm">
                                <span className="w-16 text-center">{formatTime(currentTime)}</span>
                                <div className="relative flex-grow h-1 group">
                                    <input
                                        type="range"
                                        min="0"
                                        max={duration}
                                        value={currentTime}
                                        onChange={(e) => handleSeek(Number(e.target.value))}
                                        className="absolute inset-0 w-full appearance-none bg-white/30 rounded-full
                                                 hover:bg-white/40 transition-all duration-200
                                                 [&::-webkit-slider-thumb]:appearance-none
                                                 [&::-webkit-slider-thumb]:w-3
                                                 [&::-webkit-slider-thumb]:h-3
                                                 [&::-webkit-slider-thumb]:rounded-full
                                                 [&::-webkit-slider-thumb]:bg-white
                                                 [&::-webkit-slider-thumb]:opacity-0
                                                 hover:[&::-webkit-slider-thumb]:opacity-100"
                                    />
                                </div>
                                <span className="w-16 text-center">{formatTime(duration)}</span>
                            </div>

                            {/* Controls */}
                            <div className="flex items-center gap-6">
                                {/* Play/Pause button */}
                                <button
                                    onClick={togglePlay}
                                    className="text-white/90 hover:text-white text-2xl transition-colors duration-200"
                                >
                                    {isPlaying ? '⏸️' : '▶️'}
                                </button>

                                {/* Volume control */}
                                <div className="flex items-center gap-2 group">
                                    <span className="text-white/90 group-hover:text-white transition-colors duration-200">
                                        🔊
                                    </span>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.1"
                                        value={volume}
                                        onChange={(e) => handleVolumeChange(Number(e.target.value))}
                                        className="w-0 group-hover:w-20 transition-all duration-200
                                                 appearance-none bg-white/30 h-1 rounded-full
                                                 [&::-webkit-slider-thumb]:appearance-none
                                                 [&::-webkit-slider-thumb]:w-3
                                                 [&::-webkit-slider-thumb]:h-3
                                                 [&::-webkit-slider-thumb]:rounded-full
                                                 [&::-webkit-slider-thumb]:bg-white"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoPlayer;
