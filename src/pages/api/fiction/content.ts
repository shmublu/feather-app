// src/pages/api/fiction/content.ts

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { FictionData, Frontmatter } from '../../../types';

type ErrorResponse = {
  message: string;
};

const contentFilePath = path.join(process.cwd(), 'src', 'data', 'fiction', 'prologue.md');

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<FictionData | ErrorResponse>
) {
  if (req.method === 'GET') {
    try {
      const fileContents = fs.readFileSync(contentFilePath, 'utf8');
      const { data, content } = matter(fileContents);
      const wordCount = content.split(/\s+/).filter(Boolean).length;
      res.status(200).json({ frontmatter: data as Frontmatter, markdownContent: content, wordCount });
    } catch (error) {
      console.error('Error reading fiction content:', error);
      res.status(500).json({ message: 'Error reading fiction content' });
    }
  } else if (req.method === 'POST') {
    try {
      const { markdownContent, frontmatter } = req.body;
      if (typeof markdownContent !== 'string' || typeof frontmatter !== 'object') {
        return res.status(400).json({ message: 'Invalid payload: markdownContent (string) and frontmatter (object) are required.' });
      }

      const newFileContent = matter.stringify(markdownContent, frontmatter);
      fs.writeFileSync(contentFilePath, newFileContent, 'utf8');
      const wordCount = markdownContent.split(/\s+/).filter(Boolean).length;
      res.status(200).json({ message: 'Content saved successfully', frontmatter, markdownContent, wordCount } as any); // Use `any` to allow message property
    } catch (error) {
      console.error('Error saving fiction content:', error);
      res.status(500).json({ message: 'Error saving fiction content' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}