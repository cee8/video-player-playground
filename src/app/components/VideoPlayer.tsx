import React, { useRef } from 'react';
import useVideoControls from '../hooks/useVideoControls';

interface VideoPlayerProps {
    src: string;
    onClose: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, onClose }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
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

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="relative w-full max-w-4xl">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white text-xl z-10"
                >
                    ✕
                </button>
                
                <div className="relative">
                    <video
                        ref={videoRef}
                        src={videoUrl}
                        className="w-full"
                        controls
                        autoPlay
                    />
                </div>
            </div>
        </div>
    );
};

export default VideoPlayer;
