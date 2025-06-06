import type { NextApiRequest, NextApiResponse } from 'next';
import { diffSentences } from 'diff';
import { create_client } from '../index';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { oldText, newText, wiki } = req.body as { oldText: string; newText: string; wiki: Record<string, unknown> };
  if (typeof oldText !== 'string' || typeof newText !== 'string' || typeof wiki !== 'object') {
    return res.status(400).json({ message: 'Invalid payload' });
  }

  const diffs = diffSentences(oldText, newText);
  const edits: { before: string; after: string }[] = [];
  let contextBuffer = '';
  diffs.forEach(part => {
    if (!part.added && !part.removed) {
      contextBuffer = part.value.trim();
      return;
    }
    if (part.removed) {
      const before = (contextBuffer + ' ' + part.value).trim();
      edits.push({ before, after: '' });
      contextBuffer = '';
    }
    if (part.added) {
      const after = (contextBuffer + ' ' + part.value).trim();
      edits.push({ before: '', after });
      contextBuffer = '';
    }
  });

  const client = await create_client();
  const prompt = `Current Wiki: ${JSON.stringify(wiki)}\nEdits: ${JSON.stringify(edits)}\n\nApply the edits to the wiki so it stays consistent with the new text. Return the updated wiki JSON only.`;

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You update a wiki JSON in response to text edits.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0,
    });
    const content = response.choices[0].message?.content || '{}';
    const updatedWiki = JSON.parse(content);

    const termsFilePath = path.join(process.cwd(), 'src', 'data', 'terms.json');
    fs.writeFileSync(termsFilePath, JSON.stringify(updatedWiki, null, 2));

    res.status(200).json({ wiki: updatedWiki });
  } catch (err) {
    console.error('OpenAI error', err);
    res.status(500).json({ message: 'Failed to update wiki' });
  }
}
