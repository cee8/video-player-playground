'use client';

import React from 'react';
import VideoLibrary from './components/VideoLibrary';
//import TestPlayer from './components/TestPlayer';

export default function Home() {
  return (
    <main className="min-h-screen p-4">
      <h1 className="text-4xl font-bold mb-6">Video Library</h1>
      <VideoLibrary />
      <h1 className="text-2xl font-bold mb-4">Adaptive Streaming Test</h1>
      {/*<TestPlayer />*/}
    </main>
  );
}
