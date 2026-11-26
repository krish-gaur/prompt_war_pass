import { useEffect, useRef } from 'react';
import { renderPass } from '../lib/drawPass';
import type { CropPixels } from '../types';

interface PassCanvasProps {
  name: string;
  college: string;
  photo?: HTMLImageElement | null;
  crop?: CropPixels | null;
  placeholders?: boolean;
  className?: string;
  decorative?: boolean;
}

/**
 * Renders the master 1024x1536 pass template with the participant's
 * photo + name + college overlaid. CSS scales it responsively.
 */
export default function PassCanvas({
  name,
  college,
  photo,
  crop,
  placeholders = true,
  className = '',
  decorative = true,
}: PassCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      void renderPass(canvas, {
        name,
        college,
        photo: photo ?? null,
        crop: crop ?? null,
        showPlaceholders: placeholders,
      });
    });
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [name, college, photo, crop, placeholders]);

  return (
    <canvas
      ref={canvasRef}
      width={1024}
      height={1536}
      aria-label={
        decorative
          ? 'Preview of your personalized Prompt Wars participant pass'
          : 'Your Prompt Wars participant pass'
      }
      role="img"
      className={`block h-auto w-full rounded-[22px] ${className}`}
    />
  );
}
