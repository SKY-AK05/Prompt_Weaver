
"use client";

import * as React from 'react';
import { cn } from '@/lib/utils';

interface PenIconProps {
  className?: string;
}

const PenIcon: React.FC<PenIconProps> = ({ className }) => {
  return (
    <svg 
      width="48" 
      height="48" 
      viewBox="0 0 48 48" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={cn("inline-block", className)} // Added inline-block for better sizing control with w-X h-X
    >
      <path 
        d="M29.5775 7.5428L34.8346 12.8135M29.5775 7.5428L10.0002 27.1602C9.45026 27.7114 9.08296 28.4115 8.94025 29.1602L8.00023 37.1602L15.9773 36.2173C16.7241 36.0742 17.4224 35.7058 17.9773 35.1515L37.5775 15.5428M29.5775 7.5428L37.5775 15.5428M37.5775 15.5428L34.8346 12.8135M34.8346 12.8135L21.9773 25.7076" 
        stroke="currentColor" // Changed to currentColor to inherit color from parent via text-primary
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M25.9774 11.1602L33.1547 18.3515" 
        stroke="currentColor" // Changed to currentColor
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default PenIcon;
