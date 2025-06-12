
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";

const PersonTypingIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 70 50" xmlns="http://www.w3.org/2000/svg" className={cn("w-24 h-24 md:w-28 md:h-28 text-card-foreground/90 mx-auto", className)}>
    {/* Laptop Base */}
    <path d="M10 38 H60 L58 42 H12 Z" fill="hsl(var(--muted))" /> {/* Light gray for laptop base */}
    {/* Laptop Screen */}
    <rect x="14" y="10" width="42" height="28" rx="2" ry="2" fill="hsl(var(--muted))" /> {/* Light gray for screen part */}
    <rect x="16" y="12" width="38" height="24" fill="hsl(var(--popover))" /> {/* Slightly different light gray for screen surface */}

    {/* Person Figure */}
    <circle cx="35" cy="20" r="5" fill="hsl(var(--card-foreground))" /> {/* Dark gray head */}
    <path d="M28 25 Q35 33 42 25 L39 40 L31 40 Z" fill="hsl(var(--card-foreground))" /> {/* Dark gray body */}

    {/* Screen Content */}
    <text x="35" y="20" fontFamily="PT Sans, sans-serif" fontSize="3.5" fontWeight="bold" textAnchor="middle" fill="hsl(var(--card-foreground))">Blog</text>
    <text x="35" y="25" fontFamily="PT Sans, sans-serif" fontSize="3.5" fontWeight="bold" textAnchor="middle" fill="hsl(var(--card-foreground))">an AI</text>

    {/* Checkmark Icon */}
    <path d="M22 21 L24 23 L27 20" stroke="hsl(var(--card-foreground))" strokeWidth="1" fill="none" strokeLinecap="round" strokeLinejoin="round" />

    {/* Document/Blog Icon */}
    <rect x="42" y="19.5" width="5" height="6" rx="0.5" stroke="hsl(var(--card-foreground))" strokeWidth="0.8" fill="none" />
    <line x1="43" y1="21.5" x2="46" y2="21.5" stroke="hsl(var(--card-foreground))" strokeWidth="0.5" />
    <line x1="43" y1="23.5" x2="45" y2="23.5" stroke="hsl(var(--card-foreground))" strokeWidth="0.5" />
  </svg>
);


const AiProcessingIcon: React.FC<{ className?: string }> = ({ className }) => {
  const [lineCoords, setLineCoords] = React.useState<{ x2: number; y2: number }[]>([]);
  const [circlePaths, setCirclePaths] = React.useState<string[]>([]);
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true); // Set isClient to true once component mounts

    const lines = [0, 60, 120, 180, 240, 300].map(angle => ({
      x2: 30 + 25 * Math.cos(angle * Math.PI / 180),
      y2: 30 + 25 * Math.sin(angle * Math.PI / 180),
    }));
    setLineCoords(lines);

    const paths = [0, 45, 90, 135, 180, 225, 270, 315].map(angle =>
      `M0,0 L${15 * Math.cos(angle * Math.PI / 180)},${15 * Math.sin(angle * Math.PI / 180)}`
    );
    setCirclePaths(paths);
  }, []);

  if (!isClient) {
    // Render a placeholder or null on the server to avoid hydration issues
    return <div className={cn("w-24 h-24 md:w-28 md:h-28 mx-auto", className)} />;
  }

  return (
    <svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg" className={cn("w-24 h-24 md:w-28 md:h-28 text-card-foreground/90 mx-auto", className)}>
      <polygon points="30,10 47.32,20 47.32,40 30,50 12.68,40 12.68,20" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="1"/>
      <polygon points="30,15 43,22.5 43,37.5 30,45 17,37.5 17,22.5" fill="transparent" stroke="currentColor" strokeOpacity="0.5" strokeWidth="0.8" />
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontFamily="PT Sans, sans-serif" fontSize="12" fontWeight="bold" fill="hsl(var(--primary))">AI</text>

      {lineCoords.length > 0 && [0, 60, 120, 180, 240, 300].map((angle, index) => (
        <line
          key={`line-${angle}`}
          x1="30" y1="30"
          x2={lineCoords[index].x2}
          y2={lineCoords[index].y2}
          stroke="hsl(var(--primary))" strokeWidth="0.7" strokeOpacity="0.6">
          <animate attributeName="stroke-dasharray" values="0 50; 5 45; 0 50" dur="2s" repeatCount="indefinite" />
          <animate attributeName="stroke-dashoffset" values="0; -50; -50" dur="2s" repeatCount="indefinite" />
        </line>
      ))}
      {circlePaths.length > 0 && [0, 45, 90, 135, 180, 225, 270, 315].map((angle, index) => (
         <circle key={`dot-${angle}`} cx="30" cy="30" r="1" fill="hsl(var(--primary))" opacity="0.8">
            <animateMotion dur="1.8s" repeatCount="indefinite" path={circlePaths[index]} />
            <animate attributeName="r" values="0.5;1.5;0.5" dur="1.8s" repeatCount="indefinite" />
          </circle>
      ))}
    </svg>
  );
};

