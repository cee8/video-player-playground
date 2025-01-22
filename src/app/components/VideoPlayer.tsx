import React, { useState, useRef, useEffect } from 'react';
import useVideoControls from '../hooks/useVideoControls';

interface VideoPlayerProps {
    src: string;
    onClose: () => void;
    startPosition?: DOMRect;  // Add position info
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, onClose, startPosition }) => {
    const [isPanelOpen, setIsPanelOpen] = useState(true);
    const [isVisible, setIsVisible] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const {
        isPlaying,
        currentTime,
        duration,
        volume,
        togglePlay,
        handleTimeUpdate,
        handleSeek,
        handleVolumeChange,
        handleKeyPress,
    } = useVideoControls(videoRef);

    // Calculate initial position styles
    const getInitialStyles = () => {
        if (!startPosition) return {};
        
        // Calculate the scale and translate values
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        
        // Calculate scale while preserving aspect ratio
        const targetAspectRatio = startPosition.width / startPosition.height;
        const viewportAspectRatio = viewportWidth / viewportHeight;
        
        let scale;
        if (targetAspectRatio > viewportAspectRatio) {
            // Width is the constraining factor
            scale = startPosition.width / viewportWidth;
        } else {
            // Height is the constraining factor
            scale = startPosition.height / viewportHeight;
        }
        
        // Calculate center points for the thumbnail
        const thumbnailCenterX = startPosition.left + (startPosition.width / 2);
        const thumbnailCenterY = startPosition.top + (startPosition.height / 2);
        
        return {
            position: 'fixed' as const,
            top: '0',
            left: '0',
            width: '100vw',
            height: '100vh',
            transform: `translate3d(${thumbnailCenterX}px, ${thumbnailCenterY}px, 0) scale3d(${scale}, ${scale}, 1)`,
            transformOrigin: '50% 50%'
        };
    };

    const [styles, setStyles] = useState<React.CSSProperties>(getInitialStyles());

    // Trigger entrance animation after mount
    useEffect(() => {
        if (startPosition) {
            // Set initial position without animation
            const initialStyles = getInitialStyles();
            setStyles({
                ...initialStyles,
                transition: 'none'
            });
            
            // Force a reflow
            document.body.offsetHeight;
            
            // Animate to center
            requestAnimationFrame(() => {
                setStyles({
                    position: 'fixed',
                    top: '0',
                    left: '0',
                    width: '100vw',
                    height: '100vh',
                    transform: 'translate3d(0, 0, 0) scale3d(1, 1, 1)',
                    transformOrigin: '50% 50%',
                    transition: 'transform 400ms cubic-bezier(0.4, 0, 0.2, 1)'
                });
                setIsVisible(true);
            });
        } else {
            setIsVisible(true);
        }
    }, [startPosition]);

    const handleClose = () => {
        if (!startPosition) {
            setIsVisible(false);
            setTimeout(onClose, 400);
            return;
        }

        // Calculate final position
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        
        // Calculate scale while preserving aspect ratio
        const targetAspectRatio = startPosition.width / startPosition.height;
        const viewportAspectRatio = viewportWidth / viewportHeight;
        
        let scale;
        if (targetAspectRatio > viewportAspectRatio) {
            scale = startPosition.width / viewportWidth;
        } else {
            scale = startPosition.height / viewportHeight;
        }
        
        // Calculate center points
        const thumbnailCenterX = startPosition.left + (startPosition.width / 2);
        const thumbnailCenterY = startPosition.top + (startPosition.height / 2);

        setIsVisible(false);
        
        // Animate back to thumbnail position
        setStyles({
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100vw',
            height: '100vh',
            transform: `translate3d(${thumbnailCenterX}px, ${thumbnailCenterY}px, 0) scale3d(${scale}, ${scale}, 1)`,
            transformOrigin: '50% 50%',
            transition: 'transform 400ms cubic-bezier(0.4, 0, 0.2, 1)'
        });

        setTimeout(onClose, 400);
    };

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

    // Add handlers for video loading states
    const handleVideoLoad = () => {
        setIsLoaded(true);
    };

    const handleVideoError = (e: any) => {
        console.error('Video loading error:', e);
    };

    // Use keyboard controls from the hook
    useEffect(() => {
        if (!isVisible) return;
        
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                handleClose();
                return;
            }
            handleKeyPress(e);
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isVisible, handleKeyPress, handleClose]);

    // Add keyboard controls hint
    const [showControls, setShowControls] = useState(false);

    useEffect(() => {
        let timeout: NodeJS.Timeout;
        if (isVisible) {
            setShowControls(true);
            timeout = setTimeout(() => setShowControls(false), 3000);
        }
        return () => clearTimeout(timeout);
    }, [isVisible]);

    // Add state for sidebar width
    const [sidebarWidth, setSidebarWidth] = useState(256); // 256px = 16rem (w-64)
    const [isDragging, setIsDragging] = useState(false);
    const dragStartXRef = useRef<number>(0);
    const initialWidthRef = useRef<number>(0);

    // Handle drag to resize
    const handleDragStart = (e: React.MouseEvent) => {
        setIsDragging(true);
        dragStartXRef.current = e.clientX;
        initialWidthRef.current = sidebarWidth;
        document.body.style.cursor = 'ew-resize';
        document.body.style.userSelect = 'none';
    };

    useEffect(() => {
        const handleDrag = (e: MouseEvent) => {
            if (!isDragging) return;
            
            const deltaX = e.clientX - dragStartXRef.current;
            const newWidth = Math.max(48, Math.min(800, initialWidthRef.current + deltaX));
            setSidebarWidth(newWidth);
        };

        const handleDragEnd = () => {
            setIsDragging(false);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleDrag);
            window.addEventListener('mouseup', handleDragEnd);
        }

        return () => {
            window.removeEventListener('mousemove', handleDrag);
            window.removeEventListener('mouseup', handleDragEnd);
        };
    }, [isDragging]);

    return (
        <div className={`fixed inset-0 z-50 transition-all duration-400 ease-in-out
            ${isVisible ? 'bg-black/90 backdrop-blur-sm' : 'bg-black/0 backdrop-blur-none pointer-events-none'}`}>
            
            {/* Keyboard Controls Hint 
            <div className={`fixed top-4 left-1/2 -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-lg
                          transition-opacity duration-300 text-sm
                          ${showControls ? 'opacity-100' : 'opacity-0'}`}>
                Space/K: Play/Pause • ←/→ or J/L: ±10s • F: Fullscreen • M: Mute • ↑/↓: Volume • ESC: Close
            </div>
            */}

            <div className="w-full h-full flex items-center justify-center">
                <div 
                    className="w-full h-full flex"
                    style={styles}
                >
                    {/* Side Panel */}
                    <div 
                        className={`bg-gray-900 text-white h-full relative flex
                            ${isVisible ? 'opacity-100' : 'opacity-0'}`}
                        style={{ width: `${sidebarWidth}px`, flexShrink: 0 }}
                    >
                        {/* Drag Handle */}
                        <div
                            className="absolute right-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-blue-500 transition-colors"
                            onMouseDown={handleDragStart}
                        />
                        
                        {/* Toggle Button */}
                        <button 
                            onClick={() => setSidebarWidth(sidebarWidth === 48 ? 256 : 48)}
                            className="absolute left-2 top-2 p-2 hover:bg-gray-700 rounded-full transition-colors"
                        >
                            {sidebarWidth > 48 ? '◀' : '▶'}
                        </button>

                        {/* Panel Content */}
                        <div className={`flex-1 p-4 mt-12 transition-opacity duration-200 overflow-hidden
                            ${sidebarWidth > 48 ? 'opacity-100' : 'opacity-0'}`}>
                            <h3 className="text-xl font-semibold mb-4 whitespace-nowrap">Video Options</h3>
                            <div className="space-y-4">
                                <button
                                    onClick={handleDownload}
                                    className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2
                                             transition-colors duration-200 whitespace-nowrap"
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
                            onClick={handleClose}
                            className={`absolute right-4 top-4 text-white hover:text-gray-300 z-10
                                     transition-all duration-400 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}
                        >
                            ✕
                        </button>

                        {/* Video Container */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="relative w-full h-full p-4">
                                {/* Loading Indicator */}
                                {!isLoaded && isVisible && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                                        <div className="text-white">Loading video...</div>
                                    </div>
                                )}
                                
                                <video
                                    ref={videoRef}
                                    src={`/api/video?path=${encodeURIComponent(src)}`}
                                    className={`w-full h-full object-contain rounded-lg shadow-2xl
                                              ${isVisible ? 'opacity-100' : 'opacity-0'}`}
                                    onLoadedData={handleVideoLoad}
                                    onError={handleVideoError}
                                    onTimeUpdate={handleTimeUpdate}
                                    playsInline
                                    style={{
                                        visibility: isVisible ? 'visible' : 'hidden',
                                        display: 'block'
                                    }}
                                />
                                
                                {/* Video Controls Overlay */}
                                <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4
                                              transition-all duration-400 ease-out
                                              ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'}`}
                                     style={{ opacity: isPlaying && isLoaded ? 0.7 : 1 }}
                                >
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
                                        className="text-white hover:text-gray-300 text-2xl transition-transform duration-200
                                                 hover:scale-110"
                                        disabled={!isLoaded}
                                    >
                                        {isPlaying ? '⏸️' : '▶️'}
                                    </button>
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
