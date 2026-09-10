import { useEffect, useRef } from "react";

interface AudioVisualizerProps {
  isPlaying: boolean;
  audioElement: HTMLAudioElement | null;
}

export default function AudioVisualizer({ isPlaying }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let phase = 0;
    const barCount = 36;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const barWidth = (width / barCount) * 0.55;
      const gap = (width - barWidth * barCount) / (barCount - 1);

      for (let i = 0; i < barCount; i++) {
        const x = i * (barWidth + gap);
        let amplitude = 0.12;

        if (isPlaying) {
          // Dynamic wave formula with varying frequencies and phases
          const wave1 = Math.sin(phase * 0.08 + i * 0.35);
          const wave2 = Math.cos(phase * 0.05 + i * 0.2);
          const wave3 = Math.sin(phase * 0.12 + (i % 7));
          amplitude = Math.max(0.1, (Math.abs(wave1 * 0.5 + wave2 * 0.3 + wave3 * 0.2) + 0.1));
        } else {
          // Idle gentle waveform shape
          const midDist = 1 - Math.abs(i - barCount / 2) / (barCount / 2);
          amplitude = 0.15 + midDist * 0.15;
        }

        const barHeight = Math.min(height - 4, Math.max(4, amplitude * (height - 8)));
        const y = (height - barHeight) / 2;

        // Visualizer bar gradient
        const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
        if (isPlaying) {
          gradient.addColorStop(0, "#3b82f6"); // blue-500
          gradient.addColorStop(0.5, "#06b6d4"); // cyan-500
          gradient.addColorStop(1, "#3b82f6");
        } else {
          gradient.addColorStop(0, "#94a3b8"); // slate-400
          gradient.addColorStop(1, "#cbd5e1"); // slate-300
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        // Rounded bar ends
        const radius = Math.min(barWidth / 2, barHeight / 2);
        ctx.roundRect(x, y, barWidth, barHeight, radius);
        ctx.fill();
      }

      if (isPlaying) {
        phase += 1;
      }
      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying]);

  return (
    <div id="audio-visualizer-container" className="w-full h-16 bg-slate-900/5 rounded-xl flex items-center justify-center p-2 border border-slate-200">
      <canvas
        ref={canvasRef}
        width={480}
        height={56}
        className="w-full h-full block"
      />
    </div>
  );
}
