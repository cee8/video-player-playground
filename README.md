This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

# Digital Video Investigation Project List


## Rebuffer Chart Maker

A visualization tool for creating and analyzing rebuffer trade-off charts for adaptive bitrate streaming.

### Overview

This tool generates high-quality visualization graphs for analyzing the relationship between segment length, smoothing window configurations, and buffering in adaptive video streaming. These visualizations help identify optimal settings for minimizing rebuffering while maximizing bitrate.

### Key Files

- **plot-maker.py**: Core visualization engine with customizable styling and chart generation
- **visualization_styles.py**: Shared styling components for consistent visual identity
- **buffer_dynamics.py**: Buffer behavior visualization for understanding playback dynamics
- **heatmap_analysis.py**: Heatmaps for comparing multiple metrics simultaneously
- **tradeoff_analysis.py**: Line charts showing relationships between configuration variables
- **sweep_results.csv**: Sample data for visualization (segment lengths, smoothing windows, etc.)

```text
rebuffer-chart-maker/
├── plot-maker.py              # Main visualization script with configurable styling
├── visualization_styles.py    # Shared UI components and styling utilities
├── buffer_dynamics.py         # Buffer behavior visualization tool
├── heatmap_analysis.py        # Heatmap generation for multi-variable analysis
├── tradeoff_analysis.py       # Line charts for parameter relationship analysis
├── markov-chain.py            # Network state transition modeling
├── config.yaml                # Configuration settings
├── requirements.txt           # Python dependencies
├── sweep_results.csv          # Sample data for visualizations
└── img/                       # Generated visualization outputs
    ├── buffer_dynamics.png
    ├── heatmap_analysis.png
    └── tradeoff_analysis.png
```

### How to Use

1. Ensure Python and required dependencies are installed (matplotlib, pandas, numpy, seaborn)
2. Run any of the visualization scripts:
   ```bash
   python plot-maker.py    # For trade-off analysis
   python buffer_dynamics.py    # For buffer behavior visualization
   ```
3. Customize visualizations by modifying parameters in the script files

### Visualizations Available

- **Trade-off Analysis**: Compares rebuffer time and bitrate across different segment lengths and smoothing windows
- **Buffer Dynamics**: Illustrates buffer filling and depleting during streaming
- **Heatmap Analysis**: Combines multiple metrics into color-coded heatmaps

### Learning Insights

This project demonstrates:
- How segment length and smoothing window settings affect streaming performance
- The trade-offs between video quality (bitrate) and playback stability (rebuffering)
- Data visualization techniques for complex multi-variable relationships
- Implementation of professional-grade matplotlib visualizations with custom styling
- How to build a modular visualization system with reusable components

### Sample Output

The visualizations help identify optimal configuration points where both rebuffering is minimized and video quality is maximized, which is crucial for adaptive bitrate streaming algorithms.

## Interactive Video Player Playground

A next-generation video player with advanced adaptive streaming capabilities, performance metrics visualization, and interactive controls.

