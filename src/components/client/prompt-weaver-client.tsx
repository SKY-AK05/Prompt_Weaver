"use client";

import type { RefinePromptInput, RefinePromptOutput } from '@/ai/flows/refine-prompt';
import { refinePrompt } from '@/ai/flows/refine-prompt';
import { suggestFramework } from '@/ai/flows/frameworksuggestion';
import { cn } from "@/lib/utils";

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { Copy, Sparkles, Save, Lock, RefreshCcw, StarIcon, Settings2, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/layout/app-header';
import PromptRefiner from '@/components/client/PromptRefiner';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { MessageSquareWarning } from "lucide-react";
import { Grid } from 'ldrs/react';
import 'ldrs/react/Grid.css';
import { frameworks } from '@/lib/frameworks';
import { Switch } from '@/components/ui/switch';

type UiPromptLevel = 'Simple' | 'Moderate' | 'Expert' | 'Custom';
const uiPromptLevels: { value: UiPromptLevel; label: string; apiValue: 'Quick' | 'Balanced' | 'Comprehensive'; }[] = [
  { value: 'Simple', label: 'Simple', apiValue: 'Quick' },
  { value: 'Moderate', label: 'Moderate', apiValue: 'Balanced' },
  { value: 'Expert', label: 'Expert', apiValue: 'Comprehensive' },
  { value: 'Custom', label: '⭐ Customize', apiValue: 'Balanced' }, // API uses 'Balanced' as base for custom styles
];

const structureOptions = ["Concise", "Expanded", "Step-by-step"];
const toneOptions = ["Creative", "Casual", "Formal", "Witty"];
const purposeOptions = ["SEO-Friendly", "Conversion-Oriented", "Informative"];
const aiOptimizationOptions = ["GPT-4 Optimized", "Chain-of-Thought", "Instructional"];
const audienceOptions = ["Beginner-Friendly", "Technical", "Marketing"];

interface CustomStyleDropdownProps {
  label: string;
  options: string[];
  selectedValue: string | undefined;
  onValueChange: (value: string | undefined) => void;
  emoji?: string;
}

const CustomStyleDropdown: React.FC<CustomStyleDropdownProps> = ({ label, options, selectedValue, onValueChange, emoji }) => (
  <div>
    <label className="block text-xs font-medium text-foreground mb-1 text-left">
      {emoji && <span className="mr-1">{emoji}</span>}{label}
    </label>
    <Select value={selectedValue} onValueChange={(value) => onValueChange(value === 'none' ? undefined : value)}>
      <SelectTrigger className="w-full text-sm py-2 rounded-md">
        <SelectValue placeholder={`Select ${label.toLowerCase()}...`} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">None</SelectItem>
        {options.map(option => (
          <SelectItem key={option} value={option} className="text-sm py-1.5">
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

interface RefinedPrompt {
  promptText: string;
  rating: number;
}

interface PromptWeaverClientProps {
  isLoggedIn: boolean;
}

interface PromptSuggestionCardProps {
  prompt: string;
  rating: number;
  index: number;
  onCopy: (prompt: string) => void;
  onRefineAgain: (prompt: string) => void;
}

const PromptSuggestionCard: React.FC<PromptSuggestionCardProps> = ({ prompt, rating, index, onCopy, onRefineAgain }) => {
  return (
    <Card className="mb-4 bg-card border-border">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold text-card-foreground">Suggestion {index + 1}</CardTitle>
          <div className="flex items-center text-primary">
            <StarIcon className="w-5 h-5 mr-1" />
            <span className="font-bold text-lg">{rating}/10</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4 whitespace-pre-wrap">{prompt}</p>
        <div className="flex gap-2">
          <Button  
            variant="secondary"
            size="sm" 
            onClick={() => onCopy(prompt)} 
            className="hover:bg-accent hover:text-accent-foreground"
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy
          </Button>
          <Button 
            variant="secondary"
            size="sm" 
            onClick={() => onRefineAgain(prompt)} 
            className="hover:bg-accent hover:text-accent-foreground"
          >
            <RefreshCcw className="w-4 h-4 mr-2" />
            Refine Again
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Framework categories mapping
const frameworkCategories = [
  {
    label: 'Quick Tasks & Productivity',
    ids: ['rtf', 'tag'],
  },
  {
    label: 'Strategy & Planning',
    ids: ['solve', 'dream', 'rise'],
  },
  {
    label: 'Storytelling & Persuasion',
    ids: ['care', 'score', 'mice'],
  },
  {
    label: 'Communication & Outreach',
    ids: ['race'],
  },
  {
    label: 'Testing & Experimentation',
    ids: ['pact'],
  },
  {
    label: 'Creative & Brainstorming',
    ids: ['idea'],
  },
  {
    label: 'Job & Career',
    ids: ['jobs'],
  },
  {
    label: 'Coaching & Leadership',
    ids: ['clear'],
  },
  {
    label: 'Product & Project Creation',
    ids: ['create'],
  },
];

export default function PromptWeaverClient({ isLoggedIn }: PromptWeaverClientProps) {
  const { user } = useAuth();
  const [uiPromptLevel, setUiPromptLevel] = React.useState<UiPromptLevel>('Moderate');
  const [isCustomizing, setIsCustomizing] = React.useState(false);
  
  const [structureStyle, setStructureStyle] = React.useState<string | undefined>(undefined);
  const [toneStyle, setToneStyle] = React.useState<string | undefined>(undefined);
  const [purposeStyle, setPurposeStyle] = React.useState<string | undefined>(undefined);
  const [aiOptimizationStyle, setAiOptimizationStyle] = React.useState<string | undefined>(undefined);
  const [audienceStyle, setAudienceStyle] = React.useState<string | undefined>(undefined);

  const [inputText, setInputText] = React.useState('');
  const [refinedPrompts, setRefinedPrompts] = React.useState<RefinedPrompt[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const { toast } = useToast();
  const inputTextAreaRef = React.useRef<HTMLTextAreaElement>(null);
  const [showSavedPopup, setShowSavedPopup] = React.useState(false);
  const [lastAutoSavedPromptId, setLastAutoSavedPromptId] = React.useState<string | null>(null);
  const [showTemporarySaveWarning, setShowTemporarySaveWarning] = React.useState(false);
  const [selectedFramework, setSelectedFramework] = React.useState<string>('rtf');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('Quick Tasks & Productivity');
  const [recommendedFramework, setRecommendedFramework] = React.useState<{ name: string; reason: string } | null>(null);
  const [frameworkRefinedPrompts, setFrameworkRefinedPrompts] = React.useState<string[]>([]);
  const [isFrameworkRefining, setIsFrameworkRefining] = React.useState(false);
  const [enableFrameworkRefinement, setEnableFrameworkRefinement] = React.useState(false);
  const [guestAttemptCount, setGuestAttemptCount] = React.useState(0);
  const GUEST_ATTEMPT_LIMIT = 3;

  React.useEffect(() => {
    if (!isLoggedIn) {
      const storedCount = localStorage.getItem('guestAttemptCount');
      if (storedCount) {
        setGuestAttemptCount(Number(storedCount));
      }
    }
  }, [isLoggedIn]);

  const examplePrompts = [
    "Write a cold email to pitch my AI startup idea to an investor",
    "Create a 3-post carousel for LinkedIn on overcoming imposter syndrome",
    "Summarize the key insights from the book 'Deep Work' by Cal Newport",
    "Generate a morning journal prompt for boosting self-awareness",
    "Write a script for a YouTube short explaining ChatGPT in 60 seconds",
    "Draft a professional yet empathetic email apologizing for a missed deadline",
    "Explain the concept of blockchain using pizza as a metaphor",
    "Create a bedtime story for kids about a turtle who wanted to fly",
    "Write an engaging Instagram caption announcing a product launch",
    "Generate a step-by-step guide to setting up a personal Notion dashboard",
    "Make a funny tweet about AI replacing your dog's therapist",
    "Summarize a news article on climate change in under 100 words",
    "Write a blog intro about the future of remote work in 2030",
    "Design a quiz prompt for testing emotional intelligence",
    "Turn a boring LinkedIn summary into a story-driven personal pitch",
    "Generate daily affirmations for anxious entrepreneurs",
    "Translate 'growth mindset' into a 5-step plan for school students",
    "Create a fantasy plot where a cat becomes the king of a robot city",
    "Write a cover letter for a UX Designer role at a climate-tech startup",
    "Generate a podcast episode outline about digital minimalism"
  ];
  

  // Collect selected custom styles for summary display
  const selectedCustomStyles = [
    structureStyle,
    toneStyle,
    purposeStyle,
    aiOptimizationStyle,
    audienceStyle,
  ].filter(Boolean);

  const handleRefinePrompt = async () => {
    if (!isLoggedIn && guestAttemptCount >= GUEST_ATTEMPT_LIMIT) {
      setError(null); // Clear other errors, the persistent alert will guide the user
      toast({
          title: "Free Limit Reached",
          description: "Please log in to get unlimited refinements.",
          variant: "destructive",
      });
      return;
    }
    if (!inputText.trim()) {
      setError('Please enter an idea to refine.');
      return;
    }
    setError(null);
    setIsLoading(true);
    setRefinedPrompts([]);
    setFrameworkRefinedPrompts([]);
    setIsFrameworkRefining(false);

    let apiPromptLevel = uiPromptLevels.find(l => l.value === uiPromptLevel)?.apiValue || 'Balanced';
    let refinementStyleString: string | undefined = undefined;

    if (isCustomizing) {
      const customStyles = [
        structureStyle,
        toneStyle,
        purposeStyle,
        aiOptimizationStyle,
        audienceStyle,
      ].filter(Boolean);
      
      if (customStyles.length > 0) {
        refinementStyleString = customStyles.join(', ');
      }
    }

    try {
      const input: RefinePromptInput = {
        instruction: inputText,
        promptLevel: apiPromptLevel,
        refinementStyle: refinementStyleString,
      };
      const result: RefinePromptOutput = await refinePrompt(input);
      
      if (!result.refinedPrompts || result.refinedPrompts.length === 0 || !result.refinedPrompts.every(p => typeof p.promptText === 'string' && typeof p.rating === 'number' && p.rating >= 0 && p.rating <=10 )) {
        setError('The AI (Google Gemini) did not return any prompt suggestions with valid ratings. You can try rephrasing your idea or trying again.');
      } else {
        setRefinedPrompts(result.refinedPrompts || []);
        if (!isLoggedIn) {
          const newCount = guestAttemptCount + 1;
          setGuestAttemptCount(newCount);
          localStorage.setItem('guestAttemptCount', String(newCount));
        }
        // Auto-save the generated prompt to the database for logged-in users
        if (user) {
          const createdAt = new Date();
          const expiresAt = new Date(createdAt.getTime() + 10 * 24 * 60 * 60 * 1000); // 10 days from now
          const { data: insertedData, error: saveError } = await supabase.from("prompts").insert([
            {
              user_id: user.id,
              username: user.email || 'anonymous',
              prompt_text: inputText,
              prompt_level: uiPromptLevel,
              custom_styles: refinementStyleString || null,
              refined_prompt_text_1: result.refinedPrompts[0]?.promptText || null,
              refined_prompt_rating_1: result.refinedPrompts[0]?.rating || null,
              refined_prompt_text_2: result.refinedPrompts[1]?.promptText || null,
              refined_prompt_rating_2: result.refinedPrompts[1]?.rating || null,
              refined_prompt_text_3: result.refinedPrompts[2]?.promptText || null,
              refined_prompt_rating_3: result.refinedPrompts[2]?.rating || null,
              is_favorite: false,
              is_temporary: true,
              expires_at: expiresAt.toISOString(),
              created_at: createdAt.toISOString(),
            }
          ]).select('id');
          if (saveError) {
            setLastAutoSavedPromptId(null);
          } else if (insertedData && insertedData.length > 0) {
            setLastAutoSavedPromptId(insertedData[0].id);
            setShowTemporarySaveWarning(true);
          }
        }
        // Double-refinement for any enabled level
        if (enableFrameworkRefinement) {
          setIsFrameworkRefining(true);
          let frameworkName = frameworks.find(fw => fw.id === selectedFramework)?.name || 'R-T-F';
          Promise.all(
            (result.refinedPrompts || []).map(async (p, idx) => {
              await new Promise(res => setTimeout(res, 800 + idx * 200));
              return `(${frameworkName}) ${p.promptText} [Refined with ${frameworkName}]`;
            })
          ).then(frPrompts => {
            setFrameworkRefinedPrompts(frPrompts);
            setIsFrameworkRefining(false);
          });
        }
      }
    } catch (e) {
      let userFriendlyMessage = 'An unknown error occurred while refining your prompt with Google Gemini.';
      if (e instanceof Error) {
         const lowerCaseMessage = e.message.toLowerCase();
        if (lowerCaseMessage.includes('googleai') && (lowerCaseMessage.includes('503') || lowerCaseMessage.includes('model is overloaded') || lowerCaseMessage.includes('service unavailable'))) {
          userFriendlyMessage = 'The Google Gemini AI model is currently busy or overloaded. Please try again in a few moments. (This app is configured to use Google Gemini).';
        } else if (lowerCaseMessage.includes('did not return the expected refinedprompts array') || lowerCaseMessage.includes('invalid format') || lowerCaseMessage.includes('text and rating') || lowerCaseMessage.includes('valid rating')) {
          userFriendlyMessage = 'The AI (Google Gemini) successfully processed your request but did not return usable prompt suggestions with ratings (invalid format or rating out of range). You might want to try rephrasing your idea or trying again. (This app is configured to use Google Gemini).';
        } else if (lowerCaseMessage.includes('googleai')) {
           userFriendlyMessage = `Failed to refine prompt with Google Gemini: ${e.message}. (This app is configured to use Google Gemini).`;
        } else {
          userFriendlyMessage = `An error occurred: ${e.message}`;
        }
      }
      setError(userFriendlyMessage);
      // toast({
      //   title: "Error",
      //   description: userFriendlyMessage,
      //   variant: "destructive",
      // });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToClipboard = (promptText: string) => {
    if (!promptText) return;
    navigator.clipboard.writeText(promptText)
      .then(() => {
        // toast({
        //   title: "Copied!",
        //   description: "The prompt has been copied to your clipboard.",
        // });
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
        // toast({
        //   title: "Copy Failed",
        //   description: "Could not copy the prompt to clipboard.",
        //   variant: "destructive",
        // });
      });
  };

  const handleRefineAgain = (promptText: string) => {
    setInputText(promptText);
    setRefinedPrompts([]);
    if (inputTextAreaRef.current) {
      inputTextAreaRef.current.focus();
    }
    // toast({
    //   title: "Ready to Refine Again",
    //   description: "The selected prompt has been loaded into the input area. You can edit it or refine directly.",
    // });
  };

  const handleSavePrompt = async () => {
    if (!isLoggedIn || !user) return;
    if (refinedPrompts.length === 0) {
      toast({ title: "Nothing to Save", description: "Please refine a prompt first.", variant: "destructive" });
      return;
    }
    if (!lastAutoSavedPromptId) {
      toast({ title: "Save Failed", description: "Could not save the prompt because the initial temporary save failed. Please try refining again.", variant: "destructive" });
      return;
    }
    try {
      const { error } = await supabase.from("prompts")
        .update({ is_temporary: false })
        .eq("id", lastAutoSavedPromptId);
      if (!error) {
        toast({ title: "Saved!", description: "Prompt saved permanently." });
        setLastAutoSavedPromptId(null);
        setShowTemporarySaveWarning(false);
      } else {
        toast({ title: "Save Failed", description: error.message, variant: "destructive" });
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "An unexpected error occurred while saving.", variant: "destructive" });
    }
  };

  const handleCustomize = () => {
    setIsCustomizing(true);
  };

  const handleSuggestFramework = async () => {
    if (!inputText.trim()) {
      toast({ title: 'Please enter your idea first!', variant: 'destructive' });
      return;
    }

    // Reset previous recommendation
    setRecommendedFramework(null);

    try {
      // Show loading state
      toast({ title: '🤖 AI is analyzing your prompt...', description: 'Finding the best framework for you' });

      // Call the AI framework suggestion
      const result = await suggestFramework({
        instruction: inputText
      });

      if (result && result.framework && result.reason) {
        setRecommendedFramework({ 
          name: result.framework, 
          reason: result.reason 
        });
        
        // Find the framework in our frameworks list to get the ID
        const frameworkId = frameworks.find(f => 
          f.name.toLowerCase() === result.framework.toLowerCase() ||
          f.name.replace(/[^A-Z]/g, '') === result.framework.replace(/[^A-Z]/g, '')
        )?.id;

        if (frameworkId) {
          // Find and select the correct category and framework
          const cat = frameworkCategories.find(cat => cat.ids.includes(frameworkId));
          if (cat) {
            setSelectedCategory(cat.label);
            setSelectedFramework(frameworkId);
          }
        }

        toast({ 
          title: '✅ Framework suggested!', 
          description: `${result.framework} has been selected for you` 
        });
      } else {
        throw new Error('Invalid response from AI');
      }
    } catch (error) {
      console.error('Error suggesting framework:', error);
      toast({ 
        title: '❌ Error suggesting framework', 
        description: 'Please try again or select manually', 
        variant: 'destructive' 
      });
      
      // Fallback to R-T-F
      const fallbackFramework = frameworks.find(f => f.id === 'rtf');
      if (fallbackFramework) {
        setRecommendedFramework({ 
          name: fallbackFramework.name, 
          reason: 'Default framework for simple tasks' 
        });
        setSelectedCategory('Quick Tasks & Productivity');
        setSelectedFramework('rtf');
      }
    }
  };

  // Helper function to generate reason based on input and selected framework
  const getFrameworkReason = (input: string, frameworkId: string): string => {
    switch (frameworkId) {
      case 'pact':
        return 'testing or experimentation, which fits well with the P-A-C-T framework\'s problem-solution approach';
      case 'care':
        return 'storytelling or case studies, which aligns with C-A-R-E\'s narrative structure';
      case 'solve':
        return 'strategic planning or business decisions, making S-O-L-V-E ideal for structured problem-solving';
      case 'race':
        return 'communication or outreach, which R-A-C-E handles effectively with its audience-focused approach';
      case 'dream':
        return 'research or analysis, which D-R-E-A-M\'s comprehensive approach is perfect for';
      case 'jobs':
        return 'career or professional development, which J.O.B.S specifically addresses';
      case 'create':
        return 'product development or creation, which C.R.E.A.T.E is designed for';
      case 'clear':
        return 'coaching or leadership, which C.L.E.A.R\'s framework excels at';
      case 'idea':
        return 'creative ideation or brainstorming, which I.D.E.A\'s framework is built for';
      default:
        return 'a straightforward task that benefits from R-T-F\'s simple but effective structure';
    }
  };
  
  // Find the selected framework name for use in the heading
  const selectedFrameworkName = frameworks.find(fw => fw.id === selectedFramework)?.name || selectedFramework;
  
  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center max-w-full space-y-8 relative isolate">
      {/* SAVED Popup */}
      <div
        className={
          showSavedPopup
            ? "fixed top-20 left-1/2 z-[9999] -translate-x-1/2 transition-transform duration-300 ease-out"
            : "fixed -top-20 left-1/2 z-[9999] -translate-x-1/2 transition-transform duration-300 ease-in"
        }
        style={{ pointerEvents: 'none' }}
      >
        <div className="flex items-center gap-2 px-6 py-3 bg-black border border-white rounded-2xl shadow-lg">
          <img src="/assets/circle-check.svg" alt="Saved" className="h-7 w-7 mr-1" />
          <span className="text-xl font-bold text-red-500 tracking-wide">SAVED</span>
        </div>
      </div>
      {/* --- TWO COLUMN LAYOUT --- */}
      <div className="relative z-10 w-full max-w-7xl flex flex-col lg:flex-row gap-8 items-start justify-center">
        {/* LEFT COLUMN: stacked input cards */}
        <div className="flex flex-col gap-8 w-full lg:w-1/2">
          {/* 1. CONFIGURE REFINEMENT CARD */}
          <Card className="shadow-lg rounded-xl w-full mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl font-headline text-primary text-center">Configure Refinement</CardTitle>
              <CardDescription className="text-center">Select prompt level and customize styles if needed.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2 text-left">Choose Prompt Level</label>
                <div className="flex flex-wrap gap-2 items-center w-full">
                  <div className="flex gap-2 flex-grow">
                    {uiPromptLevels.filter(level => level.value !== 'Custom').map(level => (
                      <Button
                        key={level.value}
                        variant={uiPromptLevel === level.value ? 'default' : 'outline'}
                        onClick={() => {
                          setUiPromptLevel(level.value);
                        }}
                        className={cn(
                          "text-sm px-3 py-1.5 h-auto rounded-md",
                          uiPromptLevel === level.value && (isCustomizing || !isCustomizing) && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                        )}
                      >
                        {level.label}
                      </Button>
                    ))}
                  </div>
                  <div className="flex gap-2 justify-end flex-shrink-0 ml-auto">
                    <Button
                      variant={isCustomizing ? 'default' : 'outline'}
                      onClick={() => setIsCustomizing((v) => !v)}
                      className={cn("text-sm px-3 py-1.5 h-auto rounded-md", isCustomizing && "ring-2 ring-primary ring-offset-2 ring-offset-background")}
                    >
                      ⭐ Customize
                      {isCustomizing ? (
                        <ChevronUp className="ml-2 h-4 w-4" />
                      ) : (
                        <ChevronDown className="ml-2 h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
              {/* Framework refinement toggle and UI for all levels */}
              <div className="flex items-center gap-3 mb-2">
                <Switch
                  checked={enableFrameworkRefinement}
                  onCheckedChange={setEnableFrameworkRefinement}
                  id="framework-refine-toggle"
                />
                <label htmlFor="framework-refine-toggle" className="text-sm font-medium text-foreground select-none cursor-pointer">
                  Refine based on framework
                </label>
              </div>
              {enableFrameworkRefinement && (
                <div className="flex flex-col gap-4">
                  <Button onClick={handleSuggestFramework} disabled={!inputText.trim()} className="w-fit self-start">
                    🤖 Let AI Suggest Framework
                  </Button>
                  {recommendedFramework && (
                    <div className="mt-2 p-3 rounded bg-muted text-foreground border border-primary/30">
                      <strong>{recommendedFramework.name}</strong> — {recommendedFramework.reason}
                    </div>
                  )}
                  <label className="block text-sm font-medium text-foreground mb-2 text-left">Select Prompt Framework</label>
                  <Select value={selectedCategory} onValueChange={(cat) => {
                    setSelectedCategory(cat);
                    setSelectedFramework(cat === 'Quick Tasks & Productivity' ? 'rtf' : '');
                  }}>
                    <SelectTrigger className="w-full text-sm py-2 rounded-md">
                      <SelectValue placeholder="Choose a category or let AI choose..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ai">Let AI choose</SelectItem>
                      {frameworkCategories.map(category => (
                        <SelectItem key={category.label} value={category.label}>{category.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedCategory && selectedCategory !== 'ai' && (
                    <Select value={selectedFramework} onValueChange={setSelectedFramework}>
                      <SelectTrigger className="w-full text-sm py-2 rounded-md mt-2">
                        <SelectValue placeholder="Choose a framework..." />
                      </SelectTrigger>
                      <SelectContent>
                        {frameworks.filter(fw => frameworkCategories.find(cat => cat.label === selectedCategory)?.ids.includes(fw.id)).map(fw => (
                          <SelectItem key={fw.id} value={fw.id} className="flex items-center gap-2">
                            {fw.emoji && <span className="mr-1">{fw.emoji}</span>}{fw.name} <span className="text-xs text-muted-foreground">({fw.structure})</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              )}
              {/* Slide-down customization panel */}
              {isCustomizing && (
                <div className="animate-slideDown">
                  <Card className="p-4 border-primary/50 bg-card/50">
                    <CardHeader className="p-0 pb-3">
                      <CardTitle className="text-lg font-semibold text-primary flex items-center gap-2">
                        <Settings2 className="h-5 w-5" />
                        Customize Your Prompt Style
                        <span className="ml-2 text-xs text-muted-foreground">(Base: {uiPromptLevel})</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <CustomStyleDropdown label="Structure" options={structureOptions} selectedValue={structureStyle} onValueChange={setStructureStyle} emoji="🧱"/>
                      <CustomStyleDropdown label="Tone" options={toneOptions} selectedValue={toneStyle} onValueChange={setToneStyle} emoji="🎨"/>
                      <CustomStyleDropdown label="Purpose" options={purposeOptions} selectedValue={purposeStyle} onValueChange={setPurposeStyle} emoji="🎯"/>
                      <CustomStyleDropdown label="AI Optimization" options={aiOptimizationOptions} selectedValue={aiOptimizationStyle} onValueChange={setAiOptimizationStyle} emoji="🤖"/>
                      <CustomStyleDropdown label="Audience" options={audienceOptions} selectedValue={audienceStyle} onValueChange={setAudienceStyle} emoji="👥"/>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
          {/* 2. CRAFT YOUR IDEA CARD */}
          <Card className="shadow-lg rounded-xl w-full mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl font-headline text-primary text-center">Craft Your Idea</CardTitle>
              <CardDescription className="text-center">Enter your initial concept for AI refinement.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label htmlFor="prompt-input" className="block text-sm font-medium text-foreground mb-1 text-left">Your Idea</label>
                <div className="flex justify-end mb-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary flex items-center gap-1 border border-primary"
                    onClick={() => {
                      const random = examplePrompts[Math.floor(Math.random() * examplePrompts.length)];
                      setInputText(random);
                    }}
                  >
                    <span className="text-base">💬</span> Try Example
                  </Button>
                </div>
                {/* Show selected custom styles as hashtags in red text when customizing */}
                {uiPromptLevel === 'Custom' && selectedCustomStyles.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-2">
                    {selectedCustomStyles.map((style, idx) => (
                      <span key={idx} className="text-xs font-semibold text-red-500 bg-red-500/10 px-2 py-1 rounded-full">#{style}</span>
                    ))}
                  </div>
                )}
                <div 
                  className={cn(
                    "relative",
                    isLoading && "textarea-shimmer-active" 
                  )}
                >
                  <Textarea
                    id="prompt-input"
                    ref={inputTextAreaRef}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="e.g., 'email to my boss about project delay', 'python script to sort files by date', 'fantasy story about a dragon learning to bake'"
                    className={cn(
                      "min-h-[120px] text-base p-3 rounded-md", 
                      isLoading && "opacity-60"
                    )}
                    aria-label="Your idea for a prompt"
                    readOnly={isLoading} 
                    aria-busy={isLoading} 
                  />
                  {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/60 z-10">
                      <Grid size={48} speed={1.5} color="black" />
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button 
                  onClick={handleRefinePrompt} 
                  disabled={isLoading || !inputText.trim() || (!isLoggedIn && guestAttemptCount >= GUEST_ATTEMPT_LIMIT)} 
                  className="flex-1 text-lg py-3 bg-accent hover:bg-accent/90 text-accent-foreground rounded-md shadow-md hover:shadow-lg transition-shadow flex items-center justify-center"
                  aria-label={isLoading ? "Refining idea" : "Refine My Idea"}
                >
                  {isLoading ? (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Refining...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Refine My Idea
                    </>
                  )}
                </Button>
                <TooltipProvider>
                  <Tooltip delayDuration={100}>
                    <TooltipTrigger asChild>
                      <div className={cn(!isLoggedIn && "cursor-not-allowed")}> 
                        <Button 
                          onClick={handleSavePrompt} 
                          disabled={!isLoggedIn || isLoading || refinedPrompts.length === 0}
                          variant="outline"
                          className={cn(
                            "flex-1 text-lg py-3 rounded-md shadow-md hover:shadow-lg transition-shadow flex items-center justify-center",
                            !isLoggedIn && "opacity-50 pointer-events-none"
                          )}
                          aria-label={isLoggedIn ? "Save Prompt" : "Login to save prompt"}
                        >
                          {!isLoggedIn && <Lock className="mr-2 h-5 w-5" />}
                          {isLoggedIn && <Save className="mr-2 h-5 w-5" />}
                          Save Prompt
                        </Button>
                      </div>
                    </TooltipTrigger>
                    {!isLoggedIn && (
                      <TooltipContent>
                        <p>🔒 Login to unlock saving prompts</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              </div>
              {!isLoggedIn && guestAttemptCount < GUEST_ATTEMPT_LIMIT && (
                <p className="text-xs text-center text-muted-foreground mt-2">
                  You have {Math.max(0, GUEST_ATTEMPT_LIMIT - guestAttemptCount)} free refinements remaining.
                </p>
              )}
              {!isLoggedIn && guestAttemptCount >= GUEST_ATTEMPT_LIMIT && (
                <Alert variant="destructive" className="mt-4">
                    <Lock className="h-4 w-4" />
                    <AlertTitle>Free Limit Reached</AlertTitle>
                    <AlertDescription>
                        Please log in to get unlimited refinements and save your prompts.
                    </AlertDescription>
                </Alert>
              )}
              {error && <p className="text-sm text-destructive mt-2 p-2 bg-destructive/10 rounded-md">{error}</p>}
            </CardContent>
          </Card>
          {/* HEADS UP ALERT BELOW CRAFT CARD */}
          {showTemporarySaveWarning && (
            <Alert className="relative w-full border-l-4 border-primary bg-background text-foreground">
              <MessageSquareWarning className="h-5 w-5" />
              <AlertTitle>Heads Up!</AlertTitle>
              <AlertDescription>
                This prompt is currently <b>temporarily saved</b> for 10 days. To keep it permanently, please click the "Save" button. It will be automatically deleted otherwise.
              </AlertDescription>
            </Alert>
          )}
        </div>
        {/* RIGHT COLUMN: results card */}
        <div className="w-full lg:w-1/2 flex flex-col gap-8">
          {refinedPrompts.length > 0 && (
            <Card className="shadow-lg rounded-xl w-full mx-auto bg-card">
              <CardHeader>
                <CardTitle className="text-2xl font-headline text-primary text-center">✨ Refined Suggestions</CardTitle>
              </CardHeader>
              <CardContent>
                {refinedPrompts.map((p, index) => (
                  <PromptSuggestionCard
                    key={index}
                    index={index}
                    prompt={p.promptText}
                    rating={p.rating}
                    onCopy={handleCopyToClipboard}
                    onRefineAgain={handleRefineAgain}
                  />
                ))}
                {/* Framework-refined prompts */}
                {enableFrameworkRefinement && frameworkRefinedPrompts.length > 0 && (
                  <div className="mt-6">
                    <div className="text-lg font-bold mb-2 text-primary">Framework-{selectedFrameworkName} Prompts</div>
                    {isFrameworkRefining && (
                      <div className="text-sm text-muted-foreground mb-2">Refining prompts using the selected framework...</div>
                    )}
                    {frameworkRefinedPrompts.map((fr, idx) => (
                      <div key={idx} className="mb-4 p-3 rounded bg-muted border border-primary/20">
                        <div className="font-semibold mb-1">Framework-{selectedFrameworkName} Prompt {idx + 1}</div>
                        <div className="whitespace-pre-line text-sm">{fr}</div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      {/* --- END TWO COLUMN LAYOUT --- */}
    </div>
  );
}
