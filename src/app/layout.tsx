import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import * as React from 'react';
import Link from 'next/link';
import PenIcon from '@/components/client/pen-icon';
import BrainIcon from '@/components/client/brain-icon'; // Keep existing custom BrainIcon if used elsewhere, or remove if fully replaced by lucide
import LightbulbIcon from '@/components/client/lightbulb-icon'; // Keep existing custom LightbulbIcon if used elsewhere
import QuestionMarkIcon from '@/components/client/question-mark-icon';
import BrainIllustrationIcon from '@/components/client/brain-illustration-icon';
import { Brain, Wand2, Lightbulb as LucideLightbulb } from 'lucide-react'; // Added Lucide icons
import MouseTrailAnimation from '@/components/client/mouse-trail-animation'; // Import the mouse trail
import { AuthProvider } from '@/components/layout/app-header';

export const metadata: Metadata = {
  title: 'PromptWeaver',
  description: 'Refine your ideas into powerful AI prompts.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col bg-background text-foreground">
        <MouseTrailAnimation /> {/* Add the mouse trail component here */}
        {/* Global Decorative Icons Container */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          {/* Existing Pen Icons */}
          <PenIcon className="absolute top-[10%] left-[5%] w-10 h-10 transform -rotate-[25deg] opacity-20 text-primary" />
          <PenIcon className="absolute top-[60%] left-[15%] w-8 h-8 transform rotate-[10deg] opacity-15 text-primary hidden md:block" />
          <PenIcon className="absolute top-[20%] right-[8%] w-12 h-12 transform rotate-[30deg] opacity-20 text-primary" />
          <PenIcon className="absolute bottom-[15%] right-[12%] w-9 h-9 transform -rotate-[10deg] opacity-20 text-primary hidden lg:block" />
          <PenIcon className="absolute bottom-[5%] left-[40%] w-7 h-7 transform rotate-[5deg] opacity-10 text-primary" />
          <PenIcon className="absolute top-[50%] right-[45%] w-10 h-10 transform -rotate-[35deg] opacity-15 text-primary hidden sm:block" />
          
          {/* Existing Custom Icons (adjust or remove if lucide versions are preferred everywhere) */}
          <BrainIcon className="absolute bottom-[10%] left-[2%] w-11 h-11 transform rotate-[15deg] opacity-10 text-primary hidden lg:block" />
          <LightbulbIcon className="absolute top-[5%] right-[25%] w-9 h-9 transform -rotate-[5deg] opacity-10 text-primary hidden md:block" />
          <QuestionMarkIcon className="absolute bottom-[25%] right-[2%] w-10 h-10 transform rotate-[20deg] opacity-10 text-primary hidden sm:block" />
          <BrainIllustrationIcon className="absolute top-[50%] left-[calc(50%-4rem)] w-20 h-20 transform -rotate-[5deg] opacity-5 text-primary hidden lg:block" />

          {/* New Lucide Icons */}
          <Brain className="absolute top-[30%] left-[25%] w-12 h-12 transform rotate-[15deg] opacity-10 text-primary hidden md:block" />
          <Wand2 className="absolute bottom-[20%] right-[20%] w-10 h-10 transform -rotate-[20deg] opacity-15 text-primary" />
          <LucideLightbulb className="absolute top-[70%] left-[5%] w-9 h-9 transform rotate-[25deg] opacity-15 text-primary hidden sm:block" />
          <PenIcon className="absolute top-[85%] right-[5%] w-8 h-8 transform rotate-[-15deg] opacity-10 text-primary" />
          <Brain className="absolute bottom-[5%] right-[40%] w-7 h-7 transform -rotate-[10deg] opacity-5 text-primary hidden lg:block" />
          <Wand2 className="absolute top-[5%] left-[35%] w-9 h-9 transform rotate-[30deg] opacity-10 text-primary hidden md:block" />
        </div>

        <AuthProvider>
          {children}
        </AuthProvider>

        <footer className="w-full py-8 text-center text-sm text-muted-foreground relative z-10 border-t border-border mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p>&copy; {new Date().getFullYear()} PromptWeaver. All rights reserved.</p>
            <nav className="flex gap-4">
              <Link href="/terms" passHref legacyBehavior><a className="hover:text-primary">Terms</a></Link>
              <span className="text-muted-foreground/50">|</span>
              <Link href="/privacy" passHref legacyBehavior><a className="hover:text-primary">Privacy</a></Link>
              <span className="text-muted-foreground/50">|</span>
              <Link href="/contact" passHref legacyBehavior><a className="hover:text-primary">Contact</a></Link>
            </nav>
          </div>
        </footer>
        <Toaster />
      </body>
    </html>
  );
}
