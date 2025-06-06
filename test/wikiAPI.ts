import OpenAI from 'openai';
import { prompts } from './prompts';
import type { Wiki, EditSuggestion } from './types';

async function callOpenAI(
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[]
): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is not set.');
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      temperature: 0,
      response_format: { type: 'json_object' },
    });
    return response.choices[0]?.message?.content || '{}';
  } catch (error) {
    if (error instanceof OpenAI.APIError && error.code === 'content_filter') {
        console.error("OpenAI API Error: The response was blocked by the content filter.");
        return '{}';
    }
    console.error('Error calling OpenAI API:', error);
    return '{}';
  }
}

export async function buildWikiStructure(
  description: string,
  textChunk: string
): Promise<Partial<Wiki>> {
  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: 'system', content: prompts.buildStructure.system },
    ...prompts.buildStructure.examples.flatMap(ex => ([
        { role: 'user' as const, content: ex.user },
        { role: 'assistant' as const, content: ex.assistant }
    ])),
    { role: 'user', content: `Request: ${description}\nText: "${textChunk}"` },
  ];
  const result = await callOpenAI(messages);
  return JSON.parse(result);
}

export async function fillWiki(
  existingWiki: Partial<Wiki>,
  text: string
): Promise<Wiki> {
  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: 'system', content: prompts.fillWiki.system },
    { role: 'user', content: prompts.fillWiki.example.user },
    { role: 'assistant', content: prompts.fillWiki.example.assistant },
    { role: 'user', content: `Now, using the provided text, populate this wiki schema:\n\nWiki: ${JSON.stringify(existingWiki)}\n\nText: "${text}"` },
  ];
  const result = await callOpenAI(messages);
  return JSON.parse(result) as Wiki;
}

export async function proposeTextEditsForWikiChange(
  originalWiki: Partial<Wiki>,
  updatedWiki: Partial<Wiki>,
  text: string
): Promise<EditSuggestion[]> {
  const userContent = `Original Wiki: ${JSON.stringify(originalWiki)}\n\nUpdated Wiki: ${JSON.stringify(updatedWiki)}\n\nSource Text: "${text}"`;
  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: 'system', content: prompts.proposeEdits.system },
    ...prompts.proposeEdits.examples.flatMap(ex => ([
        { role: 'user' as const, content: ex.user },
        { role: 'assistant' as const, content: ex.assistant }
    ])),
    { role: 'user', content: userContent },
  ];
  const result = await callOpenAI(messages);
  const parsed = JSON.parse(result);
  return parsed.edits || [];
}

/**
 * The new "Completeness Critic" agent.
 * It checks if a generated wiki has missed any information from the source text.
 */
export async function checkCompleteness(
    generatedJson: Partial<Wiki>,
    sourceText: string
): Promise<{ is_complete: boolean; missing_information: string }> {
    const userContent = `Source Text: "${sourceText}"\n\nGenerated JSON: ${JSON.stringify(generatedJson, null, 2)}`;
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        { role: 'system', content: prompts.completenessCritic.system },
        { role: 'user', content: userContent }
    ];
    const result = await callOpenAI(messages);
    return JSON.parse(result);
}