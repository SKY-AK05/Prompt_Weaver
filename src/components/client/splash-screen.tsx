"use client";

import * as React from 'react';
import { cn } from "@/lib/utils";
import Image from 'next/image';

interface SplashScreenProps {
  onFinished: () => void;
}

export default function SplashScreen({ onFinished }: SplashScreenProps) {
  const [fadeOut, setFadeOut] = React.useState(false);
  const [elementsFadeIn, setElementsFadeIn] = React.useState(false);

  // Always use dark theme + light logo during splash
  const logoSrc = '/assets/logo-dark-theme.png';

  React.useEffect(() => {
    // Step 1: Show splash elements after 100ms
    const elementsTimer = setTimeout(() => {
      setElementsFadeIn(true);
    }, 100);

    // Step 2: Fade out the splash after 2.5 seconds
    const fadeOutTimer = setTimeout(() => {
      setFadeOut(true);
    }, 2500);

    // Step 3: After 3 seconds, apply theme
    const finishedTimer = setTimeout(() => {
      // Check if user has a saved theme preference
      const storedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
      
      if (!storedTheme) {
        // For new users, set dark theme as default
        document.documentElement.classList.remove('light');
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        // For returning users, use their saved preference
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(storedTheme);
      }

      // Finish splash
      onFinished();
    }, 3000);

    return () => {
      clearTimeout(elementsTimer);
      clearTimeout(fadeOutTimer);
      clearTimeout(finishedTimer);
    };
  }, [onFinished]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex flex-col items-center justify-center bg-black transition-opacity duration-500 ease-in-out",
        fadeOut ? "opacity-0" : "opacity-100"
      )}
    >
      <div
        className={cn(
          "flex flex-col items-center transition-opacity duration-1000 ease-in-out",
          elementsFadeIn ? "opacity-100" : "opacity-0"
        )}
      >
        <Image
          src={logoSrc}
          alt="PromptWeaver Logo"
          width={210}
          height={160}
          className="object-contain"
          priority
        />
      </div>
    </div>
  );
}
