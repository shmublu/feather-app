import type { NextApiRequest, NextApiResponse } from 'next';
import { buildWikiStructure } from '../../../utils/openai';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { description } = req.body as { description?: string };
    if (!description) {
      return res.status(400).json({ message: 'description is required' });
    }
    const result = await buildWikiStructure(description);
    res.status(200).json({ structure: result });
  } catch (err) {
    console.error('wiki-structure error', err);
    res.status(500).json({ message: 'Error generating wiki structure' });
  }
}
