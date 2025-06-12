
"use client";

import * as React from 'react';
import { cn } from '@/lib/utils';

interface QuestionMarkIconProps {
  className?: string;
}

const QuestionMarkIcon: React.FC<QuestionMarkIconProps> = ({ className }) => {
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
        d="M12 19C12.5523 19 13 18.5523 13 18C13 17.4477 12.5523 17 12 17C11.4477 17 11 17.4477 11 18C11 18.5523 11.4477 19 12 19Z"
        fill="currentColor"
      />
      <path
        d="M12 2C9.23858 2 7 4.23858 7 7C7 8.83852 8.00228 10.4138 9.5 11.2998V13C9.5 13.8284 10.1716 14.5 11 14.5H13C13.8284 14.5 14.5 13.8284 14.5 13V11.2998C15.9977 10.4138 17 8.83852 17 7C17 4.23858 14.7614 2 12 2ZM12 12.5C11.1716 12.5 10.5 11.8284 10.5 11V10.5C10.5 9.67157 11.1716 9 12 9C12.8284 9 13.5 9.67157 13.5 10.5V11C13.5 11.8284 12.8284 12.5 12 12.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default QuestionMarkIcon;
