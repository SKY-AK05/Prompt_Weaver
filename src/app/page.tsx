"use client";

import * as React from 'react';
import SplashScreen from '@/components/client/splash-screen';
import PromptWeaverClient from '@/components/client/prompt-weaver-client';

export default function SinglePageHome() {
  const [showSplashScreen, setShowSplashScreen] = React.useState(true);

  const handleSplashFinished = () => {
    setShowSplashScreen(false);
  };

  if (showSplashScreen) {
    return <SplashScreen onFinished={handleSplashFinished} />;
  }

  return (
    <div className="w-full flex-grow flex flex-col items-center justify-center">
      <PromptWeaverClient />
    </div>
  );
}

    