![Video Player Playground](https://via.placeholder.com/1200x600?text=Video+Player+Playground)

## Overview

This Next.js application provides a platform for experimenting with video playback technologies, focusing on adaptive bitrate streaming implementation and analysis. The playground allows users to test different streaming strategies, visualize performance metrics in real-time, and understand the impact of various configurations on video delivery quality.

### Key Features

- **Adaptive Bitrate Streaming**: DASH protocol implementation with configurable parameters
- **Real-time Performance Metrics**: Visualize bitrate, buffer length, and download speed
- **Interactive Controls**: Keyboard shortcuts, custom UI controls, and playback settings
- **Responsive Design**: Elegant animations and layout adaptations for different screen sizes
- **Custom Aspect Ratios**: Support for various video formats and aspect ratio controls
- **Video Library Management**: Browse and organize video content with thumbnails and metadata

## Project Structure

### Key Files

- **VideoPlayer.tsx**: Core player component with adaptive streaming support and advanced controls
- **VideoLibrary.tsx**: Media browsing interface with thumbnail generation and filtering
- **BitrateMetrics.tsx**: Real-time visualization of streaming performance metrics
- **useVideoControls.tsx**: Custom hook for unified player control logic
- **VideoCard.tsx**: Reusable component for displaying video thumbnails with metadata

```text
video-player-playground/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── VideoPlayer.tsx       # Main player with adaptive streaming support
│   │   │   ├── VideoLibrary.tsx      # Media browsing interface
│   │   │   ├── BitrateMetrics.tsx    # Performance metrics visualization
│   │   │   └── VideoCard.tsx         # Thumbnail display component
│   │   ├── hooks/
│   │   │   └── useVideoControls.tsx  # Unified player control logic
│   │   ├── utils/
│   │   │   └── adaptive-streaming.ts # Streaming algorithm implementations
│   │   ├── api/
│   │   │   └── video/                # Video processing endpoints
│   │   ├── page.tsx                  # Main application page
│   │   └── layout.tsx                # Application layout structure
├── public/
│   └── Videos/                       # Sample video content for testing
├── tailwind.config.ts                # UI styling configuration
├── next.config.ts                    # Next.js configuration
└── package.json                      # Project dependencies
```

## Installation and Setup

### Prerequisites

- Node.js 18.x or higher
- npm, yarn, or pnpm package manager
- Modern web browser with support for MSE (Media Source Extensions)

### Installation Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/Videographic-Projects/video-player-playground.git
   cd video-player-playground
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. Add test videos to the public/Videos directory (optional):
   - The player supports MP4, WebM, and HLS/DASH streaming formats
   - Sample videos can be placed in the public/Videos directory

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to explore the video player

## Usage Guide

### Player Controls

The video player supports various interaction methods:

- **Keyboard Controls**:
  - Space: Play/Pause
  - Left/Right Arrows: Seek backward/forward
  - Up/Down Arrows: Increase/decrease volume
  - F: Toggle fullscreen
  - M: Toggle mute
  - Esc: Exit fullscreen or close player

- **On-screen Controls**:
  - Progress bar with seek functionality
  - Volume slider
  - Playback speed control
  - Quality selection (when adaptive streaming is enabled)
  - Aspect ratio switching
  - Picture-in-picture mode

### Adaptive Streaming Configuration

The player includes a dashboard for configuring adaptive streaming parameters:

1. Enable adaptive streaming using the toggle switch
2. Configure buffer thresholds for quality switching
3. Adjust segment size preferences
4. Set minimum and maximum bitrate constraints
5. Monitor real-time performance metrics during playback

### Performance Metrics

The BitrateMetrics component displays real-time playback statistics:

- Current video bitrate
- Average bitrate over time
- Buffer length in seconds
- Network download speed
- Quality switch events

## Development and Customization

### Adding New Features

To extend the player functionality:

1. Component-based architecture allows for easy extension
2. Add new components in the `src/app/components` directory
3. Implement new hooks in the `src/app/hooks` directory
4. Add utility functions in the `src/app/utils` directory

### Styling Customization

The project uses Tailwind CSS for styling:

1. Modify the `tailwind.config.ts` file to customize theming
2. Component-level styles can be found in the respective component files
3. Global styles are defined in `globals.css`

### Adding API Endpoints

To add new server functionality:

1. Create new API routes in the `src/app/api` directory
2. Implement backend logic for video processing, metadata extraction, etc.

## Technical Insights

This project demonstrates:

- Implementation of adaptive streaming algorithms in a modern web framework
- Real-time performance metric visualization techniques
- Progressive enhancement for video playback user experience
- Component-based architecture for media applications
- Integration between low-level media APIs and high-level UI components
- Animation techniques for smooth transitions between player states

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Related Projects

### Rebuffer Chart Maker

A visualization tool for creating and analyzing rebuffer trade-off charts for adaptive bitrate streaming.

#### Overview

This tool generates high-quality visualization graphs for analyzing the relationship between segment length, smoothing window configurations, and buffering in adaptive video streaming. These visualizations help identify optimal settings for minimizing rebuffering while maximizing bitrate.

#### Repository

[Rebuffer Chart Maker](https://github.com/Videographic-Projects/rebuffer-chart-maker)

---

Built with [Next.js](https://nextjs.org) and deployed on [Vercel](https://vercel.com)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
