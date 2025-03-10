import React from 'react';

interface BitrateMetricsProps {
    currentBitrate: number;
    averageBitrate: number;
    bufferLength: number;
    downloadSpeed: number;
    isVisible: boolean;
}

const BitrateMetrics: React.FC<BitrateMetricsProps> = ({
    currentBitrate,
    averageBitrate,
    bufferLength,
    downloadSpeed,
    isVisible
}) => {
    if (!isVisible) return null;

    return (
        <div className="absolute top-4 left-4 bg-black/80 text-white p-4 rounded-lg space-y-2 text-sm font-mono">
            <div className="flex justify-between gap-4">
                <span>Current Bitrate:</span>
                <span>{(currentBitrate / 1000000).toFixed(2)} Mbps</span>
            </div>
            <div className="flex justify-between gap-4">
                <span>Average Bitrate:</span>
                <span>{(averageBitrate / 1000000).toFixed(2)} Mbps</span>
            </div>
            <div className="flex justify-between gap-4">
                <span>Buffer Length:</span>
                <span>{bufferLength.toFixed(1)}s</span>
            </div>
            <div className="flex justify-between gap-4">
                <span>Download Speed:</span>
                <span>{(downloadSpeed / 1000000).toFixed(2)} Mbps</span>
            </div>
        </div>
    );
};

export default BitrateMetrics; 