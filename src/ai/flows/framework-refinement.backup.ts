import { callOpenRouter } from '@/utils/openrouter';

export async function frameworkRefinement({
  promptText,
  framework,
  frameworkStructure,
}: {
  promptText: string;
  framework: string;
  frameworkStructure: string;
}) {
  console.log(
    `Using OpenRouter for framework refinement. Framework: ${framework}, Structure: ${frameworkStructure}`
  );
  const messages = [
    {
      role: 'system',
      content: `You are an expert prompt engineer. Refine the following prompt using the ${framework} framework (${frameworkStructure}). Respond with the improved prompt and a 1-2 sentence explanation of how you applied the framework.`,
    },
    {
      role: 'user',
      content: promptText,
    },
  ];
  const result = await callOpenRouter(messages, 'openchat/openchat-3.5-1210');
  // Try to split the result into prompt and explanation
  const [frameworkRefinedPrompt, ...explanationParts] = result.split(/\n\n|\n/);
  return {
    frameworkRefinedPrompt: frameworkRefinedPrompt.trim(),
    frameworkExplanation: explanationParts.join(' ').trim(),
  };
} 