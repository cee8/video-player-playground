import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const videoPath = searchParams.get('path');

        if (!videoPath) {
            return NextResponse.json({ error: 'No video path provided' }, { status: 400 });
        }

        // Get video directory from environment variable
        const videoDirectory = process.env.VIDEO_DIRECTORY;
        if (!videoDirectory) {
            return NextResponse.json({ error: 'Video directory not configured' }, { status: 500 });
        }

        // Create full path and verify it's within video directory
        const fullPath = path.resolve(videoPath);
        const normalizedVideoDir = path.resolve(videoDirectory);

        if (!fullPath.startsWith(normalizedVideoDir)) {
            return NextResponse.json({ error: 'Invalid video path' }, { status: 403 });
        }

        // Check if file exists
        if (!fs.existsSync(fullPath)) {
            return NextResponse.json({ error: 'Video not found' }, { status: 404 });
        }

        // Get file stats for content-length
        const stat = fs.statSync(fullPath);
        
        // Create read stream
        const videoStream = fs.createReadStream(fullPath);

        // Return the video stream with proper headers
        return new NextResponse(videoStream as any, {
            headers: {
                'Content-Type': 'video/mp4',
                'Content-Length': stat.size.toString(),
                'Accept-Ranges': 'bytes',
            },
        });
    } catch (error) {
        console.error('Error streaming video:', error);
        return NextResponse.json({ error: 'Failed to stream video' }, { status: 500 });
    }
} 