
"use client";

import * as React from 'react';
import { cn } from '@/lib/utils';

interface BrainIllustrationIconProps {
  className?: string;
}

const BrainIllustrationIcon: React.FC<BrainIllustrationIconProps> = ({ className }) => {
  return (
    <svg
      width="64" // Default intrinsic width, Tailwind will override
      height="64" // Default intrinsic height, Tailwind will override
      viewBox="0 0 200 200" // A viewBox that allows for some detail
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("inline-block", className)}
    >
      <path
        d="M100 20C66.86 20 40 46.86 40 80C40 99.83 50.29 117.38 66 127.6V105C66 93.95 74.95 85 86 85H114C125.05 85 134 93.95 134 105V127.6C149.71 117.38 160 99.83 160 80C160 46.86 133.14 20 100 20Z"
        stroke="currentColor"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.1"
      />
      <path
        d="M70 130C60 140 60 155 70 165C80 175 95 175 105 165"
        stroke="currentColor"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M130 130C140 140 140 155 130 165C120 175 105 175 95 165"
        stroke="currentColor"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M100 120C100 110 100 90 100 80M100 120C100 130 100 150 100 160"
        stroke="currentColor"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M80 100C70 100 60 110 60 120M120 100C130 100 140 110 140 120"
        stroke="currentColor"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="30" y="140" width="140" height="40" rx="10" stroke="currentColor" strokeWidth="8" fill="currentColor" fillOpacity="0.1"/>
      <line x1="50" y1="160" x2="150" y2="160" stroke="currentColor" strokeWidth="8" strokeLinecap="round"/>
    </svg>
  );
};

export default BrainIllustrationIcon;
