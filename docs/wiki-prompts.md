# Wiki Processing Guide

This document outlines how language models should interact with the wiki files and fiction markdown. The wiki is stored as JSON in `src/data/wiki/terms.json` and fiction scenes are markdown files in `src/data/fiction`. The goal is to keep information consistent and easy to reference.

## Numbering Sentences

When saving a markdown scene, each sentence should be prefixed with its number in brackets. This allows sources in the wiki to reference exact sentences.

Example:

```
[1] The stars hung low over the valley. [2] Our hero waited for dawn.
```

The numbering is created by the backend using `numberSentences()` from `src/utils/wikiProcessor.ts`.

## Wiki Structure

The wiki JSON contains terms as keys with a description and category. Terms are grouped logically, but the data file should remain simple so tools can load it easily. Recommended categories include:

- **Character**
- **Location**
- **Object**
- **Event**
- **Trait** (for character traits or notable qualities)

A template entry looks like:

```json
{
  "Example Term": {
    "description": "Brief explanation of the term.",
    "category": "Character"
  }
}
```

Do not populate the wiki with specific story details here. Use placeholders so the structure is clear.

## Using Tools with the Wiki

Models can access the wiki through the `/api/wiki/terms` endpoint. Editing is done by sending the full JSON back to that endpoint. Sentence numbering can be generated with `/api/wiki/suggestions` when checking for inconsistencies.

The `wikiProcessor` utility exports helper functions for splitting text into sentences, numbering them, and creating edit suggestions. See `src/utils/wikiProcessor.ts` for implementation details.

## Prompt Examples

Below are eight example prompts demonstrating different scenarios. Each response should use the JSON formats shown or numbered markdown as required.

### 1. Update Wiki from New Snippet

Input: a paragraph of text with new information. The model should extract new terms and return an updated wiki JSON object.

### 2. Edit Snippet Based on Wiki Change

Input: an updated wiki entry. The model updates existing sentences in a snippet to match the new information.

### 3. Extend Existing Wiki Entry

Input: a snippet referencing a known term. The model adds additional detail to that term in the wiki.

### 4. Number and Source Long Passage

Input: a long passage of prose. The model outputs the passage with numbered sentences and a JSON array mapping numbers to sources.

### 5. Handle Short Snippet or Single Sentence

Input: one or two sentences. The model returns numbered sentences and indicates whether any wiki updates are required.

### 6. Empty Wiki Initialization

Input: a snippet when the wiki is empty. The model creates initial wiki terms based on the text.

### 7. Dense Wiki With Many Entries

Input: a large wiki JSON and a new snippet. The model determines which existing entries need edits and which new ones to add.

### 8. Find Contradictory Sentences

Input: a changed wiki fact (for example a trait change). The model scans supplied text and returns JSON suggestions from `/api/wiki/suggestions` format indicating which sentences mention the outdated fact and why they should be updated.

Each example should be expanded in actual use with multiple sentences and detailed explanations, but these templates show the required inputs and outputs.

