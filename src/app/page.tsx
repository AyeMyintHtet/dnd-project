"use client";

import { Palette } from "@/components/palette/palette";
import { Canvas } from "@/components/canvas/canvas";
import { InspectorPanel } from "@/components/inspector/inspector-panel";

export default function Home() {
  return (
    <main className="flex h-screen w-full bg-background text-foreground overflow-hidden">
      {/* Left Sidebar */}
      <Palette />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col h-full bg-gray-50/5 dark:bg-zinc-900/50 relative">
        <header className="h-14 border-b border-border flex items-center px-6 bg-card">
          <h1 className="font-bold text-sm">FlowBuilder <span className="font-normal text-muted-foreground ml-2">v0.1.0</span></h1>
          <div className="ml-auto flex gap-2">
            {/* Toolbar actions could go here */}
          </div>
        </header>
        <Canvas />
      </div>

      {/* Right Sidebar */}
      <InspectorPanel />
    </main>
  );
}
