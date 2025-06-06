import type { ChatCompletionMessageParam } from 'openai';
import { test }llm_prompt from 'node:test';
import assert from 'node:assert';
import { fetch } from 'undici';

const OPENAI_ENDPOINT = 'https://api.openai.com/v1/chat/completions';

/**
 * A generalized function to call the OpenAI Chat Completions API.
 * @param messages The array of messages to send to the API.
 * @param model The model to use for the completion.
 * @returns The message content from the API response.
 */
async function callOpenAI(messages: ChatCompletionMessageParam[], model = 'gpt-4o'): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is not set.');
  }

  try {
    const res = await fetch(OPENAI_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0, // Set to 0 for deterministic outputs
        response_format: { type: 'json_object' }, // Ensure JSON output
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`OpenAI API request failed: ${res.status} ${errorText}`);
    }

    const data = await res.json();
    const message = data.choices?.[0]?.message?.content || '';
    return message.trim();
  } catch (error) {
    console.error("Error calling OpenAI:", error);
    throw error;
  }
}

// #region Core Wiki Functions

/**
 * Analyzes a text chunk and generates a structured JSON wiki outline.
 * This function defines the schema of the wiki based on the content.
 *
 * @param description A descriptive prompt outlining the user's goal.
 * @param textChunk A chunk of the source text to analyze.
 * @returns A promise that resolves to the JSON structure of the wiki.
 */
export async function buildWikiStructure(description: string, textChunk: string): Promise<Record<string, unknown>> {
  const system = `You are an AI assistant that helps organize wikis by creating a JSON schema. Analyze the provided text chunk and the user's request to determine the main entities and their relevant attributes. Respond with a JSON object that can serve as a template. For items that could have multiple entries (like characters or events), use an array with a template object.`;

  const exampleUser = `Request: Build a wiki outline for a fantasy novel with characters, locations, and magical items. Text: "Elara, a knight with a silver sword, entered the Whispering Woods. The woods were ancient, guarded by sentient trees. She sought the Sunstone, a gem of immense power."`;
  const exampleAssistant = JSON.stringify({
    characters: [{ name: '', role: '', items: [] }],
    locations: [{ name: '', description: '' }],
    items: [{ name: '', type: 'magical', description: '' }],
  });

  const messages: ChatCompletionMessageParam[] = [
    { role: 'system', content: system },
    { role: 'user', content: exampleUser },
    { role: 'assistant', content: exampleAssistant },
    { role: 'user', content: `Request: ${description} Text: "${textChunk}"` },
  ];

  const text = await callOpenAI(messages);
  return JSON.parse(text);
}

/**
 * Fills a pre-existing wiki with information extracted from a text chunk.
 * It can add new entries, update existing ones, and adds source references.
 *
 * @param existingWiki The current state of the wiki (JSON object).
 * @param text The text chunk to extract information from.
 * @returns A promise that resolves to the updated wiki JSON object.
 */
export async function fillWiki(existingWiki: Record<string, unknown>, text: string): Promise<Record<string, unknown>> {
  const system = `You are an AI assistant that fills in wiki entries using provided text. Update the provided JSON wiki by extracting relevant information from the text. For each piece of data, wrap it in an object with 'value' and 'sources' keys. 'sources' should be an array of integers, where each integer is the 1-based index of the sentence in the text that provides the information. If a value already exists, append the new source index. If the text provides a new value for an existing attribute, overwrite it and update the source. Always respond with the complete, updated JSON object.`;

  const exampleUser = `Wiki: { "characters": [{ "name": { "value": "Alice", "sources": [1] }, "eye_color": "" }] } Text: "Alice looked at Bob. Her blue eyes sparkled."`;
  const exampleAssistant = JSON.stringify({
    characters: [{
      name: { value: 'Alice', sources: [1] },
      eye_color: { value: 'blue', sources: [2] },
    }],
  });

  const messages: ChatCompletionMessageParam[] = [
    { role: 'system', content: system },
    { role: 'user', content: exampleUser },
    { role: 'assistant', content: exampleAssistant },
    { role: 'user', content: `Wiki: ${JSON.stringify(existingWiki)} Text: "${text}"` },
  ];

  const answer = await callOpenAI(messages);
  return JSON.parse(answer);
}

