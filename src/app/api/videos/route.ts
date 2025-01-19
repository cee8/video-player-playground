import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
    try {
        // Get video directory from environment variable
        const videoDirectory = process.env.VIDEO_DIRECTORY;
        
        if (!videoDirectory) {
            throw new Error('VIDEO_DIRECTORY environment variable is not set');
        }

        // Read all files in the directory
        const files = await fs.readdir(videoDirectory);

        // Filter for video files
        const videoFiles = files.filter(file => {
            const ext = path.extname(file).toLowerCase();
            return ['.mp4', '.webm', '.mov'].includes(ext);
        });

        // Create video objects
        const videos = videoFiles.map(file => ({
            id: file,
            title: path.basename(file, path.extname(file)),
            path: path.join(videoDirectory, file)
        }));

        return NextResponse.json(videos);
    } catch (error) {
        console.error('Error reading videos:', error);
        return NextResponse.json(
            { error: 'Failed to load videos' },
            { status: 500 }
        );
    }
}