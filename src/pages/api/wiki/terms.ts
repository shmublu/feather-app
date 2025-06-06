// src/pages/api/wiki/terms.ts

import fs from 'fs';
import path from 'path';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { WikiTerms } from '../../../types';

import { create_client, generate_errors } from '../index';

type ErrorResponse = {
  message: string;
};

type SuccessResponse = {
  message: string;
  terms: WikiTerms;
};

const inputTextFilePath = path.join(process.cwd(), 'src', 'data', 'input.md');
const termsFilePath = path.join(process.cwd(), 'src', 'data', 'terms.json');
const newTermsFilePath = path.join(process.cwd(), 'src', 'data', 'terms_new.json');
const errorsFilePath = path.join(process.cwd(), 'src', 'data', 'errors.json');

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<WikiTerms | SuccessResponse | ErrorResponse>
) {
  if (req.method === 'GET') {
    try {
      const fileContents = fs.readFileSync(termsFilePath, 'utf8');
      let terms: WikiTerms = [];
      try {
        const parsed = JSON.parse(fileContents);
        if (Array.isArray(parsed)) terms = parsed;
      } catch {}
      terms = terms.map(t => ({ ...t, title: t.title || t.text, aliases: t.aliases || [] }));
      res.status(200).json(terms);
    } catch (error) {
      console.error('Error reading wiki terms:', error);
      res.status(500).json({ message: 'Error reading wiki terms' });
    }
  } else if (req.method === 'POST') {
    try {
      let newTerms: WikiTerms = [];
      try {
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        if (Array.isArray(body)) newTerms = body;
      } catch {
        return res.status(400).json({ message: 'Invalid JSON payload.' });
      }
      newTerms = newTerms.map(t => ({ ...t, title: t.title || t.text, aliases: t.aliases || [] }));
      fs.writeFileSync(newTermsFilePath, JSON.stringify(newTerms, null, 2), 'utf8');

      const client = await create_client();
      const struct1 = JSON.parse(fs.readFileSync(termsFilePath, 'utf8'));
      const struct2 = JSON.parse(fs.readFileSync(newTermsFilePath, 'utf8'));
      const inputText = fs.readFileSync(inputTextFilePath, 'utf8');
      await generate_errors(client, inputText, struct1, struct2, errorsFilePath);
      res.status(200).json({ message: 'Wiki terms saved successfully', terms: newTerms });
    } catch (error) {
      console.error('Error saving wiki terms:', error);
      res.status(500).json({ message: 'Error saving wiki terms' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}