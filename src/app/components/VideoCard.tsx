import React, { useState } from 'react';


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
    const [thumbnailError, setThumbnailError] = useState<boolean>(false);

    const handleMouseEnter = () => {
        setIsHovered(true);
    };
    const handleMouseLeave = () => {
        setIsHovered(false);
    };
    const handleThumbnailError = () => {
        setThumbnailError(true)
    };

    return (
        <div 
            onClick={onClick} 
            onMouseEnter={handleMouseEnter} 
            onMouseLeave={handleMouseLeave} 
            className="cursor-pointer rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
        >
            
            <div className="relative h-48 bg-gray-200">
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl">▶️</span>
                </div>
            </div>

            <div className="p-4">
                <h3 className="text-lg font-semibold truncate">
                    {video.title}
                </h3>
                <p className="text-sm text-gray-500 truncate">
                    {video.path}
                </p>
            </div>
        </div>
    );
};

export default VideoCard