const CheckIcon = ({ className }: { className?: string }) => (
     <CheckCircle2 className={cn("w-24 h-24 md:w-28 md:h-28 text-primary mx-auto", className)} strokeWidth="1.5" />
);


const stepsData = [
  {
    id: 1,
    icon: <PersonTypingIcon />,
    title: "Step 1: Just Type Your Idea",
    description: "Write your thoughts naturally, like you're explaining it to a friend. No need to worry about perfect wording.",
  },
  {
    id: 2,
    icon: <AiProcessingIcon />,
    title: "Step 2: Let the AI Work Its Magic",
    description: "Our AI understands your input and transforms it into a clear, powerful prompt — optimized for the best results.",
  },
  {
    id: 3,
    icon: <CheckIcon />,
    title: "Step 3: Your Perfect Prompt is Ready",
    description: "Get a polished prompt instantly. Copy it and use it anywhere — in chatbots, image generators, or coding tools.",
  },
];

const ANIMATION_INTERVAL = 4500;

export default function HowItWorksSection() {
  const [activeStep, setActiveStep] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prevStep) => (prevStep + 1) % stepsData.length);
    }, ANIMATION_INTERVAL);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="w-full py-16 md:py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-headline font-bold text-primary text-center mb-10 md:mb-12">
          It works <br className="sm:hidden" /> simply like
        </h2>

        <div className="flex justify-center items-center gap-3 md:gap-4 mb-10 md:mb-12">
          {stepsData.map((step, index) => (
            <button
              key={step.id}
              onClick={() => setActiveStep(index)}
              className={cn(
                "flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full transition-all duration-300 ease-in-out transform focus:outline-none border-2",
                activeStep === index
                  ? "bg-primary text-primary-foreground border-primary shadow-lg scale-110 ring-2 ring-offset-2 ring-offset-background ring-primary"
                  : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
              )}
              aria-current={activeStep === index ? "step" : undefined}
              aria-label={`Step ${step.id}`}
            >
              <span className="font-semibold text-lg">{step.id}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {stepsData.map((step, index) => (
            <div
              key={step.id}
              className={cn(
                "bg-card rounded-xl shadow-lg p-6 md:p-8 flex flex-col items-center text-center transition-all duration-500 ease-in-out min-h-[320px] md:min-h-[380px] justify-start border-2",
                activeStep === index
                  ? "transform scale-105 shadow-[0_0_25px_4px_hsl(var(--primary)/0.6)] border-primary/80"
                  : "opacity-80 scale-95 border-transparent"
              )}
              onClick={() => setActiveStep(index)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setActiveStep(index);}}
              aria-label={step.title}
            >
              <div className="mb-5 h-24 md:h-28 flex items-center justify-center">
                {React.cloneElement(step.icon, {
                  className: cn(
                    (step.icon.props.className || ""),
                    "transition-opacity duration-300",
                    activeStep === index ? "opacity-100" : "opacity-70"
                  )
                })}
              </div>
              <h3 className={cn(
                "text-lg md:text-xl font-semibold font-headline mb-3",
                 activeStep === index ? "text-primary" : "text-card-foreground/80"
                )}>
                {step.title}
              </h3>
              <p className={cn(
                "text-sm md:text-base leading-relaxed flex-grow text-primary"
              )}>
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