/**
 * Finds sentences in a text that need to be edited due to a change in the wiki.
 *
 * @param existingWiki The original state of the wiki (before the change).
 * @param text The source text.
 * @param editDescription A natural language description of the change made to the wiki.
 * @returns A promise resolving to an array of objects, each detailing a sentence to edit and the reason.
 */
export async function findSentencesToEdit(
  existingWiki: Record<string, unknown>,
  text: string,
  editDescription: string,
): Promise<Array<{ sentence: number; reason: string }>> {
  const system = `You are an AI assistant that identifies sentences in a text that contradict a described change to a wiki. Analyze the original wiki, the text, and the description of the change. Return a JSON array of objects, where each object contains the 1-based sentence number that needs editing and a brief reason why.`;

  const exampleUser = `Change: "Changed character Elara's hair from 'blonde' to 'raven'." Wiki: { "characters": [{ "name": "Elara", "hair_color": "blonde" }] } Text: "Elara drew her sword. Her golden hair shone in the sun. She was a formidable sight."`;
  const exampleAssistant = JSON.stringify([
    { sentence: 2, reason: "Mentions 'golden hair', which contradicts the new 'raven' hair color." },
  ]);

  const messages: ChatCompletionMessageParam[] = [
    { role: 'system', content: system },
    { role: 'user', content: exampleUser },
    { role: 'assistant', content: exampleAssistant },
    { role: 'user', content: `Change: "${editDescription}" Wiki: ${JSON.stringify(existingWiki)} Text: "${text}"` },
  ];

  const result = await callOpenAI(messages);
  // The API is instructed to return a JSON object, so we wrap it in a root key if it returns a bare array
  const parsedResult = JSON.parse(result);
  return parsedResult.edits || parsedResult; // Handle cases where the AI might wrap the array
}

// #endregion

// #region Sample Data

// -- Fiction Example --
const fictionText = `
In the shimmering city of Eldoria, Kaelen, a young elf with a penchant for ancient maps, discovered a hidden inscription. It spoke of the Shadowfang, a blade forged in dragon's breath, lost for centuries. Kaelen's mentor, a wise old wizard named Lyra, had always warned him about such relics. "They carry a heavy price," she'd say, her eyes distant. But Kaelen was determined.

He traveled to the Sunken City of Aeridor, a place now teeming with spectral guardians. His journey was fraught with peril. The city's once-golden towers were now draped in seaweed and barnacles. It was there, in the heart of the royal crypt, that he found the Shadowfang resting on a stone altar. As he grasped the hilt, a chilling whisper echoed in his mind, and the blade pulsed with a dark, violet light. Lyra had been right; the sword felt alive, and hungry.
`;

const fictionWiki = {
  characters: [
    { name: 'Kaelen', species: 'elf', role: 'protagonist', items: [] },
    { name: 'Lyra', species: 'human', role: 'mentor' },
  ],
  locations: [
    { name: 'Eldoria', description: 'A shimmering city.' },
  ],
  items: [],
};

// -- Non-Fiction Example --
const nonFictionText = `
The Battle of Thermopylae, fought in 480 BC, is one of history's most famous last stands. It pitted an alliance of Greek city-states, led by King Leonidas I of Sparta, against the invading Persian Empire, led by King Xerxes I. The primary source for these events is the historian Herodotus.

The Greek force was vastly outnumbered but held a strategic advantage at the narrow coastal pass of Thermopylae. For two days, they repelled the much larger Persian army. Herodotus numbers the Greek forces at approximately 7,000 soldiers. The Persian numbers are debated, but modern estimates range from 100,000 to 150,000. The battle concluded when a local resident named Ephialtes betrayed the Greeks, revealing a mountain path that allowed the Persians to outflank them. Leonidas, along with 300 Spartans and a few other allies, remained to fight to the death.
`;

const nonFictionWiki = {
  events: [{ name: 'Battle of Thermopylae', year: 480, location: '' }],
  people: [{ name: '', role: '', affiliation: '' }],
  sources: [{ author: 'Herodotus', work: 'The Histories' }],
};

