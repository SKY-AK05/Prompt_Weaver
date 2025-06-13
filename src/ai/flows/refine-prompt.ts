'use server';

/**
 * @fileOverview A flow to refine simple user instructions into multiple high-quality prompt suggestions with ratings using Google Gemini.
 * Updated for Chrome Extension compatibility and robust error handling.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const RefinePromptInputSchema = z.object({
  instruction: z
    .string()
    .describe('A simple or incomplete instruction to be refined into high-quality prompts.'),
  promptLevel: z
    .enum(['Quick', 'Balanced', 'Comprehensive'])
    .describe('The desired complexity and style of prompt suggestions.'),
});
export type RefinePromptInput = z.infer<typeof RefinePromptInputSchema>;

const RefinedPromptDetailSchema = z.object({
  promptText: z.string().describe("A refined prompt suggestion."),
  rating: z.number().min(0).max(10).describe("A rating for the prompt quality from 0 to 10 (inclusive), where 10 is an excellent, highly effective prompt and 0 is a very poor prompt.")
});

const RefinePromptOutputSchema = z.object({
  refinedPrompts: z
    .array(RefinedPromptDetailSchema)
    .describe('An array of 2-3 refined prompt suggestions, each with its text and a rating from 0 to 10.'),
});
export type RefinePromptOutput = z.infer<typeof RefinePromptOutputSchema>;

const ExtensionRefineInputSchema = z.object({
  instruction: z.string().min(1, 'Instruction cannot be empty'),
  promptLevel: z.string().optional().default('Balanced'),
});
export type ExtensionRefineInput = z.infer<typeof ExtensionRefineInputSchema>;

// Define Gemini prompt
const geminiPrompt = ai.definePrompt({
  name: 'refinePromptGemini',
  input: { schema: RefinePromptInputSchema },
  output: { schema: RefinePromptOutputSchema },
  prompt: `You are an expert prompt engineer... [TRIMMED for brevity, same as before]`
});

/**
 * Retry logic with exponential backoff for Gemini API
 */
async function retryGeminiPrompt(input: RefinePromptInput, retries = 3, delay = 1000): Promise<RefinePromptOutput> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const result = await geminiPrompt(input);
      if (!result?.output) {
        throw new Error("Gemini API returned null or undefined output");
      }
      return result.output;
    } catch (error: any) {
      if (error?.status === 503 && attempt < retries - 1) {
        console.warn(`Retrying Gemini request... attempt ${attempt + 1}`);
        await new Promise(res => setTimeout(res, delay));
        delay *= 2; // exponential backoff
      } else {
        throw error;
      }
    }
  }
  throw new Error("Gemini API failed after multiple attempts.");
}

/**
 * Main refinePrompt function
 */
export async function refinePrompt(input: RefinePromptInput): Promise<RefinePromptOutput> {
  console.log('Using Google Gemini for prompt refinement with ratings.');
  try {
    const output = await retryGeminiPrompt(input);

    // Validate response
    if (
      !output || !output.refinedPrompts || 
      !Array.isArray(output.refinedPrompts) ||
      output.refinedPrompts.some(p =>
        typeof p.promptText !== 'string' ||
        typeof p.rating !== 'number' ||
        p.rating < 0 || p.rating > 10
      )
    ) {
      throw new Error('AI (Google Gemini) did not return the expected refinedPrompts array with valid ratings.');
    }

    return output;
  } catch (error: any) {
    console.error('Error during Google Gemini processing:', error);

    if (error?.status === 503) {
      throw new Error("Our AI assistant is temporarily unavailable due to high demand. Please try again in a few minutes.");
    } else if (error instanceof Error) {
      throw new Error(`Google Gemini processing error: ${error.message}`);
    } else {
      throw new Error('An unknown error occurred during Google Gemini processing.');
    }
  }
}

/**
 * Simplified version for Chrome Extension use
 */
export async function refinePromptForExtension(input: ExtensionRefineInput): Promise<RefinePromptOutput> {
  const validatedInput = ExtensionRefineInputSchema.parse(input);

  const refinedInput: RefinePromptInput = {
    instruction: validatedInput.instruction,
    promptLevel: (validatedInput.promptLevel as 'Quick' | 'Balanced' | 'Comprehensive') || 'Balanced',
  };

  if (!['Quick', 'Balanced', 'Comprehensive'].includes(refinedInput.promptLevel)) {
    refinedInput.promptLevel = 'Balanced';
  }

  return refinePrompt(refinedInput);
}

/**
 * Utility function to return consistent response format
 */
export async function createExtensionResponse(success: boolean, data?: any, error?: string) {
  return {
    success,
    data: data || null,
    error: error || null,
    timestamp: new Date().toISOString()
  };
}

/**
 * Optional flow export (if used elsewhere)
 */
const refinePromptFlow = ai.defineFlow(
  {
    name: 'refinePromptFlow',
    inputSchema: RefinePromptInputSchema,
    outputSchema: RefinePromptOutputSchema,
  },
  refinePrompt
);
