import fs from 'fs';
import path from 'path';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { WikiTerms } from '../../../types';
import { create_client, generate_struct } from '../index';

const inputTextFilePath = path.join(process.cwd(), 'src', 'data', 'input.md');
const termsFilePath = path.join(process.cwd(), 'src', 'data', 'terms.json');
const newTermsFilePath = path.join(process.cwd(), 'src', 'data', 'terms_new.json');

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<WikiTerms | { message: string }>
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const inputText = fs.readFileSync(inputTextFilePath, 'utf8');
    const client = await create_client();
    await generate_struct(client, inputText, termsFilePath);
    fs.copyFileSync(termsFilePath, newTermsFilePath);
    let terms: WikiTerms = [];
    try {
      const parsed = JSON.parse(fs.readFileSync(termsFilePath, 'utf8'));
      if (Array.isArray(parsed)) terms = parsed;
    } catch {}
    terms = terms.map(t => ({ ...t, title: t.title || t.text, aliases: t.aliases || [] }));
    fs.writeFileSync(termsFilePath, JSON.stringify(terms, null, 2), 'utf8');
    fs.writeFileSync(newTermsFilePath, JSON.stringify(terms, null, 2), 'utf8');
    res.status(200).json(terms);
  } catch (error) {
    console.error('Error building wiki terms:', error);
    res.status(500).json({ message: 'Error building wiki' });
  }
}
