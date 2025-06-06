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
    - Characters: important actors
    - Timeline: important events
    - Locations: important locations
    
    The 3 categories can refer to abstract objects.
    
    Please output your answer as a JSON list of dictionaries, each with the following fields:
    - "preceding": a few words preceding the entry to guarnatee uniqueness
    - "text": the text corresponding to the entry
    - "description": the contents of the entry
    - "category": the category of the entry. Should be one of the following: Characters, Timeline, Locations.
    
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

        console.log("Model output:", response.output_text);
        fs.writeFileSync(output_filename, response.output_text);
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
    const diff1 = struct1.filter(item => !struct2.some(item2 => item2.text === item.text));
    const diff2 = struct2.filter(item => !struct1.some(item2 => item2.text === item.text));
    
    console.log(diff1);
    console.log(diff2);

    const prompt = `
    You will be given an input text and its structure. Your goal is to edit the text to follow a new structure. 
    Output a JSON list of dictionaries, each with the following fields:
    - "preceding": a short sample preceding "text" (it should match exactly with the input text)
    - "text": the text in the input text that requires change
    - "description": a short description of the change to be made.
    - "category": the category of the change to be made.
    
    Make sure to output all the inconsistencies that result from the change. They may be semantic, grammatical, ... .
    Each "text" should be unique.
    
    Here is the original text structure:
    ${JSON.stringify(struct1)}
    
    We want to change it to the following structure (only the differences):
    ${JSON.stringify(diff2)}
    
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

        console.log("Model output:", response.output_text);
        fs.writeFileSync(output_filename, response.output_text);
    } catch (err) {
        console.error("Error with o4-mini high reasoning:", err);
    }
}

export { create_client, generate_struct, generate_errors };
