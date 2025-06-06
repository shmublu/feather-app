// src/pages/api/wiki/process.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { extractSentences, numberSentences, generateEditList, toEditPayload } from '../../../lib/wikiProcessor';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { markdown, updates } = req.body as { markdown: string; updates: Record<string, string> };
  if (typeof markdown !== 'string') {
    return res.status(400).json({ message: 'markdown string required' });
  }

  const sentences = extractSentences(markdown);
  const numbered = numberSentences(sentences);
  const edits = generateEditList(sentences, updates || {});

  res.status(200).json({ numbered, ...toEditPayload(edits) });
}
