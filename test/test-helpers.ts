import type { Wiki, FictionWiki } from './types';

function isFiction(wiki: any): wiki is FictionWiki {
    // A simple check to differentiate between wiki types based on unique keys.
    return 'characters' in wiki && 'plot_arcs' in wiki;
}

/**
 * Calculates a simple extraction score by checking for the presence of key entity names.
 * @param wiki The generated wiki object.
 * @param expectedNames An array of strings of expected entity names.
 * @returns A score from 0 to 1.
 */
export function calculateExtractionScore(wiki: Partial<Wiki>, expectedNames: string[]): number {
  if (!expectedNames || expectedNames.length === 0) return 1;

  const foundNames = new Set<string>();
  const pools = isFiction(wiki)
    ? [wiki.characters, wiki.settings, wiki.plot_arcs, wiki.items]
    : [wiki.key_entities, wiki.themes_and_arguments, wiki.evidence_pool];

  for (const pool of pools) {
    if (Array.isArray(pool)) {
      for (const entity of pool) {
        // Defensive coding: ensure properties exist before access
        let name: string | undefined;
        if (entity?.name?.value) name = entity.name.value;
        else if (entity?.title?.value) name = entity.title.value;
        else if (entity?.statement?.value) name = entity.statement.value;
        
        if (name) {
            foundNames.add(name.toLowerCase());
        }
      }
    }
  }

  let correctCount = 0;
  for (const expected of expectedNames) {
    const foundMatch = Array.from(foundNames).some(found => found.includes(expected.toLowerCase()));
    if (foundMatch) {
      correctCount++;
    }
  }

  return correctCount / expectedNames.length;
}