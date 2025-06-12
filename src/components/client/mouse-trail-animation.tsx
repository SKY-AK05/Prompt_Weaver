
"use client";

import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils'; // cn might not be needed if not applying conditional classes

const MILKY_WHITE_COLOR = '#F5F5F5';
const BLACK_COLOR = '#000000';
const NUM_CIRCLES = 15; // Number of circles in the trail

const MouseTrailAnimation = () => {
  const coords = useRef({ x: 0, y: 0 });
  const circles = useRef<(HTMLDivElement & { x?: number; y?: number })[]>([]);
  const [trailElementColor, setTrailElementColor] = useState(BLACK_COLOR);

  useEffect(() => {
    const handleThemeChange = () => {
      if (document.documentElement.classList.contains('dark')) {
        setTrailElementColor(MILKY_WHITE_COLOR);
      } else {
        setTrailElementColor(BLACK_COLOR);
      }
    };

    handleThemeChange(); // Initial check

    const observer = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          handleThemeChange();
          break;
        }
      }
    });

    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    const handleMouseMove = (e: MouseEvent) => {
      coords.current.x = e.clientX;
      coords.current.y = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);

    circles.current.forEach((circleEl) => {
      if (circleEl) {
        circleEl.x = coords.current.x;
        circleEl.y = coords.current.y;
      }
    });

    let animationFrameId: number;
    const animate = () => {
      let leaderX = coords.current.x;
      let leaderY = coords.current.y;

      circles.current.forEach((circle, index) => {
        if (!circle || typeof circle.x === 'undefined' || typeof circle.y === 'undefined') {
          // Initialize position if not set
          circle.x = leaderX;
          circle.y = leaderY;
        }

        const currentX = circle.x;
        const currentY = circle.y;

        const dX = leaderX - currentX;
        const dY = leaderY - currentY;

        circle.x += dX * 0.3; 
        circle.y += dY * 0.3;

        circle.style.left = `${circle.x - 12}px`; // 12 is half of 24px width
        circle.style.top = `${circle.y - 12}px`;  // 12 is half of 24px height
        
        // Scale based on position in the trail
        const scale = (NUM_CIRCLES - index) / NUM_CIRCLES;
        circle.style.transform = `scale(${scale})`;
        circle.style.opacity = `${scale}`; // Optional: fade out further circles

        leaderX = circle.x;
        leaderY = circle.y;
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      observer.disconnect();
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []); // Empty dependency array means this runs once on mount and cleans up on unmount

  return (
    <>
      {Array.from({ length: NUM_CIRCLES }).map((_, index) => (
        <div
          key={index}
          ref={(el) => {
            if (el) circles.current[index] = el as typeof circles.current[0];
          }}
          className="trail-circle" // CSS class defines base size, border-radius, position, pointer-events, z-index
          style={{
            backgroundColor: trailElementColor, // Dynamic color based on theme
            // Opacity can also be set here if not tied to scale, or managed by scale as above
          }}
        />
      ))}
    </>
  );
};

export default MouseTrailAnimation;
