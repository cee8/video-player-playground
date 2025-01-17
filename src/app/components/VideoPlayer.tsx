import React from 'react';

interface VideoPlayerProps {
    src: string;
    onClose: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <video src={src} autoPlay controls className="max-w-full max-h-full" />
        </div>
    );
};

export default VideoPlayer;
