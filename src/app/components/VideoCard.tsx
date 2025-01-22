import React, { useState, useRef, useEffect } from 'react';


interface Video {
    id: string;
    title: string;
    path: string
}
interface VideoCardProps {
    video: Video;
    onClick: () => void; 
}


const VideoCard: React.FC<VideoCardProps> = ({video, onClick}) => {
    const [isHovered, setIsHovered] = useState<boolean>(false);
    const [thumbnailUrl, setThumbnailUrl] = useState<string>('');
    const videoRef = useRef<HTMLVideoElement>(null);

    const handleMouseEnter = () => {
        setIsHovered(true);
    };
    const handleMouseLeave = () => {
        setIsHovered(false);
    };

    // Generate thumbnail when component mounts
    useEffect(() => {
        const generateThumbnail = async () => {
            if (!video.path) {
                console.error('No video path provided');
                return;
            }

            if (videoRef.current) {
                const videoElement = videoRef.current;
                // Use the correct API endpoint URL
                const videoUrl = `/api/video?path=${encodeURIComponent(video.path)}`;
                console.log('Loading video from:', videoUrl);
                videoElement.src = videoUrl;
                
                // When video metadata is loaded, seek to 1 second and capture frame
                videoElement.onloadedmetadata = () => {
                    videoElement.currentTime = 1; // Seek to 1 second
                };

                // Add error handling
                videoElement.onerror = (e) => {
                    console.error('Error loading video:', videoElement.error);
                };

                // When seeking is complete, capture the frame
                videoElement.onseeked = () => {
                    try {
                        // Create a canvas to draw the video frame
                        const canvas = document.createElement('canvas');
                        canvas.width = videoElement.videoWidth;
                        canvas.height = videoElement.videoHeight;
                        const ctx = canvas.getContext('2d');
                        
                        if (ctx) {
                            // Draw the current frame to the canvas
                            ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
                            // Convert canvas to data URL
                            const thumbnailUrl = canvas.toDataURL('image/jpeg');
                            setThumbnailUrl(thumbnailUrl);
                        }
                    } catch (error) {
                        console.error('Error generating thumbnail:', error);
                    }
                };
            }
        };

        generateThumbnail();
    }, [video.path]);

    // Clean up the title (remove IMG_ prefix and file extension)
    const cleanTitle = video.title
        .replace(/^IMG_/, '')
        .replace(/\.[^/.]+$/, '');

    return (
        <div 
            onClick={onClick} 
            onMouseEnter={handleMouseEnter} 
            onMouseLeave={handleMouseLeave} 
            className="group relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md 
                     hover:shadow-xl transition-all duration-300 cursor-pointer"
        >
            {/* Hidden video element for thumbnail generation */}
            <video 
                ref={videoRef}
                className="hidden"
                preload="metadata"
            />

            {/* Thumbnail Container */}
            <div className="relative aspect-video bg-gray-100 dark:bg-gray-700">
                {thumbnailUrl ? (
                    // Show thumbnail if available
                    <img 
                        src={thumbnailUrl}
                        alt={cleanTitle}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    // Placeholder while thumbnail is generating
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-4xl animate-pulse">🎬</span>
                    </div>
                )}

                {/* Hover Overlay */}
                <div className={`absolute inset-0 bg-black/40 transition-opacity duration-300
                               ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className={`text-white text-6xl transform transition-transform duration-300
                                     ${isHovered ? 'scale-110' : 'scale-100'}`}>
                            ▶️
                        </span>
                    </div>
                    <div className="absolute bottom-2 left-2 right-2 text-white text-sm">
                        <p className="font-medium">Click to play</p>
                    </div>
                </div>
            </div>

            {/* Video Info */}
            <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    {cleanTitle}
                </h3>
                <div className="mt-1 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                        📁 {video.path.split('/').pop()}
                    </span>
                </div>
            </div>

            {/* Quick Actions (optional) */}
            <div className={`absolute top-2 right-2 transition-opacity duration-300
                           ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        // Add functionality later (e.g., add to playlist, download, etc.)
                    }}
                    className="p-1 bg-black/60 hover:bg-black/80 rounded-full text-white/80 hover:text-white"
                >
                    •••
                </button>
            </div>
        </div>
    );
};

export default VideoCard



