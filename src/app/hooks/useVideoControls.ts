import { useState, useEffect, RefObject } from 'react';

interface VideoControls {
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    volume: number;
    togglePlay: () => void;
    handleTimeUpdate: () => void;
    handleSeek: (time: number) => void;
    handleVolumeChange: (volume: number) => void;
}

const useVideoControls = (videoRef: RefObject<HTMLVideoElement | null>): VideoControls => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        // Set initial volume
        video.volume = volume;

        // Add event listeners
        const handleLoadedMetadata = () => {
            setDuration(video.duration);
        };

        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);

        video.addEventListener('loadedmetadata', handleLoadedMetadata);
        video.addEventListener('play', handlePlay);
        video.addEventListener('pause', handlePause);

        // Cleanup
        return () => {
            video.removeEventListener('loadedmetadata', handleLoadedMetadata);
            video.removeEventListener('play', handlePlay);
            video.removeEventListener('pause', handlePause);
        };
    }, [videoRef, volume]);

    const togglePlay = () => {
        if (!videoRef.current) return;
        
        if (isPlaying) {
            videoRef.current.pause();
        } else {
            videoRef.current.play();
        }
    };

    const handleTimeUpdate = () => {
        if (!videoRef.current) return;
        setCurrentTime(videoRef.current.currentTime);
    };

    const handleSeek = (time: number) => {
        if (!videoRef.current) return;
        videoRef.current.currentTime = time;
        setCurrentTime(time);
    };

    const handleVolumeChange = (newVolume: number) => {
        if (!videoRef.current) return;
        videoRef.current.volume = newVolume;
        setVolume(newVolume);
    };

    return {
        isPlaying,
        currentTime,
        duration,
        volume,
        togglePlay,
        handleTimeUpdate,
        handleSeek,
        handleVolumeChange,
    };
};

export default useVideoControls;
