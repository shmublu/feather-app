// src/types/index.ts

export interface Frontmatter {
  title?: string;
  scene?: string;
  status?: string;
  tags?: string[];
}

export interface FictionData {
  frontmatter: Frontmatter;
  markdownContent: string;
  wordCount: number;
}

export interface TermData {
  description: string;
  category: string;
}

export interface WikiTerms {
  [key: string]: TermData;
}

// Used for the simpler key:description mapping in the fiction editor
export interface KnownTerms {
  [key: string]: string;
}

export interface HoveredTermInfo {
  term: string;
  description: string;
  x: number;
  y: number;
  style?: 'purple' | 'yellow';
}