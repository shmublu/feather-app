import type { NextApiRequest, NextApiResponse } from 'next';
import { getEditSuggestions } from '../../../utils/wikiProcessor';
import type { EditSuggestion } from '../../../types';

interface SuggestionRequest {
  text: string;
  patterns: {
    find: string;
    reason: string;
    priority?: number;
    priorityReason?: string;
  }[];
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ suggestions: EditSuggestion[] } | { message: string }>
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  const body: SuggestionRequest = req.body;
  if (!body || typeof body.text !== 'string' || !Array.isArray(body.patterns)) {
    return res.status(400).json({ message: 'Invalid payload' });
  }

  const suggestions = getEditSuggestions(body.text, body.patterns);
  res.status(200).json({ suggestions });
}
