// index.js
const { OpenAI } = require("openai");
const fs = require('fs');

async function generate_struct(client, input_text) {
    const prompt = `
    You will be given an input text. Your goal is to structure the text into:
    - important actors
    - important events
    - important locations
    
    The 3 categories can refer to abstract objects.
    
    Please output your answer as a JSON list of dictionaries, each with the following fields:
    - "preceding": a few words preceding the entry to guarnatee uniqueness
    - "text": the text corresponding to the entry
    - "description": the contents of the entry
    - "category": the category of the entry.
    
    Here is the input text:
    ${input_text}
    `
    try {
      const response = await client.responses.create({
        model: "o4-mini",                           // Use the base o4-mini model
        reasoning: { effort: "low" },              // Dial up to high-effort reasoning
        instructions: "You are an expert in writing and analyzing texts.",
        input: prompt
      });
  
      // The final answer text is in `response.output_text`
      console.log("Model output:", response.output_text);
      // save to struct.json
      fs.writeFileSync('struct.json', response.output_text);
    } catch (err) {
      console.error("Error with o4-mini high reasoning:", err);
    }
  }

async function generate_errors(client, input_text, struct1, struct2) {
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
    
    Here is the original text structure:
    ${JSON.stringify(struct1)}
    
    We want to change it to the following structure (only the differences):
    ${JSON.stringify(diff2)}
    
    Here is the input text:
    ${input_text}
    `

    try {
      const response = await client.responses.create({
        model: "o4-mini",                           // Use the base o4-mini model
        reasoning: { effort: "low" },              // Dial up to high-effort reasoning
        instructions: "You are an expert in writing and analyzing texts.",
        input: prompt
      });
  
      // The final answer text is in `response.output_text`
      console.log("Model output:", response.output_text);
      fs.writeFileSync('output.json', response.output_text);
    } catch (err) {
      console.error("Error with o4-mini high reasoning:", err);
    }
  }

  
// Instantiate the client; it will automatically read process.env.OPENAI_API_KEY
const client = new OpenAI({apiKey:apiKey});


// read from veld.txt
const input_text = fs.readFileSync('veldt.txt', 'utf8');

generate_struct(client, input_text);

const struct1 = JSON.parse(fs.readFileSync('struct.json', 'utf8'));
const struct2 = JSON.parse(fs.readFileSync('struct2.json', 'utf8'));

generate_errors(client, input_text, struct1, struct2);
