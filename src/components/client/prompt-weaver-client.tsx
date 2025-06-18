"use client";

import type { RefinePromptInput, RefinePromptOutput } from '@/ai/flows/refine-prompt';
import { refinePrompt } from '@/ai/flows/refine-prompt';
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
    "Make a funny tweet about AI replacing your dog’s therapist",
    "Summarize a news article on climate change in under 100 words",
    "Write a blog intro about the future of remote work in 2030",
    "Design a quiz prompt for testing emotional intelligence",
    "Turn a boring LinkedIn summary into a story-driven personal pitch",
    "Generate daily affirmations for anxious entrepreneurs",
    "Translate ‘growth mindset’ into a 5-step plan for school students",
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
    if (!inputText.trim()) {
      setError('Please enter an idea to refine.');
      return;
    }
    setError(null);
    setIsLoading(true);
    setRefinedPrompts([]);

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
    if (refinedPrompts.length === 0 || !lastAutoSavedPromptId) return;
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
      <div className="wave-container" aria-hidden="true">
        <div className="wave wave1"></div>
        <div className="wave wave2"></div>
        <div className="wave wave3"></div>
      </div>
      
      <div className="relative z-10 flex flex-col md:flex-row md:justify-center gap-8 w-full max-w-full">
        <Card className="shadow-lg rounded-xl w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-headline text-primary">Craft Your Idea</CardTitle>
            <CardDescription>Describe your idea and choose detail level.</CardDescription>
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
                        // If customizing, keep the panel open
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

            {/* Slide-down customization panel above the text area */}
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
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button 
                onClick={handleRefinePrompt} 
                disabled={isLoading || !inputText.trim()} 
                className="flex-1 text-lg py-3 bg-accent hover:bg-accent/90 text-accent-foreground rounded-md shadow-md hover:shadow-lg transition-shadow flex items-center justify-center"
                aria-label={isLoading ? "Refining idea" : "Refine My Idea"}
              >
                {isLoading ? (
                  <>
                    <div className="flex items-center justify-center space-x-1 mr-3" aria-hidden="true">
                      <span className="loading-dot bg-accent-foreground"></span>
                      <span className="loading-dot bg-accent-foreground"></span>
                      <span className="loading-dot bg-accent-foreground"></span>
                    </div>
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
                        disabled={!isLoggedIn || isLoading}
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
            {error && <p className="text-sm text-destructive mt-2 p-2 bg-destructive/10 rounded-md">{error}</p>}
          </CardContent>
        </Card>

        {refinedPrompts.length > 0 && (
          <Card className="shadow-lg rounded-xl w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl font-headline text-primary">Refined Prompt Suggestions</CardTitle>
              <CardDescription>Here are a few variations with ratings. Copy one or refine it again!</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {refinedPrompts.map((prompt, index) => (
                <div key={index} className="border border-border p-4 rounded-lg bg-card shadow">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold text-muted-foreground">Suggestion {index + 1}</span>
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                      <StarIcon className="h-3 w-3 fill-current" />
                      {prompt.rating}/10
                    </div>
                  </div>
                  <p className="text-card-foreground whitespace-pre-wrap text-sm mb-3">{prompt.promptText}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Button onClick={() => handleCopyToClipboard(prompt.promptText)} variant="outline" size="sm" className="w-full text-sm py-2 rounded-md">
                      <Copy className="mr-2 h-4 w-4" />
                      Copy
                    </Button>
                    <Button onClick={() => handleRefineAgain(prompt.promptText)} variant="outline" size="sm" className="w-full text-sm py-2 rounded-md">
                      <RefreshCcw className="mr-2 h-4 w-4" />
                      Refine Again
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
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
  );
}
