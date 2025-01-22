'use client';

import React from 'react';
import VideoLibrary from './components/VideoLibrary';

export default function Home() {
  return (
    <main className="min-h-screen p-4">
      <h1 className="text-4xl font-bold mb-6">Video Library</h1>
      <VideoLibrary />
    </main>
  );
}
