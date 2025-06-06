/**
 * The core wrapper for every single piece of extracted data.
 * This ensures all data is traceable to its source sentence(s).
 */
export interface WikiValue<T> {
  value: T;
  sources: number[]; // 1-based index of the source sentence.
}

// ===================================
//           FICTION WIKI
// ===================================

export interface FictionCharacter {
  /** A unique, machine-readable ID. MUST start with "char-". */
  id: string;
  name: WikiValue<string>;
  role: WikiValue<string>;
  description: WikiValue<string>;
  motivations: WikiValue<string[]>;
}

export interface CharacterRelationship {
  /** An array of exactly two character IDs. */
  character_ids: [string, string];
  /** A description of the relationship between the two characters. */
  description: WikiValue<string>;
}

export interface PlotArc {
  /** A unique, machine-readable ID. MUST start with "arc-". */
  id: string;
  name: WikiValue<string>;
  summary: WikiValue<string>;
  /** An array of character IDs involved in this plot arc. */
  related_character_ids: string[];
}

export interface FictionItem {
    /** A unique, machine-readable ID. MUST start with "item-". */
    id: string;
    name: WikiValue<string>;
    description: WikiValue<string>;
    /** The thematic or symbolic meaning of the item in the story. */
    symbolism: WikiValue<string>;
}

/** The root object for a fictional narrative analysis. */
export interface FictionWiki {
  characters: FictionCharacter[];
  relationships: CharacterRelationship[];
  plot_arcs: PlotArc[];
  settings: Array<{
    name: WikiValue<string>;
    description: WikiValue<string>;
  }>;
  items: FictionItem[];
}

// ===================================
//         NON-FICTION WIKI
// ===================================

/** A single, atomic piece of evidence extracted from the text. */
export interface Evidence {
  /** A unique, machine-readable ID. MUST start with "ev-". */
  id: string;
  /** A concise summary of the evidence. */
  statement: WikiValue<string>;
  /** An optional direct quote from the text. */
  quote?: WikiValue<string>;
}

/** A major theme, thesis, or argument presented in the text. */
export interface ThemeOrArgument {
  /** A unique, machine-readable ID. MUST start with "arg-". */
  id: string;
  title: WikiValue<string>;
  summary: WikiValue<string>;
  /** An array of evidence IDs that support this argument. */
  supporting_evidence_ids: string[];
}

/** A key person, concept, or organization mentioned in the text. */
export interface NonFictionEntity {
  /** A unique, machine-readable ID. MUST start with "ent-". */
  id: string;
  name: WikiValue<string>;
  type: WikiValue<'Person' | 'Concept' | 'Organization' | 'Event' | 'FinancialMetric'>;
  summary: WikiValue<string>;
}

/** The root object for a non-fiction analysis. */
export interface NonFictionWiki {
  /** The single, overarching thesis of the entire text. */
  main_thesis: WikiValue<string>;
  /** The structured flow of arguments that support the thesis. */
  themes_and_arguments: ThemeOrArgument[];
  /** An unordered pool of all pieces of evidence extracted from the text. */
  evidence_pool: Evidence[];
  key_entities: NonFictionEntity[];
}

// ===================================
//              SHARED
// ===================================

export type Wiki = FictionWiki | NonFictionWiki;
export type EditSuggestion = { sentence: number; reason: string; };