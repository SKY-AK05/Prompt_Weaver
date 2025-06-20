'use server';

/**
 * @fileOverview A flow to refine simple user instructions into multiple high-quality prompt suggestions with ratings using Google Gemini.
 * Includes an option to apply a specific refinement style or a combination of styles.
 *
 * - refinePrompt - A function that refines the prompt.
 * - RefinePromptInput - The input type for the refinePrompt function.
 * - RefinePromptOutput - The return type for the refinePrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { callOpenRouter } from '@/utils/openrouter';

const RefinePromptInputSchema = z.object({
  instruction: z
    .string()
    .describe('A simple or incomplete instruction to be refined into high-quality prompts.'),
  promptLevel: z
    .enum(['Quick', 'Balanced', 'Comprehensive'])
    .describe('The desired complexity and style of prompt suggestions.'),
  refinementStyle: z
    .string()
    .optional()
    .describe('An optional specific refinement style or a comma-separated list of styles to apply, e.g., "Creative", "Concise, Formal", "SEO-Friendly".'),
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

// Simplified input schema for Chrome extension (without complex enums)
const ExtensionRefineInputSchema = z.object({
  instruction: z.string().min(1, 'Instruction cannot be empty'),
  promptLevel: z.string().optional().default('Balanced'),
  refinementStyle: z.string().optional(),
});
export type ExtensionRefineInput = z.infer<typeof ExtensionRefineInputSchema>;

// Genkit prompt for Gemini
const geminiPrompt = ai.definePrompt({
  name: 'refinePromptGemini',
  input: {schema: RefinePromptInputSchema},
  output: {schema: RefinePromptOutputSchema},
  prompt: `You are an expert prompt engineer. Your task is to refine a user's instruction into an array of 2-3 distinct, high-quality prompt variations. For each variation, you MUST provide a rating from 0 to 10 (inclusive), where 10 signifies an excellent, highly effective prompt and 0 signifies a very poor one. The style and detail of these variations should be guided by the user-selected 'promptLevel'.

User's Input:
Instruction: {{{instruction}}}
Selected Prompt Level: {{{promptLevel}}}
{{#if refinementStyle}}
Selected Custom Refinement Styles: {{{refinementStyle}}}
Please incorporate these characteristics into your prompt suggestions. If multiple styles are listed (comma-separated, e.g., "Concise, Creative, SEO-Friendly"), try to blend them harmoniously or apply them as relevant to each distinct suggestion you provide.
{{/if}}

Based on the 'promptLevel', generate the array of prompt variations as follows:

1.  **If 'promptLevel' is 'Quick':**
    *   Generate 3 short, actionable prompts.
    *   Focus on brevity and immediate usability.
    *   Minimal context or formatting hints.
    *   Minimum of 25 words per prompt.
    *   Provide a rating (0-10) for each.

2.  **If 'promptLevel' is 'Balanced':**
    *   Generate 3 moderately detailed prompts.
    *   Incorporate relevant context.
    *   Suggest a desired output format or length.
    *   Minimum of 50 words per prompt.
    *   Provide a rating (0-10) for each.

3.  **If 'promptLevel' is 'Comprehensive':**
    *   Generate 2 highly detailed prompts.
    *   Rich in context, with explicit instructions on format, style.
    *   Add deep context, goals, tone, format expectations, and examples where appropriate.
    *   Minimum of 100 words per prompt.
    *   Provide a rating (0-10) for each.

Your output MUST be a JSON object with a single key "refinedPrompts" which is an array of 2-3 objects. Each object must have a "promptText" (string for the prompt itself) and "rating" (a number between 0 and 10 for its quality). For example:
{
  "refinedPrompts": [
    { "promptText": "Prompt variation 1 focusing on brevity...", "rating": 8 },
    { "promptText": "Prompt variation 2 with more context...", "rating": 9 },
    { "promptText": "Prompt variation 3, very detailed...", "rating": 7 }
  ]
}
{{#if refinementStyle}}
Remember to apply the '{{{refinementStyle}}}' style(s) to all generated prompts.
{{/if}}
Generate the array of refined prompts with their ratings now.`,
});

export async function refinePrompt(input: RefinePromptInput): Promise<RefinePromptOutput> {
  console.log('Using Google Gemini for prompt refinement. Level:', input.promptLevel, 'Styles:', input.refinementStyle);
  try {
    const {output} = await geminiPrompt(input);
    if (!output || !output.refinedPrompts || !Array.isArray(output.refinedPrompts) || output.refinedPrompts.some(p => typeof p.promptText !== 'string' || typeof p.rating !== 'number' || p.rating < 0 || p.rating > 10)) {
      throw new Error('AI (Google Gemini) did not return the expected refinedPrompts array with promptText and a valid rating (0-10), or the array is invalid.');
    }
    return output;
  } catch (error) {
    console.error('Error during Google Gemini processing:', error);
    if (error instanceof Error && error.message.includes('GoogleGenerativeAI Error')) {
      throw error;
    } else if (error instanceof Error) {
      throw new Error(`Google Gemini processing error: ${error.message}`);
    }
    throw new Error('An unknown error occurred during Google Gemini processing.');
  }
}

export async function refinePromptForExtension(input: ExtensionRefineInput): Promise<RefinePromptOutput> {
  const validatedInput = ExtensionRefineInputSchema.parse(input);
  
  const refinedInput: RefinePromptInput = {
    instruction: validatedInput.instruction,
    promptLevel: (validatedInput.promptLevel as 'Quick' | 'Balanced' | 'Comprehensive') || 'Balanced',
    refinementStyle: validatedInput.refinementStyle || undefined,
  };

  if (!['Quick', 'Balanced', 'Comprehensive'].includes(refinedInput.promptLevel)) {
    refinedInput.promptLevel = 'Balanced';
  }

  return refinePrompt(refinedInput);
}

export async function createExtensionResponse(success: boolean, data?: any, error?: string) {
  return {
    success,
    data: data || null,
    error: error || null,
    timestamp: new Date().toISOString()
  };
}

const refinePromptFlow = ai.defineFlow(
  {
    name: 'refinePromptFlow',
    inputSchema: RefinePromptInputSchema,
    outputSchema: RefinePromptOutputSchema,
  },
  refinePrompt
);