import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const videoPath = searchParams.get('path');

    if (!videoPath) {
        return NextResponse.json({ error: 'No video path provided' }, { status: 400 });
    }

    try {
        // Create DASH manifest and segments
        const outputDir = path.join(process.cwd(), 'public', 'dash', path.basename(videoPath, path.extname(videoPath)));
        await fs.mkdir(outputDir, { recursive: true });

        // Use ffmpeg to create DASH content
        const command = `ffmpeg -i "${videoPath}" \
            -map 0:v -c:v libx264 -b:v:0 6000k -b:v:1 3000k -b:v:2 1500k \
            -s:v:0 1920x1080 -s:v:1 1280x720 -s:v:2 854x480 \
            -map 0:a -c:a aac -b:a:0 192k -b:a:1 128k -b:a:2 96k \
            -f dash \
            -seg_duration 4 \
            -use_template 1 \
            -use_timeline 1 \
            "${outputDir}/manifest.mpd"`;

        await execAsync(command);

        // Return the manifest URL
        const manifestUrl = `/dash/${path.basename(videoPath, path.extname(videoPath))}/manifest.mpd`;
        return NextResponse.json({ manifestUrl });

    } catch (error) {
        console.error('Error creating DASH content:', error);
        return NextResponse.json({ error: 'Failed to create DASH content' }, { status: 500 });
    }
} 