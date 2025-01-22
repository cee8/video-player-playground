import React, { useState, useEffect } from 'react';
import VideoCard from './VideoCard';
import VideoPlayer from './VideoPlayer';
import path from 'path';

/* This creates a type for the video object */
interface Video {
    id: string;
    title: string;
    path: string;
}

interface DirectoryItem {
    name: string;
    path: string;
    type: 'directory' | 'video';
}

const VideoLibrary = () => {
    const [videos, setVideos] = useState<Video[]>([]);
    const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [currentPath, setCurrentPath] = useState<string>('');
    const [directoryItems, setDirectoryItems] = useState<DirectoryItem[]>([]);
    const [isExplorerOpen, setIsExplorerOpen] = useState(false);

    // Get the current folder name from the path
    const getCurrentFolderName = (fullPath: string) => {
        if (!fullPath) return 'Root';
        return path.basename(fullPath);
    };

    // Fetch directory contents
    const fetchDirectory = async (path?: string) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/directories${path ? `?path=${encodeURIComponent(path)}` : ''}`);
            if (!response.ok) {
                throw new Error('Failed to fetch directory contents');
            }

            const data = await response.json();
            setCurrentPath(data.currentPath);
            setDirectoryItems(data.items);

            // Convert video items to Video objects
            const videoItems = data.items
                .filter((item: DirectoryItem) => item.type === 'video')
                .map((item: DirectoryItem) => ({
                    id: item.name,
                    title: item.name,
                    path: item.path
                }));
            setVideos(videoItems);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
            console.error('Error fetching directory:', errorMessage);
            setError(`Error fetching directory: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    // Initial load
    useEffect(() => {
        fetchDirectory();
    }, []);

    const handleVideoSelect = (video: Video) => {
        setSelectedVideo(video);
    };

    const handleCloseVideo = () => {
        setSelectedVideo(null);
    };

    const handleDirectoryClick = (path: string) => {
        fetchDirectory(path);
        setIsExplorerOpen(false);
    };

    // Render loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="text-lg text-gray-600 animate-pulse">Loading...</div>
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
    if (!directoryItems.length) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
                <div className="text-xl text-gray-600">Empty directory</div>
                <p className="text-gray-500 text-sm">This directory contains no videos or subdirectories</p>
            </div>
        );
    }

    //Main render
    return (
        <div className="container mx-auto px-4 py-8">
            {/* Library header */}
            <div className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {getCurrentFolderName(currentPath)}
                    </h1>
                    
                    {/* Path and controls */}
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 flex-1">
                        <button
                            onClick={() => setIsExplorerOpen(true)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            title="Browse folders"
                        >
                            📁
                        </button>
                        <span className="font-mono text-sm truncate">{currentPath}</span>
                        <button
                            onClick={() => fetchDirectory(currentPath)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors ml-auto"
                            title="Refresh directory"
                        >
                            🔄
                        </button>
                    </div>
                </div>

                {/* Video count */}
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {videos.length} video{videos.length !== 1 ? 's' : ''} in this directory
                </p>
            </div>

            {/* File Explorer Dialog */}
            {isExplorerOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
                        {/* Dialog Header */}
                        <div className="p-4 border-b dark:border-gray-700 flex items-center justify-between">
                            <h2 className="text-lg font-semibold">Browse Folders</h2>
                            <button
                                onClick={() => setIsExplorerOpen(false)}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Directory Listing */}
                        <div className="flex-1 overflow-auto p-4">
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {directoryItems
                                    .filter(item => item.type === 'directory')
                                    .map(dir => (
                                        <button
                                            key={dir.path}
                                            onClick={() => handleDirectoryClick(dir.path)}
                                            className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg
                                                     transition-colors text-left truncate"
                                        >
                                            <span className="text-xl">📁</span>
                                            <span className="flex-1 truncate">{dir.name}</span>
                                        </button>
                                    ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

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