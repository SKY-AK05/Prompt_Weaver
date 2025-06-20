"use client";

import React, { useEffect, useRef, useState } from "react";

const STAR_SIZE = 14;
const ATTRACTION_RADIUS = 120; // px
const STAR_COUNT = 18;
const STAR_COLOR_LIGHT = "#fbbebe";
const STAR_COLOR_DARK = "#f15b5b";

function getRandomPosition(width: number, height: number) {
  // Padding so stars don't go offscreen
  const pad = 32;
  return {
    x: Math.random() * (width - STAR_SIZE - pad * 2) + pad,
    y: Math.random() * (height - STAR_SIZE - pad * 2) + pad,
  };
}

interface StarState {
  baseX: number;
  baseY: number;
  x: number;
  y: number;
  isNear?: boolean;
}

// Keyframes for blinking animation
const blinkKeyframes = `
@keyframes star-blink {
  0% { opacity: 0.7; }
  50% { opacity: 1; }
  100% { opacity: 0.7; }
}
`;

const MagneticFloatingIcons: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [stars, setStars] = useState<StarState[]>([]);
  const mouse = useRef({ x: -1000, y: -1000 });
  const animationRef = useRef<number>();

  // Inject keyframes for blinking animation once
  useEffect(() => {
    if (!document.getElementById('star-blink-keyframes')) {
      const style = document.createElement('style');
      style.id = 'star-blink-keyframes';
      style.innerHTML = blinkKeyframes;
      document.head.appendChild(style);
    }
  }, []);

  // Initialize stars on mount
  useEffect(() => {
    function setInitialStars() {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const arr: StarState[] = [];
      for (let i = 0; i < STAR_COUNT; i++) {
        const { x, y } = getRandomPosition(width, height);
        arr.push({ baseX: x, baseY: y, x, y, isNear: false });
      }
      setStars(arr);
    }
    setInitialStars();
    window.addEventListener("resize", setInitialStars);
    return () => window.removeEventListener("resize", setInitialStars);
  }, []);

  // Mouse tracking
  useEffect(() => {
    function handleMouse(e: MouseEvent) {
      mouse.current = { x: e.clientX, y: e.clientY };
    }
    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, []);

  // Animation loop
  useEffect(() => {
    function animate() {
      setStars(prevStars =>
        prevStars.map(star => {
          const dx = mouse.current.x - (star.x + STAR_SIZE / 2);
          const dy = mouse.current.y - (star.y + STAR_SIZE / 2);
          const dist = Math.sqrt(dx * dx + dy * dy);
          let isNear = dist < ATTRACTION_RADIUS;
          if (isNear) {
            // Move towards mouse (springy)
            const lerp = 0.18;
            return {
              ...star,
              x: star.x + dx * lerp,
              y: star.y + dy * lerp,
              isNear,
            };
          } else {
            // Return to base
            const lerp = 0.10;
            return {
              ...star,
              x: star.x + (star.baseX - star.x) * lerp,
              y: star.y + (star.baseY - star.y) * lerp,
              isNear,
            };
          }
        })
      );
      animationRef.current = requestAnimationFrame(animate);
    }
    animationRef.current = requestAnimationFrame(animate);
    return () => animationRef.current && cancelAnimationFrame(animationRef.current);
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 0,
        overflow: "hidden",
      }}
    >
      {stars.map((star, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: STAR_SIZE,
            height: STAR_SIZE,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: `translate3d(${star.x}px, ${star.y}px, 0) scale(${Math.abs(star.x - star.baseX) > 2 || Math.abs(star.y - star.baseY) > 2 ? 1.15 : 1})`,
            transition: "box-shadow 0.2s, filter 0.2s, background 0.2s", // for smoothness
            zIndex: 1,
            opacity: 0.85,
            willChange: "transform",
            animation: `star-blink 2.4s ease-in-out infinite`,
            animationDelay: `${(i % 7) * 0.3}s`, // stagger for natural effect
          }}
        >
          <svg width={STAR_SIZE} height={STAR_SIZE} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{transition: 'fill 0.3s'}}>
            <circle cx="12" cy="12" r="10" fill={star.isNear ? STAR_COLOR_DARK : STAR_COLOR_LIGHT} />
          </svg>
        </div>
      ))}
    </div>
  );
};

export default MagneticFloatingIcons; 