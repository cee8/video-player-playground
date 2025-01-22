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
    const videoDirectory = process.env.NEXT_PUBLIC_VIDEO_DIRECTORY;


    //QUESTION: WHY IS MY CODE IN A USEEFFECT RATHER THAN JUST BEING ON ITS OWN
    useEffect(() => {
        const fetchVideos = async () => {
            setLoading(true);
            setError(null);

            try {
                // Call our local API endpoint
                const response = await fetch('/api/videos');
                console.log('Fetching videos response:', response.status);
                
                if (!response.ok) {
                    throw new Error('Failed to fetch videos');
                }

                const data = await response.json();
                console.log('Fetched videos:', data);
                setVideos(data);
            } catch (err: unknown) {
                // Type the error and use type checking
                const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
                console.error('Error fetching videos:', errorMessage);
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
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="text-lg text-gray-600 animate-pulse">Loading videos...</div>
            </div>
        );
    }

    // Render error state
    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="text-red-500 bg-red-50 px-4 py-3 rounded-lg shadow">
                    {error}
                </div>
            </div>
        );
    }

    // Render empty state
    if (!videos.length) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
                <div className="text-xl text-gray-600">No videos found</div>
                <p className="text-gray-500 text-sm">Add some videos to your library to get started</p>
            </div>
        );
    }

    //Main render
    return (
        <div className="container mx-auto px-4 py-8">
            {/* Library header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {videoDirectory}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    {videos.length} video{videos.length !== 1 ? 's' : ''} available
                </p>
            </div>

            {/* Video grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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