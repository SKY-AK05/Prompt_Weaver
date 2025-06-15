"use client";

import React, { useState, useEffect } from 'react';
import { Pen, BookOpen, Sparkles, Globe } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const WhyChoosePromptWeaverSection: React.FC = () => {
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('dark');
  const [logoSrc, setLogoSrc] = useState('/assets/logo-dark-theme.png'); 

  useEffect(() => {
    let initialTheme: 'light' | 'dark' = 'dark';
    const storedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;

    if (storedTheme) {
      initialTheme = storedTheme;
    } else if (typeof window !== "undefined") {
      initialTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    
    setCurrentTheme(initialTheme);
    setLogoSrc('/assets/logo-dark-theme.png');

    const handleThemeChange = () => {
      const newTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
      setCurrentTheme(newTheme);
      setLogoSrc('/assets/logo-dark-theme.png');
    };

    const observer = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          handleThemeChange();
        }
      }
    });

    if (typeof window !== "undefined") {
      observer.observe(document.documentElement, { attributes: true });
    }
    
    const handleStorageEvent = (event: StorageEvent) => {
        if (event.key === 'theme') {
            const newTheme = event.newValue as 'light' | 'dark';
            if (newTheme) {
                setCurrentTheme(newTheme);
                setLogoSrc('/assets/logo-dark-theme.png');
            }
        }
    };
    window.addEventListener('storage', handleStorageEvent);

    handleThemeChange(); 

    return () => {
      observer.disconnect();
      window.removeEventListener('storage', handleStorageEvent);
    };
  }, []);

  const features = [
    {
      icon: <Pen className="w-10 h-10 text-white" />,
      title: "Effortless Prompt Creation",
      description: "Turn ideas into powerful prompts—instantly. No need for prompt engineering skills. Just describe what you want, and let PromptWeaver do the rest."
    },
    {
      icon: <BookOpen className="w-10 h-10 text-white" />,
      title: "Built-in Learning as You Go",
      description: "Improve your vocabulary and structure with every prompt. PromptWeaver enhances your writing while you use it — making learning smooth and intuitive."
    },
    {
      icon: <Sparkles className="w-10 h-10 text-white" />,
      title: "Get Better AI Results",
      description: "Don't settle for average outputs. Our AI-tuned suggestions help you get sharper, more relevant, and higher-quality responses every time."
    },
    {
      icon: <Globe className="w-10 h-10 text-white" />,
      title: "Designed for Everyone",
      description: "From beginners to creators — we've got you covered. PromptWeaver adapts to your needs, guiding you with suggestions tailored to your level and goals."
    }
  ];

  return (
    <section className="w-full bg-card border border-border rounded-2xl shadow-lg py-12 md:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start mb-12 md:mb-16">
          <div className="text-left w-full md:flex-grow md:order-1">
            <h2 className="font-headline text-primary text-4xl sm:text-5xl font-bold mb-4 md:mb-6 leading-tight">
              Why Choose PromptWeaver?
            </h2>
            <p className="text-foreground/80 text-base sm:text-lg leading-relaxed">
              Discover how PromptWeaver transforms your AI experience. Whether you're just starting or want to write like a pro, we make powerful prompting simple, smart, and effective.
            </p>
          </div>
          <div className="w-full md:w-auto flex-shrink-0 mt-8 md:mt-0 md:order-2 md:ml-8 lg:md-12">
            {logoSrc && (
              <Image
                src={logoSrc}
                alt="PromptWeaver App Logo"
                width={233} 
                height={195}
                className="max-w-[180px] sm:max-w-[200px] md:max-w-[233px] h-auto object-contain"
              />
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className={cn(
                "rounded-2xl p-6 flex flex-col shadow-md min-h-[280px]",
                "transition-transform duration-300 ease-in-out hover:scale-95", 
                index === 0 ? 'bg-zinc-800' : 'bg-primary' 
              )}
            >
              <div className="mb-4">
                {feature.icon}
              </div>
              <div className={cn(index === 0 ? 'text-white' : 'text-primary-foreground')}>
                <h3 className={cn("text-lg mb-2", index === 0 ? 'font-semibold' : 'font-medium')}>{feature.title}</h3>
                <p className="text-sm leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChoosePromptWeaverSection;
