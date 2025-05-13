import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const filePath = searchParams.get('path');

        if (!filePath) {
            console.error('HLS API: No file path provided');
            return NextResponse.json({ error: 'No file path provided' }, { status: 400 });
        }

        console.log('HLS API received request for path:', filePath);

        // Get video directory from environment variable
        const videoDirectory = process.env.NEXT_PUBLIC_VIDEO_DIRECTORY;

        if (!videoDirectory) {
            console.error('HLS API: NEXT_PUBLIC_VIDEO_DIRECTORY not configured');
            return NextResponse.json({ error: 'NEXT_PUBLIC_VIDEO_DIRECTORY not configured' }, { status: 500 });
        }

        // Clean up the file path - remove any URL protocol prefixes
        let cleanPath = filePath;
        
        // Handle case where the path might be another API URL
        if (cleanPath.startsWith('/api/hls?path=') || cleanPath.startsWith('/api/video?path=')) {
            console.error('HLS API: Detected recursive API call in path:', cleanPath);
            return NextResponse.json({ error: 'Invalid recursive API call' }, { status: 400 });
        }
        
        if (cleanPath.startsWith('file://')) {
            cleanPath = cleanPath.substring(7);
        }
        
        // Handle both absolute paths and paths relative to the video directory
        let fullPath;
        if (path.isAbsolute(cleanPath)) {
            fullPath = cleanPath;
        } else {
            fullPath = path.join(videoDirectory, cleanPath);
        }
        
        // Normalize the path to resolve any '..' segments
        fullPath = path.normalize(fullPath);
        const normalizedVideoDir = path.resolve(videoDirectory);

        console.log('HLS API resolved path:', {
            originalPath: filePath,
            cleanPath,
            fullPath,
            normalizedVideoDir
        });

        // Check if the path is within the video directory or a subdirectory
        if (!fullPath.startsWith(normalizedVideoDir)) {
            console.error(`HLS API security error: Path ${fullPath} is outside of video directory ${normalizedVideoDir}`);
            return NextResponse.json({ error: 'Invalid file path' }, { status: 403 });
        }

        // Check if file exists
        if (!fs.existsSync(fullPath)) {
            console.error(`HLS API file not found: ${fullPath}`);
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }

        // Get file stats
        const stat = fs.statSync(fullPath);
        
        // Create read stream
        const fileStream = fs.createReadStream(fullPath);

        // Determine content type based on file extension
        let contentType = 'application/octet-stream'; // Default
        const ext = path.extname(fullPath).toLowerCase();
        
        if (ext === '.m3u8') {
            contentType = 'application/vnd.apple.mpegurl';
        } else if (ext === '.ts') {
            contentType = 'video/mp2t';
        } else if (ext === '.m4s') {
            contentType = 'video/iso.segment';
        } else if (ext === '.mp4') {
            contentType = 'video/mp4';
        }

        console.log(`HLS API serving file: ${fullPath} with content-type: ${contentType}`);

        // Return the file stream with proper headers
        return new NextResponse(fileStream as any, {
            headers: {
                'Content-Type': contentType,
                'Content-Length': stat.size.toString(),
                'Access-Control-Allow-Origin': '*', // Allow cross-origin requests
                'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
            },
        });
    } catch (error) {
        console.error('HLS API error serving file:', error);
        return NextResponse.json({ error: 'Failed to serve file' }, { status: 500 });
    }
} 