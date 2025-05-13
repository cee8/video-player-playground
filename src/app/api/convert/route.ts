import { NextRequest, NextResponse } from 'next/server';
import { convertToDAHS, getVideoMetadata } from '@/app/utils/videoConverter';
import path from 'path';
import fs from 'fs/promises';

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();
        const { videoPath, qualities } = data;

        if (!videoPath) {
            return NextResponse.json(
                { error: 'Video path is required' },
                { status: 400 }
            );
        }

        // Check if file exists
        try {
            await fs.access(videoPath);
        } catch {
            return NextResponse.json(
                { error: 'Video file not found' },
                { status: 404 }
            );
        }

        // Get video metadata to determine available qualities
        const metadata = await getVideoMetadata(videoPath);
        
        // Create output directory next to the original file
        const outputDir = path.join(
            path.dirname(videoPath),
            path.basename(videoPath, path.extname(videoPath)) + '_dash'
        );

        // Ensure output directory exists with proper permissions
        await fs.mkdir(outputDir, { recursive: true, mode: 0o755 });

        // Determine qualities based on original video height
        const availableQualities = qualities || [
            Math.min(metadata.height, 1080),
            Math.min(metadata.height, 720),
            Math.min(metadata.height, 480)
        ].filter((q, i, arr) => q !== arr[i - 1]); // Remove duplicates

        // Log conversion details
        console.log('Converting video:', {
            inputPath: videoPath,
            outputDir,
            qualities: availableQualities,
            hasAudio: metadata.hasAudio,
            originalHeight: metadata.height
        });

        try {
            // Convert video to DASH format
            const manifestPath = await convertToDAHS(videoPath, outputDir, {
                qualities: availableQualities
            });

            // Verify the manifest exists
            await fs.access(manifestPath);

            return NextResponse.json({ manifestPath });
        } catch (conversionError) {
            console.error('Conversion error:', conversionError);
            return NextResponse.json(
                { error: 'Failed to convert video to DASH format' },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// Add GET endpoint to check conversion status
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const manifestPath = searchParams.get('manifestPath');

    if (!manifestPath) {
        return NextResponse.json(
            { error: 'Manifest path is required' },
            { status: 400 }
        );
    }

    try {
        await fs.access(manifestPath);
        
        // Check if segments directory exists and has files
        const segmentsDir = path.join(path.dirname(manifestPath), 'segments');
        const segmentFiles = await fs.readdir(segmentsDir);
        
        return NextResponse.json({
            exists: true,
            hasSegments: segmentFiles.some(file => file.endsWith('.m4s'))
        });
    } catch {
        return NextResponse.json({ exists: false });
    }
} 