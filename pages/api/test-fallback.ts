import type { NextApiRequest, NextApiResponse } from 'next';
import { fallbackRefinement } from '@/ai/flows/fallback-refinement';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const promptText = req.body.promptText || "Write a short email to my boss about a project delay.";
  try {
    const result = await fallbackRefinement({ promptText });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
} 