export function splitIntoSentences(text: string): string[] {
  return text
    .replace(/\n+/g, ' ') // replace newlines with spaces
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(Boolean);
}

export function numberSentences(text: string): { numberedText: string; sentences: { number: number; sentence: string }[] } {
  const sentences = splitIntoSentences(text);
  const mapping = sentences.map((sentence, idx) => ({ number: idx + 1, sentence }));
  const numberedText = mapping.map(m => `[${m.number}] ${m.sentence}`).join(' ');
  return { numberedText, sentences: mapping };
}

interface Pattern {
  find: string | RegExp;
  reason: string;
  priority?: number;
  priorityReason?: string;
}

export function getEditSuggestions(text: string, patterns: Pattern[]): import('../types').EditSuggestion[] {
  const sentences = splitIntoSentences(text);
  const suggestions: import('../types').EditSuggestion[] = [];
  sentences.forEach((sentence) => {
    patterns.forEach(pat => {
      const regex = typeof pat.find === 'string' ? new RegExp(pat.find, 'i') : pat.find;
      if (regex.test(sentence)) {
        suggestions.push({
          sentence,
          reason: pat.reason,
          priority: pat.priority,
          priorityReason: pat.priorityReason,
        });
      }
    });
  });
  return suggestions;
}
