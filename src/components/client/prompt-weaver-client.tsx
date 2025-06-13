"use client";

import type { RefinePromptInput, RefinePromptOutput } from '@/ai/flows/refine-prompt';
import { refinePrompt } from '@/ai/flows/refine-prompt';
import { cn } from "@/lib/utils";
import { supabase } from '@/lib/supabase';

import * as React from 'react';
import { useAuth } from '@/components/layout/app-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { Copy, Sparkles, Save, Lock, RefreshCcw, MessageSquareWarning, AlertCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const promptLevels = [
  { value: 'Quick' as const, label: 'Quick Suggestions' },
  { value: 'Balanced' as const, label: 'Balanced Options' },
  { value: 'Comprehensive' as const, label: 'Detailed Drafts' },
];

type PromptLevel = (typeof promptLevels)[number]['value'];

interface RefinedPrompt {
  promptText: string;
  rating: number;
}

interface PromptWeaverClientProps {
  isLoggedIn: boolean;
}

export default function PromptWeaverClient({ isLoggedIn }: PromptWeaverClientProps) {
  const { user } = useAuth();
  const [promptLevel, setPromptLevel] = React.useState<PromptLevel>('Balanced');
  const [inputText, setInputText] = React.useState('');
  const [refinedPrompts, setRefinedPrompts] = React.useState<RefinedPrompt[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [lastAutoSavedPromptId, setLastAutoSavedPromptId] = React.useState<string | null>(null);
  const { toast } = useToast();
  const inputTextAreaRef = React.useRef<HTMLTextAreaElement>(null);
  const [refinementCount, setRefinementCount] = React.useState(0);
  const [showTemporarySaveWarning, setShowTemporarySaveWarning] = React.useState(false);

  // Load refinement count from localStorage on mount
  React.useEffect(() => {
    if (!isLoggedIn) {
      const savedCount = localStorage.getItem('refinementCount');
      if (savedCount) {
        setRefinementCount(parseInt(savedCount));
      }
    } else {
      // Reset count when user logs in
      setRefinementCount(0);
      localStorage.removeItem('refinementCount');
    }
  }, [isLoggedIn]);

  const handleRefinePrompt = async () => {
    if (!inputText.trim()) {
      setError('Please enter an idea to refine.');
      return;
    }

    // Check if non-logged-in user has reached the limit
    if (!isLoggedIn && refinementCount >= 3) {
      setError('You have reached the limit of 3 refinements. Please log in to continue.');
      return;
    }

    setError(null);
    setIsLoading(true);
    setRefinedPrompts([]);

    try {
      const input: RefinePromptInput = {
        instruction: inputText,
        promptLevel: promptLevel,
      };
      const result: RefinePromptOutput = await refinePrompt(input);
      if (!result.refinedPrompts || result.refinedPrompts.length === 0) {
        setError('The AI did not return suggestions.');
      } else {
        setRefinedPrompts(result.refinedPrompts);
        
        // Increment refinement count for non-logged-in users
        if (!isLoggedIn) {
          const newCount = refinementCount + 1;
          setRefinementCount(newCount);
          localStorage.setItem('refinementCount', newCount.toString());
        }

        // Auto-save the generated prompt to the database
        if (user) {
          const createdAt = new Date();
          const expiresAt = new Date(createdAt.getTime() + 10 * 24 * 60 * 60 * 1000); // 10 days from now

          const { data: insertedData, error: saveError } = await supabase.from("prompts").insert([
            {
              user_id: user.id,
              username: user.email || 'anonymous',
              prompt_text: inputText,
              prompt_level: promptLevel,
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
            console.error("Error auto-saving prompt:", saveError);
            toast({ title: "Auto-Save Failed", description: saveError.message, variant: "destructive" });
            setLastAutoSavedPromptId(null);
          } else if (insertedData && insertedData.length > 0) {
            setLastAutoSavedPromptId(insertedData[0].id);
            toast({ title: "Auto-Saved!", description: "Your prompt has been temporarily saved." });
            setShowTemporarySaveWarning(true);
          }
        }
      }
    } catch (e: any) {
      setError(e.message || 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToClipboard = (promptText: string) => {
    if (!promptText) return;
    navigator.clipboard.writeText(promptText)
      .then(() => toast({ title: "Copied!", description: "Copied to clipboard." }))
      .catch(() => toast({ title: "Copy Failed", description: "Could not copy.", variant: "destructive" }));
  };

  const handleRefineAgain = (promptText: string) => {
    setInputText(promptText);
    setRefinedPrompts([]);
    if (inputTextAreaRef.current) inputTextAreaRef.current.focus();
  };

  const handleSavePrompt = async () => {
    if (!isLoggedIn || !user) {
      toast({ title: "Login Required", description: "Login to save.", variant: "destructive" });
      return;
    }
    if (refinedPrompts.length === 0 || !lastAutoSavedPromptId) {
      toast({ title: "Nothing to Save", description: "Refine a prompt first, or ensure it was auto-saved.", variant: "destructive" });
      return;
    }

    try {
      const { error } = await supabase.from("prompts")
        .update({ is_temporary: false })
        .eq("id", lastAutoSavedPromptId);

      if (error) {
        toast({ title: "Save Failed", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Saved!", description: "Prompt saved permanently." });
        setLastAutoSavedPromptId(null);
        setShowTemporarySaveWarning(false);
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "An unexpected error occurred while saving.", variant: "destructive" });
    }
  };

  const isRefineDisabled = !isLoggedIn && refinementCount >= 3;

  return (
    <div className="w-full max-w-5xl space-y-8 mx-auto">
      <div className="flex flex-col md:flex-row gap-8">
        <Card className="md:flex-1">
          <CardHeader>
            <CardTitle>Craft Your Idea</CardTitle>
            <CardDescription>Describe your idea and choose detail level.</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={promptLevel} onValueChange={(val: PromptLevel) => setPromptLevel(val)}>
              <SelectTrigger className="mb-6"><SelectValue placeholder="Select Detail Level" /></SelectTrigger>
              <SelectContent>
                {promptLevels.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Textarea
              ref={inputTextAreaRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Describe your idea..."
              readOnly={isLoading}
              className="min-h-[120px] mb-6"
            />
            <div className="flex gap-3 mb-6">
              <Button 
                onClick={handleRefinePrompt} 
                disabled={isLoading || isRefineDisabled}
              > 
                {isLoading ? 'Refining...' : (<><Sparkles className="mr-2 h-5 w-5" />Refine</>)}
              </Button>
              <Button onClick={handleSavePrompt} disabled={!isLoggedIn || isLoading} variant="outline">
                {isLoggedIn ? (<><Save className="mr-2 h-5 w-5" />Save</>) : (<><Lock className="mr-2 h-5 w-5" />Login to Save</>)}
              </Button>
            </div>
            {error && <p className="text-destructive text-sm mb-6">{error}</p>}

            {isRefineDisabled && (
              <Alert className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Refinement Limit Reached</AlertTitle>
                <AlertDescription>
                  You have used all 3 free refinements. Please log in to continue refining prompts.
                </AlertDescription>
              </Alert>
            )}

            {showTemporarySaveWarning && (
              <Alert className="relative w-full border-l-4 border-primary bg-background text-foreground">
                <MessageSquareWarning className="h-5 w-5" />
                <AlertTitle>Heads Up!</AlertTitle>
                <AlertDescription>
                  This prompt is currently **temporarily saved** for 10 days. To keep it permanently, please click the "Save" button. It will be automatically deleted otherwise.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {refinedPrompts.length > 0 && (
          <Card className="md:flex-1">
            <CardHeader>
              <CardTitle>Suggestions</CardTitle>
              <CardDescription>Refined prompt ideas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {refinedPrompts.map((prompt, i) => (
                <div key={i} className="p-3 border rounded-md">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Suggestion {i + 1}</span>
                    <div className="text-xs text-primary font-semibold">⭐ {prompt.rating}/10</div>
                  </div>
                  <p className="my-2 text-sm">{prompt.promptText}</p>
                  <div className="flex gap-2">
                    <Button onClick={() => handleCopyToClipboard(prompt.promptText)} size="sm" variant="outline">
                      <Copy className="h-4 w-4 mr-1" />Copy
                    </Button>
                    <Button onClick={() => handleRefineAgain(prompt.promptText)} size="sm" variant="outline">
                      <RefreshCcw className="h-4 w-4 mr-1" />Refine Again
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
