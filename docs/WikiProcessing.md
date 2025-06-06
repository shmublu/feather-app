# Wiki Processing Guide

This document explains how to structure the story wiki and how language models should interact with it.

## 1. Sentence Numbering
- Every sentence in the main markdown file should begin with a numeric identifier in brackets, e.g. `[1]`.
- Sources or notes should reference these numbers rather than quoting text directly.

## 2. Wiki Structure
The wiki is stored in `src/data/wiki/terms.json`. It should remain machine-friendly and organized into categories.

```json
{
  "Characters": {},
  "Locations": {},
  "Objects": {},
  "CharacterTraits": {},
  "Factions": {},
  "Events": {}
}
```

Each category maps term names to an object containing a `description` and optional metadata. Avoid using specific fictional names in this guide—focus on describing the categories.

### Non‑fiction Example
For a biography project, the same structure can be used with categories like `People`, `Places`, `Documents`, etc.

## 3. Processing Workflow
1. Parse the markdown document and produce an array of numbered sentences.
2. Compare the snippet or proposed change with the existing wiki data.
3. Generate JSON instructions describing which sentences to edit or append.
4. Return the JSON in a consistent format so the front end can handle it.

## 4. JSON Output Schema
```json
{
  "edits": [
    {
      "sentence": "<existing sentence text>",
      "reason": "<why this needs editing>",
      "priority": 1,
      "priorityReason": "<context for the priority>"
    }
  ]
}
```
The `priority` value ranks how urgently a change should be made (1 is highest). The front end can display or sort these edits accordingly.

## 5. Prompt Library
Below are example prompts for common scenarios. They assume that the model has access to the wiki terms and a snippet of text.

1. **Update Wiki from Snippet**
   - *Long Snippet:* Provide a detailed paragraph describing characters, locations, and items. Ask the model to update or create terms in the wiki categories.
   - *Short Snippet:* Provide one or two sentences. Ask the model to identify any new terms and add them to the wiki with brief descriptions.
   - *Empty Wiki:* When no information exists yet, the model should create the initial categories and terms.
2. **Edit Snippet Based on Wiki**
   - Instruct the model to check the snippet against existing wiki data and modify conflicting descriptions.
3. **Edit Wiki After Story Change**
   - The model reviews changed text and updates relevant wiki entries accordingly.
4. **Find Contradictory Sentences**
   - The model scans the numbered sentences and lists any that conflict with wiki facts.
5. **Suggest Expansion**
   - Ask for suggestions on where to insert additional context or references within the story.
6. **Summarize a Long Snippet**
   - Produce a concise summary referencing sentence numbers.
7. **Identify Missing Sources**
   - List sentences that should cite a source but currently do not.
8. **Generate Edit List**
   - Return the JSON structure described above, filling in reasons and priority for each sentence.

## 6. Separation from UI
Processing logic lives in TypeScript under `src/lib/wikiProcessor.ts`. The front end will call these functions through API routes, keeping presentation and processing separated.
