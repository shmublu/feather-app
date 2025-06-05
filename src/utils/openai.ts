import type { ChatCompletionMessageParam } from 'openai';

const OPENAI_ENDPOINT = 'https://api.openai.com/v1/chat/completions';

async function callOpenAI(messages: ChatCompletionMessageParam[], model = 'gpt-3.5-turbo-0125'): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not set');
  }

  const res = await fetch(OPENAI_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI request failed: ${res.status} ${text}`);
  }

  const data = await res.json();
  const message = data.choices?.[0]?.message?.content || '';
  return message.trim();
}

export async function buildWikiStructure(description: string): Promise<Record<string, unknown>> {
  const system = `You help organize wikis. Always respond with JSON.`;
  const exampleUser = `Request: Build a wiki outline for a fantasy novel with characters and locations.`;
  const exampleAssistant = JSON.stringify({
    characters: { character_name: '', race: '', role: '' },
    locations: { location_name: '', description: '' },
  }, null, 2);
  const messages: ChatCompletionMessageParam[] = [
    { role: 'system', content: system },
    { role: 'user', content: exampleUser },
    { role: 'assistant', content: exampleAssistant },
    { role: 'user', content: description },
  ];

  const text = await callOpenAI(messages);
  return JSON.parse(text);
}

export async function fillWiki(existingWiki: Record<string, unknown>, text: string): Promise<Record<string, unknown>> {
  const system = `You fill in wiki entries using provided text. Always respond with JSON.`;
  const exampleUser = `Wiki: { character: { name: "Alice", eye_color: "blue" } } Text: "Alice looked at Bob. Her blue eyes sparkled."`;
  const exampleAssistant = JSON.stringify({
    character: {
      name: { value: 'Alice', sources: [1] },
      eye_color: { value: 'blue', sources: [2] },
    },
  }, null, 2);
  const messages: ChatCompletionMessageParam[] = [
    { role: 'system', content: system },
    { role: 'user', content: exampleUser },
    { role: 'assistant', content: exampleAssistant },
    { role: 'user', content: `Wiki: ${JSON.stringify(existingWiki)} Text: ${text}` },
  ];

  const answer = await callOpenAI(messages);
  return JSON.parse(answer);
}

export async function findSentencesToEdit(
  existingWiki: Record<string, unknown>,
  text: string,
  editDescription: string,
): Promise<Array<{ sentence: number; reason: string }>> {
  const system = `Find sentences needing edits based on changes to the wiki. Always respond with JSON.`;
  const exampleUser = `Change: eye_color from brown to blue. Wiki: { character: { eye_color: 'brown' } } Text: "Henry loved her dark eyes. Her eyes were the color of chocolate."`;
  const exampleAssistant = JSON.stringify([
    { sentence: 1, reason: 'mentions dark eyes' },
    { sentence: 2, reason: 'explicitly states eye color' },
  ], null, 2);
  const messages: ChatCompletionMessageParam[] = [
    { role: 'system', content: system },
    { role: 'user', content: exampleUser },
    { role: 'assistant', content: exampleAssistant },
    { role: 'user', content: `Change: ${editDescription} Wiki: ${JSON.stringify(existingWiki)} Text: ${text}` },
  ];

  const result = await callOpenAI(messages);
  return JSON.parse(result);
}


