import type { NextApiRequest, NextApiResponse } from 'next';
import { fillWiki } from '../../../utils/openai';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { wiki, text } = req.body as { wiki?: Record<string, unknown>; text?: string };
    if (!wiki || !text) {
      return res.status(400).json({ message: 'wiki and text are required' });
    }
    const result = await fillWiki(wiki, text);
    res.status(200).json({ wiki: result });
  } catch (err) {
    console.error('wiki-fill error', err);
    res.status(500).json({ message: 'Error filling wiki' });
  }
}
