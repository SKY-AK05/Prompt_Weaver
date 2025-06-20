'use server';

/**
 * @fileOverview A flow to suggest the most suitable prompt framework based on user input using Google Gemini.
 * Returns a framework suggestion with a brief explanation of why it fits.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const FrameworkSuggestionInputSchema = z.object({
  instruction: z
    .string()
    .describe('The user\'s rough prompt or idea that needs a framework suggestion.'),
});
export type FrameworkSuggestionInput = z.infer<typeof FrameworkSuggestionInputSchema>;

const FrameworkSuggestionOutputSchema = z.object({
  framework: z
    .string()
    .describe('The name of the suggested framework (e.g., "R-T-F", "D-R-E-A-M", etc.)'),
  reason: z
    .string()
    .describe('A one-line explanation of why this framework fits the user\'s needs'),
});
export type FrameworkSuggestionOutput = z.infer<typeof FrameworkSuggestionOutputSchema>;

// Genkit prompt for Gemini
const geminiPrompt = ai.definePrompt({
  name: 'suggestFrameworkGemini',
  input: { schema: FrameworkSuggestionInputSchema },
  output: { schema: FrameworkSuggestionOutputSchema },
  prompt: `You are a prompt strategist.

Given a user's rough prompt or idea, recommend the most suitable prompt framework from this list.

Respond ONLY with a JSON object containing:
- framework: The framework name
- reason: A 1-line reason why it fits

Framework Options:

🟩 R-T-F  
When to use: Quick, simple tasks.  
Structure: Role, Task, Format

🟨 S-O-L-V-E  
When to use: Strategy, planning, problem-solving.  
Structure: Situation, Objective, Limitations, Vision, Execution

🟪 T-A-G  
When to use: Small, focused tasks or systems.  
Structure: Task, Action, Goal

🟦 R-A-C-E  
When to use: Persona-based marketing or outreach.  
Structure: Role, Action, Context, Expectation

🟧 D-R-E-A-M  
When to use: Research-based, full-cycle planning.  
Structure: Define, Research, Execute, Analyse, Measure

🟥 P-A-C-T  
When to use: A/B testing and iterative growth.  
Structure: Problem, Approach, Components, Test

🟫 C-A-R-E  
When to use: Storytelling, proof, case studies.  
Structure: Context, Action, Result, Example

⬛ R-I-S-E  
When to use: Operations, team process, goal-setting.  
Structure: Role, Input, Steps, Expectation

🟩 S.C.O.R.E.  
When to use: Persuasive writing, testimonials.  
Structure: Situation, Challenge, Outcome, Response, Evidence

🟨 I.D.E.A.  
When to use: Creative brainstorming.  
Structure: Inspiration, Development, Execution, Analysis

🟪 M.I.C.E.  
When to use: Storytelling or narrative design.  
Structure: Milieu, Idea, Character, Event

🟦 J.O.B.S.  
When to use: Career or job-related prompts.  
Structure: Job Role, Objectives, Barriers, Solutions

🟧 C.L.E.A.R.  
When to use: Coaching, feedback, leadership conversations.  
Structure: Clarify, Listen, Explore, Act, Review

🟥 C.R.E.A.T.E.  
When to use: Product or project creation.  
Structure: Customer, Research, Execution, Action Plan, Testing, Evaluation

⬜ (Optional default) Use **R-T-F** if the input is too vague or simple.

User's Input:
{{{instruction}}}

Remember to respond with ONLY a JSON object containing the framework name and a one-line reason.
Example:
{
  "framework": "D-R-E-A-M",
  "reason": "Because the user is planning a detailed AI course and needs structure, execution, and analysis."
}`,
});

export async function suggestFramework(input: FrameworkSuggestionInput): Promise<FrameworkSuggestionOutput> {
  console.log('Using Google Gemini for framework suggestion. Input:', input.instruction);
  try {
    const { output } = await geminiPrompt(input);
    if (!output || !output.framework || !output.reason) {
      throw new Error('AI (Google Gemini) did not return the expected framework suggestion with reason.');
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

// Simplified input schema for Chrome extension
const ExtensionSuggestionInputSchema = z.object({
  instruction: z.string().min(1, 'Instruction cannot be empty'),
});
export type ExtensionSuggestionInput = z.infer<typeof ExtensionSuggestionInputSchema>;

export async function suggestFrameworkForExtension(input: ExtensionSuggestionInput): Promise<FrameworkSuggestionOutput> {
  const validatedInput = ExtensionSuggestionInputSchema.parse(input);
  return suggestFramework(validatedInput);
}

export async function createExtensionResponse(success: boolean, data?: any, error?: string) {
  return {
    success,
    data: data || null,
    error: error || null,
    timestamp: new Date().toISOString()
  };
}

const frameworkSuggestionFlow = ai.defineFlow(
  {
    name: 'frameworkSuggestionFlow',
    inputSchema: FrameworkSuggestionInputSchema,
    outputSchema: FrameworkSuggestionOutputSchema,
  },
  suggestFramework
); 