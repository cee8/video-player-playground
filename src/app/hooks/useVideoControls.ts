import { useRef, useState, useEffect, RefObject } from 'react';

interface VideoControls {
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    volume: number;
    togglePlay: () => void;
    handleTimeUpdate: () => void;
    handleSeek: (time: number) => void;
    handleVolumeChange: (volume: number) => void;
    handleKeyPress: (e: KeyboardEvent) => void;
}

const useVideoControls = (videoRef: RefObject<HTMLVideoElement | null>): VideoControls => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);

    const togglePlay = () => {
        if (!videoRef.current) return;
        if (isPlaying) {
            videoRef.current.pause();
        } else {
            videoRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleTimeUpdate = () => {
        if (!videoRef.current) return;
        setCurrentTime(videoRef.current.currentTime);
        setDuration(videoRef.current.duration);
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

    // Handle keyboard controls
    const handleKeyPress = (e: KeyboardEvent) => {
        if (!videoRef.current) return;

        switch (e.key.toLowerCase()) {
            case ' ':
            case 'k':
                // Space or K for play/pause
                e.preventDefault();
                togglePlay();
                break;
            case 'f':
                // F for fullscreen
                e.preventDefault();
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                } else {
                    videoRef.current.requestFullscreen();
                }
                break;
            case 'arrowleft':
            case 'j':
                // Left arrow or J to rewind 10s
                e.preventDefault();
                handleSeek(Math.max(0, currentTime - 10));
                break;
            case 'arrowright':
            case 'l':
                // Right arrow or L to forward 10s
                e.preventDefault();
                handleSeek(Math.min(duration, currentTime + 10));
                break;
            case 'arrowup':
                // Up arrow to increase volume
                e.preventDefault();
                handleVolumeChange(Math.min(1, volume + 0.1));
                break;
            case 'arrowdown':
                // Down arrow to decrease volume
                e.preventDefault();
                handleVolumeChange(Math.max(0, volume - 0.1));
                break;
            case 'm':
                // M to mute/unmute
                e.preventDefault();
                handleVolumeChange(volume > 0 ? 0 : 1);
                break;
        }
    };

    // Set up event listeners for play/pause
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);

        video.addEventListener('play', handlePlay);
        video.addEventListener('pause', handlePause);

        return () => {
            video.removeEventListener('play', handlePlay);
            video.removeEventListener('pause', handlePause);
        };
    }, [videoRef]);

    return {
        isPlaying,
        currentTime,
        duration,
        volume,
        togglePlay,
        handleTimeUpdate,
        handleSeek,
        handleVolumeChange,
        handleKeyPress,
    };
};

export default useVideoControls;
