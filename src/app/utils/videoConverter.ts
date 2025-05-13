import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';

const execAsync = promisify(exec);

interface ConversionOptions {
    segmentDuration?: number;  // Duration of each segment in seconds
    qualities?: number[];      // Array of heights (e.g., [2160, 1080, 720, 480])
}

interface VideoStream {
    codec_type: string;
    width: string;
    height: string;
    r_frame_rate: string;  // Added for frame rate support
}

interface FFprobeFormat {
    duration: string;
    bit_rate: string;
}

interface FFprobeData {
    streams: VideoStream[];
    format: FFprobeFormat;
}

const defaultOptions: ConversionOptions = {
    segmentDuration: 4,
    qualities: [1080, 720, 480]
};

async function hasAudioStream(inputPath: string): Promise<boolean> {
    try {
        const { stdout } = await execAsync(
            `ffprobe -v quiet -print_format json -show_streams "${inputPath}"`
        );
        const data: FFprobeData = JSON.parse(stdout);
        return data.streams.some(stream => stream.codec_type === 'audio');
    } catch (error) {
        console.warn('Error checking for audio stream:', error);
        return false;
    }
}

export async function convertToDAHS(
    inputPath: string,
    outputDir: string,
    options: ConversionOptions = defaultOptions
): Promise<string> {
    const { segmentDuration = 4, qualities = [1080, 720, 480] } = options;
    
    // Create output directory if it doesn't exist
    await fs.mkdir(outputDir, { recursive: true });
    
    // Generate output paths
    const filename = path.basename(inputPath, path.extname(inputPath));
    const masterPlaylist = path.join(outputDir, `${filename}.m3u8`);
    const segmentsDir = path.join(outputDir, 'segments');
    const tempDir = path.join(outputDir, 'temp');
    
    try {
        // Get video metadata to calculate aspect ratio and validate input
        const metadata = await getVideoMetadata(inputPath);
        console.log('Input video metadata:', metadata);
        
        // Filter qualities that are higher than the source
        const availableQualities = qualities.filter(q => q <= metadata.height)
            .sort((a, b) => b - a); // Sort descending
        
        if (availableQualities.length === 0) {
            // If no qualities match, use the original height
            availableQualities.push(Math.min(metadata.height, 1080));
        }
        
        const aspectRatio = metadata.width / metadata.height;
        
        // Create directories with proper permissions
        await fs.mkdir(segmentsDir, { recursive: true, mode: 0o755 });
        await fs.mkdir(tempDir, { recursive: true, mode: 0o755 });
        
        // Create variant playlists for each quality
        const variantPlaylists = [];
        for (let i = 0; i < availableQualities.length; i++) {
            const targetHeight = availableQualities[i];
            const exactWidth = targetHeight * aspectRatio;
            const height = Math.floor(targetHeight / 2) * 2;
            const width = Math.floor(exactWidth / 2) * 2;
            
            // Calculate optimal bitrate based on resolution and framerate
            const baseBitrate = Math.floor(height * width * metadata.fps * 0.07 / 1000);
            const minBitrate = Math.max(500, baseBitrate * 0.7);
            const maxBitrate = baseBitrate * 1.3;
            
            const variantName = `${filename}_${height}p`;
            const variantPlaylist = path.join(outputDir, `${variantName}.m3u8`);
            const segmentPattern = path.join(segmentsDir, `${variantName}_%03d.ts`);
            
            console.log(`Encoding quality ${height}p (${width}x${height}) at ${baseBitrate}k...`);
            
            // Enhanced FFmpeg command with better encoding settings
            const hlsCommand = `ffmpeg -y -i "${inputPath}" \
                -vf "scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2" \
                -c:v libx264 -profile:v high -preset medium \
                -b:v ${baseBitrate}k -maxrate ${maxBitrate}k -bufsize ${maxBitrate * 2}k \
                -g ${Math.round(metadata.fps * 2)} -keyint_min ${Math.round(metadata.fps)} \
                -sc_threshold 0 -r ${metadata.fps} \
                ${metadata.hasAudio ? '-c:a aac -b:a 128k' : ''} \
                -f hls \
                -hls_time ${segmentDuration} \
                -hls_segment_filename "${segmentPattern}" \
                -hls_playlist_type vod \
                -hls_flags independent_segments+delete_segments \
                -hls_start_number_source epoch \
                "${variantPlaylist}"`;
            
            try {
                const { stdout, stderr } = await execAsync(hlsCommand);
                if (stderr) {
                    console.warn(`Warnings for ${height}p encoding:`, stderr);
                }
                
                // Verify the variant playlist was created
                await fs.access(variantPlaylist);
                
                variantPlaylists.push({
                    height,
                    width,
                    bitrate: baseBitrate,
                    playlist: variantPlaylist,
                    bandwidth: baseBitrate * 1000 // For HLS manifest
                });
            } catch (error) {
                console.error(`Failed to encode ${height}p variant:`, error);
                // Continue with other variants
                continue;
            }
        }
        
        if (variantPlaylists.length === 0) {
            throw new Error('All quality variants failed to encode');
        }
        
        // Create master playlist with enhanced metadata
        const masterContent = '#EXTM3U\n' +
            '#EXT-X-VERSION:4\n' +
            variantPlaylists.map(variant => [
                '#EXT-X-STREAM-INF:' + [
                    `BANDWIDTH=${variant.bandwidth}`,
                    `RESOLUTION=${variant.width}x${variant.height}`,
                    `FRAME-RATE=${metadata.fps.toFixed(3)}`,
                    'CODECS="avc1.640028' + (metadata.hasAudio ? ',mp4a.40.2' : '') + '"'
                ].join(','),
                path.relative(outputDir, variant.playlist)
            ].join('\n')).join('\n');
        
        await fs.writeFile(masterPlaylist, masterContent);

        // Verify files were created
        try {
            await fs.access(masterPlaylist);
            const segmentFiles = await fs.readdir(segmentsDir);
            if (!segmentFiles.some(file => file.endsWith('.ts'))) {
                throw new Error('No segment files were created');
            }
            
            // Set correct permissions
            await Promise.all([
                ...segmentFiles.map(file => 
                    fs.chmod(path.join(segmentsDir, file), 0o644)
                ),
                fs.chmod(masterPlaylist, 0o644),
                ...variantPlaylists.map(variant => 
                    fs.chmod(variant.playlist, 0o644)
                )
            ]);
            
            console.log('Successfully created HLS stream with variants:', 
                variantPlaylists.map(v => `${v.width}x${v.height}`).join(', '));
            
        } catch (error) {
            throw new Error('Failed to create or verify HLS files');
        }

        // Clean up temporary directory if it exists
        try {
            await fs.rm(tempDir, { recursive: true, force: true });
        } catch (error) {
            console.warn('Failed to clean up temporary directory:', error);
        }

        return masterPlaylist;
    } catch (error: unknown) {
        console.error('Error converting video:', error);
        // Clean up any temporary files on error
        try {
            await fs.rm(tempDir, { recursive: true, force: true });
        } catch (cleanupError) {
            console.warn('Failed to clean up temporary directory:', cleanupError);
        }
        throw new Error(`Failed to convert video: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export async function getVideoMetadata(inputPath: string): Promise<{
    width: number;
    height: number;
    duration: number;
    bitrate: number;
    hasAudio: boolean;
    fps: number;
}> {
    try {
        const { stdout } = await execAsync(
            `ffprobe -v quiet -print_format json -show_format -show_streams "${inputPath}"`
        );
        
        const data: FFprobeData = JSON.parse(stdout);
        const videoStream = data.streams.find(s => s.codec_type === 'video');
        const hasAudio = data.streams.some(s => s.codec_type === 'audio');
        
        if (!videoStream) {
            throw new Error('No video stream found');
        }

        return {
            width: parseInt(videoStream.width),
            height: parseInt(videoStream.height),
            duration: parseFloat(data.format.duration),
            bitrate: parseInt(data.format.bit_rate),
            hasAudio,
            fps: parseFloat(data.streams.find(s => s.codec_type === 'video')?.r_frame_rate || '25')
        };
    } catch (error: unknown) {
        console.error('Error getting video metadata:', error);
        throw new Error(`Failed to get video metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
} 