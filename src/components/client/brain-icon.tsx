"use client";

import * as React from 'react';
import { cn } from '@/lib/utils';
import { useMagnetic } from './useMagnetic';

interface BrainIconProps {
  className?: string;
}

const BrainIcon: React.FC<BrainIconProps> = ({ className }) => {
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
        d="M12 2C9.23858 2 7 4.23858 7 7C7 8.5998 7.64643 10.0301 8.66667 11H5C3.89543 11 3 11.8954 3 13V16C3 17.1046 3.89543 18 5 18H6.5C6.77614 18 7 18.2239 7 18.5V20C7 21.1046 7.89543 22 9 22H15C16.1046 22 17 21.1046 17 20V18.5C17 18.2239 17.2239 18 17.5 18H19C20.1046 18 21 17.1046 21 16V13C21 11.8954 20.1046 11 19 11H15.3333C16.3536 10.0301 17 8.5998 17 7C17 4.23858 14.7614 2 12 2ZM9 11C9.26087 10.0813 9.74873 9.24889 10.4009 8.59669C10.5924 8.40522 10.7487 8.18683 10.8667 7.9452C10.9989 7.67911 11.0667 7.36667 11.0667 7C11.0667 5.36313 10.0369 4.11834 9.06667 4.00667C9.04444 4.00222 9.02222 4 9 4C8.46957 4 8 4.46957 8 5C8 5.19521 8.04867 5.38166 8.13333 5.54889C8.29022 5.86222 8.54889 6.12222 8.86667 6.27778C9.73445 6.70222 10.0667 7.69445 10.0667 8.5C10.0667 8.88889 9.96556 9.22222 9.86667 9.5C9.65222 10.0089 9.32222 10.4556 9 10.7667V11ZM15 11V10.7667C14.6778 10.4556 14.3478 10.0089 14.1333 9.5C14.0344 9.22222 13.9333 8.88889 13.9333 8.5C13.9333 7.69445 14.2656 6.70222 15.1333 6.27778C15.4511 6.12222 15.7098 5.86222 15.8667 5.54889C15.9513 5.38166 16 5.19521 16 5C16 4.46957 15.5304 4 15 4C14.9778 4 14.9556 4.00222 14.9333 4.00667C13.9631 4.11834 12.9333 5.36313 12.9333 7C12.9333 7.36667 13.0011 7.67911 13.1333 7.9452C13.2513 8.18683 13.4076 8.40522 13.5991 8.59669C14.2513 9.24889 14.7391 10.0813 15 11Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default BrainIcon;

export const MagneticBrainIcon: React.FC<BrainIconProps> = ({ className }) => {
  const ref = useMagnetic();
  return (
    <div ref={ref} style={{ display: 'inline-block', transition: 'transform 0.2s' }}>
      <BrainIcon className={className} />
    </div>
  );
};
