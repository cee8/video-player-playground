import { useState, useEffect, RefObject } from 'react';

const useVideoControls = (videoRef: RefObject<HTMLVideoElement | null>) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        // Set initial duration when metadata is loaded
        const handleLoadedMetadata = () => {
            setDuration(video.duration);
            setVolume(video.volume);
        };

        // Update playing state when video plays/pauses
        const handlePlayPause = () => {
            setIsPlaying(!video.paused);
        };

        // Add event listeners
        video.addEventListener('loadedmetadata', handleLoadedMetadata);
        video.addEventListener('play', handlePlayPause);
        video.addEventListener('pause', handlePlayPause);

        // Cleanup
        return () => {
            video.removeEventListener('loadedmetadata', handleLoadedMetadata);
            video.removeEventListener('play', handlePlayPause);
            video.removeEventListener('pause', handlePlayPause);
        };
    }, [videoRef]);

    const togglePlay = () => {
        const video = videoRef.current;
        if (!video) return;

        if (video.paused) {
            video.play();
        } else {
            video.pause();
        }
        setIsPlaying(!video.paused);
    };

    const handleTimeUpdate = () => {
        const video = videoRef.current;
        if (!video) return;
        setCurrentTime(video.currentTime);
    };

    const handleVolumeChange = (value: number) => {
        const video = videoRef.current;
        if (!video) return;
        video.volume = value;
        setVolume(value);
    };

    const handleSeek = (value: number) => {
        const video = videoRef.current;
        if (!video) return;
        video.currentTime = value;
        setCurrentTime(value);
    };

    return {
        isPlaying,
        currentTime,
        duration,
        volume,
        togglePlay,
        handleTimeUpdate,
        handleVolumeChange,
        handleSeek,
    };
};

export default useVideoControls;
