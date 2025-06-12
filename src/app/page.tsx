"use client";

import * as React from 'react';
import SplashScreen from '@/components/client/splash-screen';
import AppHeader from '@/components/layout/app-header';
import PromptWeaverClient from '@/components/client/prompt-weaver-client';
import FeaturesSection from '@/components/sections/features-section';
import ExamplesSection from '@/components/sections/examples-section';
import HowItWorksSection from '@/components/sections/how-it-works-section';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import PenIcon from '@/components/client/pen-icon';
import BackgroundPromptCard from '@/components/client/background-prompt-card';
import { Brain, Lightbulb, Wand2 } from 'lucide-react';
import { useAuth } from '@/components/layout/app-header';

const blogPrompt = "Write a 1000-word blog post discussing how AI is transforming the K-12 education sector. Cover aspects like personalized learning, AI-powered tutoring systems, administrative task automation for teachers, and potential ethical concerns. Adopt an informative yet engaging tone suitable for educators and parents.";
const pythonPrompt = "Generate a Python script that organizes image files (JPG, PNG, GIF) in a source directory into subdirectories based on the year and month the photo was taken (from EXIF data). If EXIF data is unavailable, use the file's last modified date. Include error handling for invalid directories and non-image files.";

export default function SinglePageHome() {
  const { user } = useAuth();
  const [showSplashScreen, setShowSplashScreen] = React.useState(true);
  const [isLoggedInForTool, setIsLoggedInForTool] = React.useState(false);
  const [showPromptTool, setShowPromptTool] = React.useState(false);

  // States for hero entry animations
  const [startHeroAnimations, setStartHeroAnimations] = React.useState(false); // True after splash
  const [animateLeftCard, setAnimateLeftCard] = React.useState(false);
  const [animateRightCard, setAnimateRightCard] = React.useState(false);
  const [animateHeroHeading, setAnimateHeroHeading] = React.useState(false);
  const [animateHeroSubElements, setAnimateHeroSubElements] = React.useState(false);
  
  // State for hero section visibility via IntersectionObserver
  const [isHeroVisible, setIsHeroVisible] = React.useState(false);
  const heroRef = React.useRef<HTMLDivElement>(null);


  // States for scroll animations for sections below hero
  const [featuresVisible, setFeaturesVisible] = React.useState(false);
  const [howItWorksVisible, setHowItWorksVisible] = React.useState(false);
  const [examplesVisible, setExamplesVisible] = React.useState(false);

  const featuresRef = React.useRef<HTMLDivElement>(null);
  const howItWorksRef = React.useRef<HTMLDivElement>(null);
  const examplesRef = React.useRef<HTMLDivElement>(null);

  const handleSplashFinished = () => {
    setShowSplashScreen(false);
    setStartHeroAnimations(true); 
  };

  // IntersectionObserver for Hero section
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsHeroVisible(entry.isIntersecting);
      },
      { threshold: 0.1 } // Adjust threshold as needed
    );

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    return () => {
      if (heroRef.current) {
        observer.unobserve(heroRef.current);
      }
    };
  }, []);
  
  // Effect to control hero element animations based on visibility and initial start
  React.useEffect(() => {
    if (startHeroAnimations && isHeroVisible) {
      // Initial timed entry or re-entry
      const timer1 = setTimeout(() => setAnimateLeftCard(true), 200);
      const timer2 = setTimeout(() => setAnimateRightCard(true), 200);
      const timer3 = setTimeout(() => setAnimateHeroHeading(true), 500);
      const timer4 = setTimeout(() => setAnimateHeroSubElements(true), 700);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
        clearTimeout(timer4);
      };
    } else if (!isHeroVisible) {
      // Animate out
      setAnimateLeftCard(false);
      setAnimateRightCard(false);
      setAnimateHeroHeading(false);
      setAnimateHeroSubElements(false);
    }
  }, [startHeroAnimations, isHeroVisible]);


  React.useEffect(() => {
    const observerOptions = {
      root: null, 
      rootMargin: '0px',
      threshold: 0.1, 
    };

    const createObserverCallback = (
      setter: React.Dispatch<React.SetStateAction<boolean>>
    ) => {
      return (entries: IntersectionObserverEntry[]) => {
        entries.forEach(entry => {
          // Only set to true if intersecting, otherwise set to false to animate out
          setter(entry.isIntersecting);
        });
      };
    };

    const observers: IntersectionObserver[] = [];

    const sectionsToObserve = [
      { ref: featuresRef, setter: setFeaturesVisible, id: "features" },
      { ref: howItWorksRef, setter: setHowItWorksVisible, id: "how-it-works" },
      { ref: examplesRef, setter: setExamplesVisible, id: "examples" },
    ];

    sectionsToObserve.forEach(section => {
      if (section.ref.current) {
        const observer = new IntersectionObserver(createObserverCallback(section.setter), observerOptions);
        observer.observe(section.ref.current);
        observers.push(observer);
      }
    });

    return () => {
      observers.forEach(observer => observer.disconnect());
    };
  }, []);

  const handleTryNowClick = React.useCallback(() => {
    setShowPromptTool(true);
    // Use a longer timeout to ensure the section is fully rendered
    setTimeout(() => {
      const section = document.getElementById('prompt-tool');
      if (section) {
        // First scroll to the top of the page to ensure proper scroll behavior
        window.scrollTo({ top: 0, behavior: 'smooth' });
        // Then scroll to the section after a short delay
        setTimeout(() => {
          section.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }, 200);
  }, []);

  React.useEffect(() => {
    const checkHashAndTriggerTool = () => {
      if (typeof window !== "undefined" && window.location.hash === '#prompt-tool') {
        handleTryNowClick();
      }
    };
  
    // Check on initial mount
    checkHashAndTriggerTool(); 
  
    // Listen for subsequent hash changes
    window.addEventListener('hashchange', checkHashAndTriggerTool, false);
  
    return () => {
      window.removeEventListener('hashchange', checkHashAndTriggerTool, false);
    };
  }, [handleTryNowClick]);


  return (
    <div className="flex flex-col flex-1 w-full bg-background text-foreground">
      {showSplashScreen ? (
        <SplashScreen onFinished={handleSplashFinished} />
      ) : (
        <AppHeader />
      )}

      <main className="flex-grow flex flex-col items-center text-center relative z-10 overflow-x-hidden">
        {/* Hero Section */}
        <section
          id="hero"
          ref={heroRef}
          className="w-full py-20 md:py-32 lg:py-40 bg-gradient-to-b from-background to-background/80 relative overflow-hidden min-h-[600px] md:min-h-[700px]"
        >
          <div className="absolute inset-0 pointer-events-none text-primary">
            <BackgroundPromptCard
              title="blog on ai"
              content={blogPrompt}
              isLeft={true}
              className={cn(
                "absolute left-[calc(50%-720px)] md:left-[calc(50%-800px)] top-[130px] md:top-[160px] w-[300px] md:w-[380px]",
                "transform transition-all duration-700 ease-out",
                animateLeftCard ? "opacity-60 translate-x-0" : "opacity-0 -translate-x-full"
              )}
            />
            <BackgroundPromptCard
              title="python script to sort pictures"
              content={pythonPrompt}
              isLeft={false}
              className={cn(
                "absolute right-[calc(50%-700px)] md:right-[calc(50%-780px)] top-[210px] md:top-[240px] w-[300px] md:w-[380px]",
                "transform transition-all duration-700 ease-out",
                animateRightCard ? "opacity-60 translate-x-0" : "opacity-0 translate-x-full"
              )}
            />
            
            <PenIcon className="absolute left-[calc(50%-520px)] md:left-[calc(50%-600px)] top-[80px] md:top-[100px] w-12 h-12 transform -rotate-[15deg] opacity-60" />
            <PenIcon className="absolute right-[calc(50%-500px)] md:right-[calc(50%-580px)] top-[160px] md:top-[180px] w-12 h-12 transform rotate-[15deg] opacity-60" />
            <PenIcon className="absolute left-[calc(50%-500px)] md:left-[calc(50%-580px)] bottom-[40px] md:bottom-[70px] w-10 h-10 transform -rotate-[45deg] opacity-60" />
            
            <Brain className="absolute top-[10%] left-[15%] w-10 h-10 transform rotate-[20deg] opacity-70 hidden md:block" />
            <Lightbulb className="absolute top-[25%] right-[18%] w-12 h-12 transform -rotate-[10deg] opacity-60" />
            <Wand2 className="absolute bottom-[25%] left-[22%] w-9 h-9 transform rotate-[30deg] opacity-75 hidden sm:block" />
            <PenIcon className="absolute top-[65%] right-[8%] w-8 h-8 transform rotate-[5deg] opacity-80" />
            <Brain className="absolute bottom-[8%] right-[calc(50%-350px)] w-11 h-11 transform -rotate-[25deg] opacity-65 hidden lg:block" />
            <Lightbulb className="absolute top-[75%] left-[calc(50%-450px)] w-10 h-10 transform rotate-[15deg] opacity-70 hidden md:block" />
            <Wand2 className="absolute top-[8%] right-[calc(50%-400px)] w-10 h-10 transform -rotate-[5deg] opacity-50 hidden sm:block" />
            <PenIcon className="absolute bottom-[35%] left-[8%] w-10 h-10 transform rotate-[-30deg] opacity-70" />
          </div>
          
          <div className="container mx-auto px-4 md:px-6 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className={cn(
                  "text-4xl md:text-5xl lg:text-6xl font-headline font-bold text-primary mb-6 leading-tight transition-all duration-700 ease-out",
                  animateHeroHeading ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
                )}>
                Turn Simple Ideas into Powerful AI Prompts
              </h1>
              <p className={cn(
                  "text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto mb-10 transition-all duration-700 ease-out",
                  animateHeroSubElements ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
                )}>
                PromptWeaver analyzes your intent and helps you craft detailed, effective prompts for any AI model, boosting your creativity and productivity.
              </p>
              <div className={cn(
                  "flex flex-col sm:flex-row justify-center items-center gap-4 transition-all duration-700 ease-out",
                  animateHeroSubElements ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
                )}>
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg px-8 py-3 text-lg"
                  onClick={handleTryNowClick}
                >
                  Try Now
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary/10 shadow-lg px-8 py-3 text-lg"
                  asChild
                >
                  <Link href={user ? "/dashboard" : "/login"}>
                    {user ? "Your Workspace" : "Login to Save Prompts"}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {showPromptTool && (
          <section id="prompt-tool" className="w-full py-16 md:py-24">
            <div className="container mx-auto px-4 md:px-6">
              <PromptWeaverClient isLoggedIn={!!user} />
            </div>
          </section>
        )}
        
        <section id="features" ref={featuresRef} className="w-full pb-16 md:pb-24 bg-secondary/10">
          <div className={cn(
              "container mx-auto px-4 md:px-6 transition-all duration-1000 ease-out",
              featuresVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"
            )}>
            <FeaturesSection />
          </div>
        </section>
        
        <section id="how-it-works" ref={howItWorksRef} className="w-full py-16 md:py-24">
          <div className={cn(
            "container mx-auto px-4 md:px-6 transition-all duration-1000 ease-out",
            howItWorksVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"
          )}>
            <HowItWorksSection />
          </div>
        </section>

        <section id="examples" ref={examplesRef} className="w-full pt-12 md:pt-16 pb-16 md:pb-24 bg-secondary/10">
          <div className={cn(
            "container mx-auto px-4 md:px-6 transition-all duration-1000 ease-out",
            examplesVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"
          )}>
            <h2 className="text-3xl md:text-4xl font-bold text-primary mt-16 text-center font-headline">Prompt Examples</h2>
            <ExamplesSection />
          </div>
        </section>
        
      </main>
    </div>
  );
}

    
