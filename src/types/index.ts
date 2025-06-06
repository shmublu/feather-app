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

export interface WikiTerm {
  /** Text snippet in the source used for highlighting */
  text: string;
  /** Display title shown in the UI */
  title: string;
  /** Additional text variants that should highlight this term */
  aliases?: string[];
  description: string;
  category: string;
  preceding?: string;
}

export type WikiTerms = WikiTerm[];

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