
"use client";

import * as React from 'react';
import { cn } from '@/lib/utils';

interface LightbulbIconProps {
  className?: string;
}

const LightbulbIcon: React.FC<LightbulbIconProps> = ({ className }) => {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("inline-block", className)}
    >
      <path
        d="M9 19C9 20.1046 9.89543 21 11 21H13C14.1046 21 15 20.1046 15 19V18H9V19Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 18V14.5C12 14.5 14.5 12.5 14.5 9.5C14.5 6.46243 12.0376 4 9 4C5.96243 4 3.5 6.46243 3.5 9.5C3.5 12.5 6 14.5 6 14.5V18H12Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
       <path
        d="M8 2C8 2 8.5 4 10.5 4C12.5 4 13 2 13 2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default LightbulbIcon;