// #endregion

// #region Unit Tests

test.describe('Wiki Builder E2E Tests', () => {

  test('Fiction: should build a wiki structure from text', async () => {
    const description = "Build a wiki for a fantasy story about characters, places, and magical items.";
    const structure = await buildWikiStructure(description, fictionText);

    assert.ok(structure.characters, 'Should have a characters key');
    assert.ok(structure.locations, 'Should have a locations key');
    assert.ok(structure.items, 'Should have an items key');
    assert.strictEqual(Array.isArray(structure.characters), true, 'Characters should be an array');
  });

  test('Fiction: should fill a wiki with extracted information', async () => {
    const updatedWiki = await fillWiki(fictionWiki, fictionText);

    // Check if Kaelen's entry is updated
    const kaelen = updatedWiki.characters[0];
    assert.deepStrictEqual(kaelen.name, { value: 'Kaelen', sources: [1, 3, 5] });

    // Check if a new location was added
    const aeridor = updatedWiki.locations.find(loc => loc.name?.value === 'Aeridor');
    assert.ok(aeridor, 'Should have added the Sunken City of Aeridor');
    assert.deepStrictEqual(aeridor.description, { value: 'A place now teeming with spectral guardians.', sources: [6] });

    // Check if a new item was added
    const shadowfang = updatedWiki.items[0];
    assert.deepStrictEqual(shadowfang.name, { value: 'Shadowfang', sources: [2, 9] });
    assert.deepStrictEqual(shadowfang.description, { value: "a blade forged in dragon's breath", sources: [2] });
  });

  test('Fiction: should find sentences to edit after a wiki change', async () => {
    const editDescription = "Changed Kaelen's mentor Lyra from a wizard to a retired warrior.";
    const edits = await findSentencesToEdit(fictionWiki, fictionText, editDescription);

    assert.strictEqual(Array.isArray(edits), true);
    assert.ok(edits.length > 0, 'Should find at least one sentence to edit');
    const firstEdit = edits[0];
    assert.strictEqual(firstEdit.sentence, 3, 'Should identify sentence 3');
    assert.ok(firstEdit.reason.includes('wizard'), 'Reason should mention "wizard"');
  });

  test('Non-Fiction: should build a wiki structure from text', async () => {
    const description = "Create a wiki structure for a historical text about a battle, including key people, events, and sources.";
    const structure = await buildWikiStructure(description, nonFictionText);

    assert.ok(structure.events, 'Should have an events key');
    assert.ok(structure.people, 'Should have a people key');
    assert.ok(structure.sources, 'Should have a sources key');
  });

  test('Non-Fiction: should fill a wiki with historical data', async () => {
    const updatedWiki = await fillWiki(nonFictionWiki, nonFictionText);

    const leonidas = updatedWiki.people.find(p => p.name?.value === 'King Leonidas I');
    assert.ok(leonidas, 'Should have added King Leonidas I');
    assert.deepStrictEqual(leonidas.affiliation, { value: 'Sparta', sources: [2] });

    const xerxes = updatedWiki.people.find(p => p.name?.value === 'King Xerxes I');
    assert.ok(xerxes, 'Should have added King Xerxes I');
    assert.deepStrictEqual(xerxes.affiliation, { value: 'Persian Empire', sources: [2] });

    const thermopylae = updatedWiki.events[0];
    assert.deepStrictEqual(thermopylae.location, { value: 'Thermopylae', sources: [4] });
  });

  test('Non-Fiction: should find sentences to edit after a data change', async () => {
    const editDescription = "Corrected the date of the Battle of Thermopylae from 480 BC to 481 BC.";
    const edits = await findSentencesToEdit(nonFictionWiki, nonFictionText, editDescription);
    
    assert.strictEqual(Array.isArray(edits), true);
    assert.ok(edits.length > 0, 'Should find at least one sentence to edit');
    const firstEdit = edits[0];
    assert.strictEqual(firstEdit.sentence, 1, 'Should identify sentence 1');
    assert.ok(firstEdit.reason.includes('480 BC'), 'Reason should mention the incorrect date');
  });

});
// #endregion