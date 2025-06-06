// index.ts
import { OpenAI } from "openai";
import fs from 'fs';
import { apiKey } from "./config";

interface StructureEntry {
    preceding: string;
    text: string;
    description: string;
    category: string;
}

async function create_client(): Promise<OpenAI> {
    return new OpenAI({ apiKey });
}

async function generate_struct(client: OpenAI, input_text: string, output_filename: string): Promise<void> {
    const prompt = `
    You will be given an input text. Your goal is to structure the text into:
    - important actors
    - important events
    - important locations
    
    Include all of the characters, events, and locations that are important to the story (major and minor). They may be abstract objects.
    
    Please output your answer as a JSON list of dictionaries, each with the following fields:
    - "preceding": a few words preceding the entry to guarnatee uniqueness. It should match with a part of the text exactly.
    - "text": the text corresponding to the entry. It should match with a part of the text exactly.
    - "description": the contents of the entry
    - "category": the category of the entry. Should be one of the following: Characters (for actors), Timeline (for events), Locations (for locations).
    
    Here is the input text:
    ${input_text}
    `;

    try {
        const response = await client.responses.create({
            model: "o4-mini",
            reasoning: { effort: "low" },
            instructions: "You are an expert in writing and analyzing texts.",
            input: prompt
        });

        const output_text = response.output_text;//extractContent(response.output_text);

        console.log("Model output:", output_text);
        fs.writeFileSync(output_filename, output_text);
    } catch (err) {
        console.error("Error with o4-mini high reasoning:", err);
    }
}

async function generate_errors(
    client: OpenAI, 
    input_text: string, 
    struct1: StructureEntry[], 
    struct2: StructureEntry[],
    output_filename: string
): Promise<void> {
    console.log('struct1', struct1);
    console.log('struct2', struct2);
    const diff1 = struct1.filter(item => !struct2.some(item2 => item2.text === item.text && item2.description === item.description));
    const diff2 = struct2.filter(item => !struct1.some(item2 => item2.text === item.text && item2.description === item.description));
    
    console.log(diff1);
    console.log(diff2); 

    const prompt = `
    You will be given an input text and its structure. Your goal is to edit the text to follow a new structure.

    Here is the original text structure (only differences shown):
    ${JSON.stringify(diff1)}
    
    Here is the target text structure that we want to get after making edits to the text (only differences shown):
    ${JSON.stringify(diff2)}

    Output all of the changes to introduce in the input text to achieve the target text structure.
    Format your answer as a JSON list of dictionaries, each with the following fields:
    - "text": the text in the original text that the user needs to edit. (it should correspond to a passage in the input text)
    - "preceding": a few words to uniquely determine the entry in the original text (it should correspond to a passage in the input text)
    - "description": a desciption / reason for why the user should edit the entry.
    - "category": the category of the change to be made.

    Here is the input text:
    ${input_text}
    `;

    console.log('prompt', prompt);

    try {
        const response = await client.responses.create({
            model: "o4-mini",
            reasoning: { effort: "medium" },
            instructions: "You are an expert in writing and analyzing texts.",
            input: prompt
        });

        const output_text = response.output_text;//extractContent(response.output_text);

        console.log("Model output:", output_text);
        fs.writeFileSync(output_filename, output_text);
    } catch (err) {
        console.error("Error with o4-mini high reasoning:", err);
    }
}

export { create_client, generate_struct, generate_errors };
