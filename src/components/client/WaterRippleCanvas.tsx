"use client";

import React, { useRef, useEffect, useState } from "react";

interface Ripple {
  x: number;
  y: number;
  radius: number;
  alpha: number;
}

const RIPPLE_GROWTH = 1.5; // px per frame (slower)
const RIPPLE_FADE = 0.014; // alpha per frame
const RIPPLE_THROTTLE = 70; // ms between ripples (slower)
const RIPPLE_COLOR_LIGHT = "rgba(74, 68, 68, 0.45)";
const RIPPLE_COLOR_DARK = "rgba(0, 0, 0, 0.32)"; //rgb(44, 107, 170), more visible

const WaterRippleCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ripples = useRef<Ripple[]>([]);
  const animationRef = useRef<number>();
  const lastRippleTime = useRef<number>(0);
  const [isDark, setIsDark] = useState(false);

  // Detect theme
  useEffect(() => {
    function updateTheme() {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setIsDark(true);
      } else {
        setIsDark(false);
      }
    }
    updateTheme();
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    mql.addEventListener('change', updateTheme);
    return () => {
      mql.removeEventListener('change', updateTheme);
    };
  }, []);

  // Resize canvas to fill window
  useEffect(() => {
    function resize() {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    }
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  // Animation loop
  useEffect(() => {
    function draw() {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ripples.current = ripples.current.filter(r => r.alpha > 0.01 && r.radius < 50);
      for (const ripple of ripples.current) {
        // Draw multiple wave rings for each ripple
        const numWaves = 4; // Number of visible wave rings
        for (let i = 0; i < numWaves; i++) {
          const phase = (ripple.radius / 8) + i * Math.PI / numWaves;
          const waveRadius = ripple.radius + i * 8;
          const waveAlpha = ripple.alpha * (0.5 + 0.5 * Math.sin(phase));
          if (waveAlpha < 0.01) continue;
          ctx.beginPath();
          ctx.arc(ripple.x, ripple.y, waveRadius, 0, 2 * Math.PI);
          ctx.strokeStyle = isDark ? RIPPLE_COLOR_DARK : RIPPLE_COLOR_LIGHT;
          ctx.globalAlpha = waveAlpha;
          ctx.lineWidth = 2 + 2 * Math.sin(phase);
          ctx.stroke();
          ctx.globalAlpha = 1.0; // Reset alpha
        }
        ripple.radius += RIPPLE_GROWTH;
        ripple.alpha -= RIPPLE_FADE;
      }
      animationRef.current = requestAnimationFrame(draw);
    }
    animationRef.current = requestAnimationFrame(draw);
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
  }, [isDark]);

  // Add ripple on mouse move (throttled)
  useEffect(() => {
    function addRipple(e: MouseEvent) {
      const now = Date.now();
      if (now - lastRippleTime.current < RIPPLE_THROTTLE) return;
      lastRippleTime.current = now;
      ripples.current.push({
        x: e.clientX,
        y: e.clientY,
        radius: 0,
        alpha: 1,
      });
    }
    window.addEventListener("mousemove", addRipple);
    return () => {
      window.removeEventListener("mousemove", addRipple);
    };
  }, []);

  return null;
};

export default WaterRippleCanvas; 