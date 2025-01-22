import React, { useState, useRef } from 'react';
import useVideoControls from '../hooks/useVideoControls';

interface VideoPlayerProps {
    src: string;
    onClose: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, onClose }) => {
    const [isPanelOpen, setIsPanelOpen] = useState(true);
    const videoRef = useRef<HTMLVideoElement>(null);
    const {
        isPlaying,
        currentTime,
        duration,
        volume,
        togglePlay,
        handleTimeUpdate,
        handleSeek,
        handleVolumeChange,
    } = useVideoControls(videoRef);

    const formatTime = (time: number): string => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = `/api/video?path=${encodeURIComponent(src)}`;
        link.download = src.split('/').pop() || 'video';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="fixed inset-0 bg-black/90 z-50 flex">
            {/* Side Panel */}
            <div className={`bg-gray-900 text-white transition-all duration-300 ease-in-out flex
                ${isPanelOpen ? 'w-64' : 'w-12'}`}>
                
                {/* Toggle Button */}
                <button 
                    onClick={() => setIsPanelOpen(!isPanelOpen)}
                    className="absolute left-2 top-2 p-2 hover:bg-gray-700 rounded-full"
                >
                    {isPanelOpen ? '◀' : '▶'}
                </button>

                {/* Panel Content */}
                <div className={`flex-1 p-4 mt-12 ${isPanelOpen ? 'block' : 'hidden'}`}>
                    <h3 className="text-xl font-semibold mb-4">Video Options</h3>
                    <div className="space-y-4">
                        <button
                            onClick={handleDownload}
                            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2"
                        >
                            <span>⬇️</span> Download
                        </button>
                        
                        {/* Volume Control */}
                        <div className="space-y-2">
                            <label className="text-sm text-gray-300">Volume</label>
                            <div className="flex items-center gap-2">
                                <span>🔊</span>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.1"
                                    value={volume}
                                    onChange={(e) => handleVolumeChange(Number(e.target.value))}
                                    className="flex-1"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 relative flex items-center justify-center">
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute right-4 top-4 text-white hover:text-gray-300 z-10"
                >
                    ✕
                </button>

                {/* Video Container */}
                <div className="w-full h-full p-8 flex items-center justify-center">
                    <div className="relative w-full h-full max-w-[90%] max-h-[90%] flex items-center justify-center">
                        {/* Video Wrapper to maintain aspect ratio */}
                        <div className="relative w-full h-0 pb-[56.25%]">
                            <video
                                ref={videoRef}
                                src={`/api/video?path=${encodeURIComponent(src)}`}
                                className="absolute top-0 left-0 w-full h-full object-contain rounded-lg shadow-2xl"
                                onTimeUpdate={handleTimeUpdate}
                            />
                            
                            {/* Video Controls Overlay */}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                                {/* Progress Bar */}
                                <div className="flex items-center gap-2 text-white mb-2">
                                    <span className="text-sm">{formatTime(currentTime)}</span>
                                    <input
                                        type="range"
                                        min="0"
                                        max={duration}
                                        value={currentTime}
                                        onChange={(e) => handleSeek(Number(e.target.value))}
                                        className="flex-1"
                                    />
                                    <span className="text-sm">{formatTime(duration)}</span>
                                </div>

                                {/* Play/Pause Button */}
                                <button
                                    onClick={togglePlay}
                                    className="text-white hover:text-gray-300 text-2xl"
                                >
                                    {isPlaying ? '⏸️' : '▶️'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoPlayer;
