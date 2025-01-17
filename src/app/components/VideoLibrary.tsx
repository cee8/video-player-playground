import React, { useState, useEffect } from 'react';
import VideoCard from './VideoCard';
import VideoPlayer from './VideoPlayer';

/* This creates a type for the video object */
interface Video {
    id: string;
    title: string;
    path: string;
}

const VideoLibrary = () => {
    const [videos, setVideos] = useState<Video[]>([]);
    const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);


    //QUESTION: WHY IS MY CODE IN A USEEFFECT RATHER THAN JUST BEING ON ITS OWN
    useEffect(() => {
        const fetchVideos = async () => {
            setLoading(true);
            setError(null);

            try {
                // Call our local API endpoint
                const response = await fetch('/api/videos');
                
                if (!response.ok) {
                    throw new Error('Failed to fetch videos');
                }

                const data = await response.json();
                setVideos(data);
            } catch (err: unknown) {
                // Type the error and use type checking
                const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
                setError(`When fetching received error: ${errorMessage}`);
            } finally {
                setLoading(false);
            }
        };

        fetchVideos();
    }, []);

    const handleVideoSelect = (video: Video) => {
        setSelectedVideo(video);
    };

    const handleCloseVideo = () => {
        setSelectedVideo(null);
    };

    // Render loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p>Loading videos...</p>
            </div>
        );
    }

    // Render error state
    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    // Render empty state
    if (!videos.length) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p>No videos found</p>
            </div>
        );
    }

    //Main render
    return (
        <div className="container mx-auto p-4">
            {/* Video Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {videos.map((video) => (
                    <VideoCard
                        key={video.id}
                        video={video}
                        onClick={() => handleVideoSelect(video)}
                    />
                ))}
            </div>

            {/* Video Player Modal */}
            {selectedVideo && (
                <VideoPlayer
                    src={selectedVideo.path}
                    onClose={handleCloseVideo}
                />
            )}
        </div>
    );
};

export default VideoLibrary;