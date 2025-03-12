# HLS Sprint Project Documentation

## Overview

The HLS (HTTP Live Streaming) Sprint Project introduces adaptive bitrate streaming capabilities to our video player application. This major enhancement allows for dynamic quality adjustment based on network conditions, providing a smoother viewing experience across various devices and connection speeds.

## Key Features

- **Adaptive Bitrate Streaming**: Automatically adjusts video quality based on available bandwidth
- **Multi-Resolution Support**: Transcodes videos into multiple quality levels (1080p, 720p, 480p)
- **HLS/DASH Compatibility**: Supports industry-standard streaming protocols
- **On-Demand Conversion**: Converts regular video files to HLS format on request
- **Progress Tracking**: Real-time conversion progress monitoring
- **Bandwidth Metrics**: Live display of current bitrate, buffer length, and download speed
- **Seamless Playback**: Smooth transitions between quality levels without interruption

## Architecture

### Components

1. **VideoPlayer Component** (`src/app/components/VideoPlayer.tsx`)
   - Enhanced with HLS.js integration for adaptive streaming
   - Added UI controls for enabling/disabling adaptive streaming
   - Implemented bitrate metrics display
   - Added conversion functionality with progress tracking

2. **API Endpoints**
   - **HLS API** (`src/app/api/hls/route.ts`): Serves HLS manifest files and video segments
   - **Convert API** (`src/app/api/convert/route.ts`): Handles video conversion to HLS format

3. **Utility Functions** (`src/app/utils/videoConverter.ts`)
   - Video metadata extraction
   - FFmpeg-based transcoding to multiple quality levels
   - Manifest file generation

### Data Flow

1. User selects a video for playback
2. If adaptive streaming is enabled and the video isn't in HLS format:
   - User is prompted to convert the video
   - Conversion request is sent to the Convert API
   - FFmpeg processes the video into multiple quality variants
   - Progress is tracked and displayed to the user
3. Once converted (or if already in HLS format):
   - HLS.js initializes and loads the manifest file
   - Player automatically selects the optimal quality based on network conditions
   - Bitrate metrics are displayed in real-time

## Technical Implementation

### HLS.js Integration

The player uses HLS.js, a JavaScript library that implements the HTTP Live Streaming client specification. It's loaded dynamically using Next.js's dynamic import to ensure it only runs on the client side:

```typescript
const HlsClientOnly = dynamic(
    () => import('hls.js').then((mod) => {
        return function HlsWrapper({ children }: { children: React.ReactNode }) {
            useEffect(() => {
                window.Hls = mod.default;
            }, []);
            return <>{children}</>;
        };
    }),
    { ssr: false }
);
```

### Video Conversion Process

The conversion process uses FFmpeg to transcode videos into multiple quality variants:

1. **Metadata Extraction**: Analyzes the source video to determine resolution, bitrate, and frame rate
2. **Quality Selection**: Determines appropriate quality levels based on source resolution
3. **Transcoding**: Creates multiple resolution variants with optimized bitrates
4. **Manifest Generation**: Creates master playlist and variant playlists
5. **Segmentation**: Splits video into small segments for adaptive streaming

### Adaptive Streaming Logic

The player implements custom logic for adaptive streaming:

1. **Quality Selection**: Automatically selects the optimal quality based on available bandwidth
2. **Buffer Management**: Maintains sufficient buffer to prevent playback interruptions
3. **Bandwidth Monitoring**: Continuously monitors network conditions
4. **Quality Switching**: Seamlessly switches between quality levels without interrupting playback

## Security Considerations

- **Path Validation**: All file paths are validated to prevent directory traversal attacks
- **Content Type Verification**: Proper MIME types are set for all served files
- **Error Handling**: Comprehensive error handling with appropriate HTTP status codes
- **Resource Cleanup**: Temporary files are properly managed and cleaned up

## Performance Optimizations

- **Segment Duration**: Optimized segment length (4 seconds) for balance between adaptability and overhead
- **Bitrate Calculation**: Dynamic bitrate calculation based on resolution and frame rate
- **Caching**: HTTP caching headers for improved delivery performance
- **Parallel Processing**: Efficient use of system resources during transcoding

## Known Issues and Limitations

- Current implementation has a bug in the HLS functionality that needs to be addressed
- Large files may require significant processing time for conversion
- Conversion process is CPU-intensive and may impact server performance
- Limited browser compatibility (requires modern browsers with MSE support)

## Future Enhancements

- Server-side caching of converted videos
- Support for additional streaming formats (MPEG-DASH, Smooth Streaming)
- Hardware acceleration for faster transcoding
- Thumbnail generation for seeking preview
- Subtitle/caption support in HLS streams
- DRM integration for protected content

## Conclusion

The HLS Sprint Project represents a significant advancement in our video player's capabilities, enabling adaptive streaming for improved user experience across various network conditions. While there are still some issues to resolve, the foundation has been laid for a robust, modern video streaming solution. 