import { callOpenRouter } from '@/utils/openrouter';

export async function fallbackRefinement({ promptText }: { promptText: string }) {
  const messages = [
    {
      role: 'system',
      content: 'You are a helpful assistant. Clean up and improve the following prompt for clarity and effectiveness.',
    },
    {
      role: 'user',
      content: promptText,
    },
  ];
  const result = await callOpenRouter(messages, 'mistral/mistral-7b-instruct');
  return { improvedPrompt: result.trim() };
} 