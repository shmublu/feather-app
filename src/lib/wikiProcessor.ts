// src/lib/wikiProcessor.ts

/**
 * Utility functions for processing wiki data and story text.
 * These helpers remain independent from the UI so that the
 * front end can call them via API routes or directly in tests.
 */

export interface EditSuggestion {
  sentence: string;
  reason: string;
  priority: number;
  priorityReason: string;
}

/** Split markdown text into individual sentences. */
export function extractSentences(markdown: string): string[] {
  const cleaned = markdown
    .replace(/\n+/g, ' ') // collapse newlines
    .replace(/\s+/g, ' ')  // normalize spaces
    .trim();
  if (!cleaned) return [];
  return cleaned
    .split(/(?<=[.!?])\s+/)
    .filter(s => s.length > 0);
}

/**
 * Prefix each sentence with its index starting at 1.
 * Returns an array of numbered sentences.
 */
export function numberSentences(sentences: string[]): string[] {
  return sentences.map((s, i) => `[${i + 1}] ${s.trim()}`);
}

/**
 * Generate a list of edit suggestions based on search terms.
 * This is a very simple implementation intended as an example.
 * For each term provided in the `updates` object, all sentences
 * containing that term are flagged.
 */
export function generateEditList(
  sentences: string[],
  updates: Record<string, string>
): EditSuggestion[] {
  const edits: EditSuggestion[] = [];
  Object.keys(updates).forEach(term => {
    sentences.forEach(s => {
      if (s.toLowerCase().includes(term.toLowerCase())) {
        edits.push({
          sentence: s,
          reason: `Contains term "${term}" which may need update to "${updates[term]}"`,
          priority: 2,
          priorityReason: 'Automatic detection based on term match.'
        });
      }
    });
  });
  return edits;
}

/** Convert the edit list to the standard JSON payload. */
export function toEditPayload(edits: EditSuggestion[]) {
  return { edits };
}
