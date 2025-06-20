"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PenLine, Sparkles, BookOpen, SlidersHorizontal, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import * as React from 'react';
import { useRouter } from 'next/navigation';

const featuresContent = [
  {
    id: "intro-block",
    type: "description" as const,
    title: "Why Choose PromptWeaver?",
    description: "Discover how PromptWeaver transforms your AI experience. Whether you're just starting or want to write like a pro, we make powerful prompting simple, smart, and effective.",
    buttonText: "Try PromptWeaver Now",
  },
  {
    id: "effortless-creation",
    type: "card" as const,
    icon: <PenLine className="w-7 h-7" />,
    title: "Effortless Prompt Creation",
    description: "Turn simple ideas into powerful prompts instantly. No need for prompt engineering knowledge — just type what you mean, and PromptWeaver takes care of the rest.",
  },
  {
    id: "intelligent-refinement",
    type: "card" as const,
    icon: <Sparkles className="w-7 h-7" />,
    title: "Intelligent Refinement",
    description: "Our AI suggests multiple high-quality variations of your idea — from quick concepts to comprehensive drafts — so you always get the best version.",
  },
  {
    id: "built-in-learning",
    type: "card" as const,
    icon: <BookOpen className="w-7 h-7" />,
    title: "Built-in Learning as You Go",
    description: "Improve your vocabulary and writing skills naturally. PromptWeaver teaches while you use it — perfect for beginners or non-native English users.",
  },
  {
    id: "customizable-detail",
    type: "card" as const,
    icon: <SlidersHorizontal className="w-7 h-7" />,
    title: "Customizable Detail",
    description: "Choose your level of prompt complexity — from simple to comprehensive — based on your needs and confidence.",
  },
  {
    id: "boost-creativity",
    type: "card" as const,
    icon: <Zap className="w-7 h-7" />,
    title: "Boost Creativity",
    description: "Overcome blocks, explore new angles, and create sharper prompts with AI guidance that thinks outside the box.",
  }
];

export default function FeaturesSection() {
  const router = useRouter();

  const handleNavigate = () => {
    router.push('/tool');
  };

  return (
    <section className="w-full py-12 md:py-16">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {featuresContent.map((item) => {
            if (item.type === "description") {
              return (
                <div key={item.id} className="lg:col-span-1 flex flex-col justify-center space-y-5 text-left py-4">
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground font-headline">
                    {item.title}
                  </h2>
                  <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                  <div className="mt-6 flex justify-start text-left">
                    <Button
                      className="text-lg"
                      size="lg"
                      onClick={handleNavigate}
                    >
                      {item.buttonText}
                    </Button>
                  </div>
                </div>
              );
            } else { // type === "card"
              const isDarkCard = item.id === 'intelligent-refinement';
              return (
                <Card
                  key={item.id}
                  className={cn(
                    "shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-xl flex flex-col text-left h-full",
                    isDarkCard ? "bg-zinc-800" : "bg-card"
                  )}
                >
                  <CardHeader>
                    <div className={cn("mb-2", isDarkCard ? "text-white" : "text-primary")}>
                      {item.icon}
                    </div>
                    <CardTitle className={cn(
                      "text-2xl font-semibold",
                      isDarkCard ? "text-white" : "text-card-foreground/90"
                    )}>
                      {item.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className={cn(
                      "text-base leading-relaxed",
                      isDarkCard ? "text-gray-300" : "text-muted-foreground"
                    )}>
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              );
            }
          })}
        </div>
      </div>
    </section>
  );
}
