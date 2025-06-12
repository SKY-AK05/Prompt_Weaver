
"use client";

import * as React from 'react';
import { cn } from '@/lib/utils';

interface BackgroundPromptCardProps {
  title: string;
  content: string;
  isLeft?: boolean;
  className?: string;
}

const BackgroundPromptCard: React.FC<BackgroundPromptCardProps> = ({ title, content, isLeft = false, className }) => {
  return (
    <div 
      className={cn(
        "w-[300px] md:w-[380px] h-auto bg-transparent text-card-foreground p-4 border border-foreground shadow-lg rounded-[11px]",
        "transform",
        isLeft ? "-rotate-3" : "rotate-3",
        className
      )}
    >
      <h3 className="text-sm font-semibold text-primary mb-2 truncate">"{title}"</h3>
      <div className="my-2 border-t border-foreground"></div>
      <p className="text-xs text-foreground leading-relaxed line-clamp-5">
        {content}
      </p>
    </div>
  );
};

export default BackgroundPromptCard;
