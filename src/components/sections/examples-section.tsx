
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles, PenLine } from "lucide-react";
import { cn } from "@/lib/utils";

const exampleData = [
  {
    id: "1",
    category: "Content Creation",
    simpleIdea: "Blog on AI",
    refinedPrompt:
      "Write a 1000-word blog post discussing how AI is transforming the K-12 education sector. Cover aspects like personalized learning, AI-powered tutoring systems, administrative task automation for teachers, and potential ethical concerns. Adopt an informative yet engaging tone suitable for educators and parents.",
  },
  {
    id: "2",
    category: "Development",
    simpleIdea: "Python script to sort pictures",
    refinedPrompt:
      "Generate a Python script that organizes image files (JPG, PNG, GIF) in a source directory into subdirectories based on the year and month the photo was taken (from EXIF data). If EXIF data is unavailable, use the file's last modified date. Include error handling for invalid directories and non-image files.",
  },
  {
    id: "3",
    category: "Marketing",
    simpleIdea: "Marketing email for new app",
    refinedPrompt:
      "Draft a compelling marketing email for the launch of 'TaskMaster Pro,' a new productivity app. Highlight its top 3 features: AI-powered task prioritization, seamless team collaboration, and cross-platform syncing. Include a clear call-to-action for a 14-day free trial and an early-bird discount offer. Target audience: busy professionals and small teams.",
  },
];

const BlinkingCursor = () => (
  <span className="inline-block w-0.5 h-5 bg-foreground animate-pulse ml-1" />
);

const CAROUSEL_INTERVAL = 7000; // 7 seconds

export default function ExamplesSection() {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [typedSimpleIdea, setTypedSimpleIdea] = React.useState("");
  const [isTyping, setIsTyping] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [showAfterContent, setShowAfterContent] = React.useState(false);
  const intervalIdRef = React.useRef<NodeJS.Timeout | null>(null);

  const currentExample = exampleData[currentIndex];

  const resetInterval = () => {
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
    }
    intervalIdRef.current = setInterval(() => {
      goToNext(false); // false indicates it's an auto-navigation
    }, CAROUSEL_INTERVAL);
  };

  React.useEffect(() => {
    setIsTyping(true);
    setTypedSimpleIdea("");
    setShowAfterContent(false);
    setIsProcessing(false);

    let charIndex = 0;
    const idea = currentExample.simpleIdea;

    const typingInterval = setInterval(() => {
      if (charIndex < idea.length) {
        setTypedSimpleIdea(idea.substring(0, charIndex + 1));
        charIndex++;
      } else {
        clearInterval(typingInterval);
        setIsTyping(false);
        setIsProcessing(true);
        setTimeout(() => {
          setIsProcessing(false);
          setShowAfterContent(true);
        }, 1200); // "Magic" processing time
      }
    }, 100); // Typing speed

    resetInterval(); // Start or reset the auto-carousel interval

    return () => {
      clearInterval(typingInterval);
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }
    };
  }, [currentIndex, currentExample.simpleIdea]);


  const goToPrevious = (manualNavigation = true) => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? exampleData.length - 1 : prevIndex - 1
    );
    if (manualNavigation) resetInterval();
  };

  const goToNext = (manualNavigation = true) => {
    setCurrentIndex((prevIndex) =>
      prevIndex === exampleData.length - 1 ? 0 : prevIndex + 1
    );
    if (manualNavigation) resetInterval();
  };

  const goToIndex = (index: number) => {
    setCurrentIndex(index);
    resetInterval();
  };

  const handleGetStartedClick = () => {
    const section = document.getElementById('prompt-tool');
    if (section) {
      // If tool is already rendered, just scroll to it.
      section.scrollIntoView({ behavior: 'smooth' });
    } else {
      // If tool is not rendered (either hidden on homepage or user is on another page),
      // navigate to the homepage with the hash.
      // The homepage (page.tsx) will have a useEffect to detect this hash
      // and then call its own logic to show and scroll to the tool.
      if (typeof window !== "undefined") { 
          window.location.href = '/#prompt-tool';
      }
    }
  };

  return (
    <section className="w-full pt-4 md:pt-6 pb-12 md:pb-16">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex justify-center items-center mb-8 space-x-3">
          <Button variant="outline" size="icon" onClick={() => goToPrevious()} aria-label="Previous Example" disabled={isTyping || isProcessing}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          
          <div className="flex space-x-2">
            {exampleData.map((_, index) => (
              <button
                key={`dot-${index}`}
                onClick={() => goToIndex(index)}
                disabled={isTyping || isProcessing}
                aria-label={`Go to example ${index + 1}`}
                className={cn(
                  "h-3 w-3 rounded-full transition-all duration-300",
                  currentIndex === index ? "bg-primary scale-125" : "bg-muted hover:bg-muted-foreground/50"
                )}
              />
            ))}
          </div>

          <Button variant="outline" size="icon" onClick={() => goToNext()} aria-label="Next Example" disabled={isTyping || isProcessing}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex flex-col md:flex-row items-stretch justify-center gap-6 md:gap-8 relative">
          {/* Before Card */}
          <div className="w-full md:w-[45%] bg-card p-6 rounded-xl border-2 border-dashed border-border shadow-lg relative min-h-[300px] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center">
                <PenLine className="w-5 h-5 mr-2 text-muted-foreground" />
                Your Simple Idea
              </h3>
            </div>
            <div className="flex-grow flex items-center justify-center">
              <div className="bg-muted p-6 rounded-lg text-center shadow-inner w-full max-w-xs min-h-[100px] flex flex-col justify-center">
                <p className="text-lg font-medium text-muted-foreground">
                  {typedSimpleIdea}
                  {isTyping && <BlinkingCursor />}
                </p>
              </div>
            </div>
          </div>

          {/* Arrow Icon */}
          <div className="flex items-center justify-center my-2 md:my-0 mx-auto md:mx-2">
            <ArrowRight className={cn("h-8 w-8 text-primary transform md:rotate-0", isProcessing && "animate-pulse", !isProcessing && "rotate-90 md:rotate-0")} />
          </div>

          {/* After Card */}
          <div className="w-full md:w-[45%] p-6 rounded-xl shadow-lg bg-primary text-primary-foreground relative min-h-[300px] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Sparkles className="w-5 h-5 mr-2" />
                 Refined by PromptWeaver
              </h3>
            </div>
            <div className={cn(
                "flex-grow flex items-center justify-center transition-opacity duration-500", 
                showAfterContent ? "opacity-100" : "opacity-0"
              )}
            >
              <div className="bg-card p-4 rounded-lg w-full shadow-sm border-l-4 border-primary/50">
                <div className="flex items-start space-x-2">
                  <Sparkles className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <p className="text-sm leading-relaxed text-foreground/90">
                    {showAfterContent ? currentExample.refinedPrompt : ""}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 md:mt-16 flex justify-center">
          <div className="bg-card p-3 rounded-full shadow-lg flex items-center space-x-3 max-w-md">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <p className="text-sm font-medium text-foreground">
              Try PromptWeaver yourself
            </p>
            <Button
              onClick={handleGetStartedClick}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 rounded-full text-sm font-semibold"
              aria-label="Get Started with PromptWeaver"
            >
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
