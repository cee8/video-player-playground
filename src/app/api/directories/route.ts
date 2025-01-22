import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const dirPath = searchParams.get('path') || process.env.NEXT_PUBLIC_VIDEO_DIRECTORY;

        if (!dirPath) {
            return NextResponse.json({ error: 'No directory path provided' }, { status: 400 });
        }

        // Get video directory from environment variable for validation
        const baseVideoDirectory = process.env.NEXT_PUBLIC_VIDEO_DIRECTORY;

        if (!baseVideoDirectory) {
            return NextResponse.json({ error: 'NEXT_PUBLIC_VIDEO_DIRECTORY not configured' }, { status: 500 });
        }

        // Create full path and verify it's within video directory
        const fullPath = path.resolve(dirPath);
        const normalizedVideoDir = path.resolve(baseVideoDirectory);

        if (!fullPath.startsWith(normalizedVideoDir)) {
            return NextResponse.json({ error: 'Invalid directory path' }, { status: 403 });
        }

        // Read directory contents
        const contents = await fs.readdir(fullPath, { withFileTypes: true });
        
        // Separate directories and video files
        const directories = contents
            .filter(dirent => dirent.isDirectory())
            .map(dir => ({
                name: dir.name,
                path: path.join(dirPath, dir.name),
                type: 'directory' as const
            }));

        const videoFiles = contents
            .filter(dirent => {
                if (!dirent.isFile()) return false;
                const ext = path.extname(dirent.name).toLowerCase();
                return ['.mp4', '.webm', '.mov', '.avi'].includes(ext);
            })
            .map(file => ({
                name: file.name,
                path: path.join(dirPath, file.name),
                type: 'video' as const
            }));

        // Get parent directory if we're not at the root
        const parentDir = fullPath !== normalizedVideoDir ? {
            name: '..',
            path: path.dirname(dirPath),
            type: 'directory' as const
        } : null;

        return NextResponse.json({
            currentPath: dirPath,
            items: [
                ...(parentDir ? [parentDir] : []),
                ...directories,
                ...videoFiles
            ]
        });
    } catch (error) {
        console.error('Error reading directory:', error);
        return NextResponse.json(
            { error: 'Failed to read directory' },
            { status: 500 }
        );
    }
} 