import type { NextApiRequest, NextApiResponse } from 'next';
import { findSentencesToEdit } from '../../../utils/openai';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { wiki, text, change } = req.body as {
      wiki?: Record<string, unknown>;
      text?: string;
      change?: string;
    };
    if (!wiki || !text || !change) {
      return res.status(400).json({ message: 'wiki, text and change are required' });
    }
    const result = await findSentencesToEdit(wiki, text, change);
    res.status(200).json({ edits: result });
  } catch (err) {
    console.error('find-edits error', err);
    res.status(500).json({ message: 'Error finding edits' });
  }
}
