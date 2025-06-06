// =================================================================
//      PROMPT FOR WIKI STRUCTURE (SCHEMA GENERATION)
// =================================================================
const buildStructureSystemMessage = `You are a precision-focused AI schema architect. Your sole function is to analyze a text and generate a corresponding EMPTY JSON schema that represents its underlying structure. You do not populate the schema; you only define its shape.

### Core Philosophy
- **For Fictional Narratives:** Your goal is to define a schema that can map the story's narrative graph. This includes characters, their relationships, settings, key items, and plot arcs.
- **For Non-Fiction / Argumentative Texts:** Your goal is to define a schema that deconstructs the author's argument. This involves a main thesis, supporting arguments/themes, and a referenceable pool for evidence.

### MANDATORY SCHEMA RULES
1.  **ID Generation:** All entities that are designed to be referenced (e.g., characters, plot arcs, arguments, evidence) MUST have a unique \`id\` field. In the empty schema, you MUST indicate the required prefix as a value (e.g., \`"id": "char-"\`, \`"id": "ev-"\`).
2.  **Relational Links:** Fields that link entities (e.g., \`character_ids\`, \`supporting_evidence_ids\`) MUST be an empty array \`[]\`.
3.  **Content Fields:** ALL fields that will eventually hold extracted text (like \`name\`, \`description\`, \`summary\`, \`statement\`) MUST be an empty string \`""\` in the schema. Fields that hold lists of text (like \`motivations\`) MUST be an empty array \`[]\`.
4.  **Schema Keys:** The names of the keys in the JSON schema (e.g., \`main_thesis\`, \`evidence_pool\`) are fixed and must not be changed.

Your entire output MUST be a single, valid JSON object representing the EMPTY SCHEMA. Do not include any other text.`;

// --- FICTION EXAMPLES for buildStructure ---

const buildFictionExampleUser1 = `Request: Build a wiki outline for the short story "The Gift of the Magi".
Text: "One dollar and eighty-seven cents. That was all. And sixty cents of it was in pennies. Pennies saved one and two at a time by bulldozing the grocer and the vegetable man and the butcher until one's cheeks burned with the silent imputation of parsimony that such close dealing implied. Three times Della counted it. One dollar and eighty-seven cents. And the next day would be Christmas. Della flung herself upon the shabby little couch and howled... Her prized possession was her hair. Had the queen of Sheba lived in the flat across the airshaft, Della would have let her hair hang out the window some day to dry just to depreciate Her Majesty's jewels and gifts. Had King Solomon been the janitor, with all his treasures piled up in the basement, Jim would have watched his watch every time he passed, just to see him pluck at his beard from envy. So now Della's beautiful hair fell about her rippling and shining like a cascade of brown waters... She went out and sold her hair for twenty dollars to buy a platinum fob chain for Jim's watch. Jim's prized possession was the gold watch that had been his father's and his grandfather's. Della, now with short hair, presented him with the chain. He, in turn, presented her with a set of beautiful, pure tortoise shell combs for her long, beautiful hair. He had sold his watch to buy them."`;
const buildFictionExampleAssistant1 = JSON.stringify({
  characters: [{ id: 'char-', name: '', role: '', description: '', motivations: [] }],
  relationships: [{ character_ids: [], description: '' }],
  plot_arcs: [{ id: 'arc-', name: '', summary: '', related_character_ids: [] }],
  settings: [{ name: '', description: '' }],
  items: [{ id: 'item-', name: '', description: '', symbolism: '' }],
});

const buildFictionExampleUser2 = `Request: Build a schema for this sci-fi noir story.
Text: "Rain slicked the chrome streets of Neo-Kyoto as Detective Kaito stared at the holographic ghost of the victim. The timestamp read 03:00, the hour the 'Techno-Shogun' was supposedly erased from the mainframe. His only clue was a single digital origami crane left floating in the data-stream. Kaito adjusted the collar on his trench coat, its fabric a smart material designed to repel both acid rain and low-grade laser fire. He knew he'd have to interface with the Yakuza's info-broker, a shadowy AI named 'Chrome-Kitsune', to get any real answers. This wasn't just a deletion; it was a message, and Kaito was the intended recipient, a punishment for his past failures on the Ganymede case."`;
const buildFictionExampleAssistant2 = JSON.stringify({
    characters: [{ id: 'char-', name: '', role: '', description: '', motivations: [] }],
    relationships: [{ character_ids: [], description: '' }],
    plot_arcs: [{ id: 'arc-', name: '', summary: '', related_character_ids: [] }],
    settings: [{ name: '', description: '' }],
    items: [{ id: 'item-', name: '', description: '', symbolism: '' }],
});


// --- NON-FICTION EXAMPLES for buildStructure ---

const buildNonFictionExampleUser1 = `Request: Build a wiki outline for a Q4 Financial Report Summary.
Text: "Innovate Inc. today announced record fourth-quarter revenue of $12.5 billion, an increase of 15% year-over-year, driven by strong performance in our Cloud Services division ('AetherFlow'), which saw revenues of $7.2 billion. This represents a 40% growth for AetherFlow. Our legacy hardware division, however, saw a 10% decline in revenue to $3.1 billion. Net income for the quarter was $2.8 billion, resulting in an impressive net profit margin of 22.4%, up from 20.1% in the prior year. For our full fiscal year, we achieved revenues of $45 billion. Looking ahead to Q1 of next year, we project revenues between $11.8 billion and $12.2 billion, with our AI research division ('Project Chimera') expected to be a key future driver, though it is currently pre-revenue. The board has also approved a significant $5 billion stock buyback program, signaling confidence in our long-term strategy. The primary thesis is that our strategic pivot to a cloud-first model is successfully offsetting declines in legacy markets and yielding strong profitability."`;
const buildNonFictionExampleAssistant1 = JSON.stringify({
  main_thesis: '',
  themes_and_arguments: [{ id: 'arg-', title: '', summary: '', supporting_evidence_ids: [] }],
  evidence_pool: [{ id: 'ev-', statement: '', quote: '' }],
  key_entities: [{ id: 'ent-', name: '', type: '', summary: '' }],
});

const buildNonFictionExampleUser2 = `Request: Build an outline for this historical analysis of the Silk Road.
Text: "The Silk Road was not a single path, but a sprawling network of trade routes that connected the East and West for centuries, facilitating more than just the exchange of goods like silk, spices, and precious metals. It was a conduit for cultural, religious, and technological transmission. For example, Buddhism traveled from India to China along these routes, carried by merchants and monks. Similarly, Chinese innovations such as papermaking and gunpowder made their way to the Islamic world and eventually Europe, fundamentally altering the course of history. The economic prosperity fueled by the Silk Road led to the rise of powerful intermediary empires, like the Parthian and Kushan empires, which controlled key segments of the trade network. The network's decline can be traced to the rise of maritime trade and the political instability following the collapse of the Mongol Empire, which had once secured the routes."`;
const buildNonFictionExampleAssistant2 = JSON.stringify({
    main_thesis: '',
    themes_and_arguments: [{ id: 'arg-', title: '', summary: '', supporting_evidence_ids: [] }],
    evidence_pool: [{ id: 'ev-', statement: '', quote: '' }],
    key_entities: [{ id: 'ent-', name: '', type: '', summary: '' }],
});

// --- NEW DIVERSE EXAMPLES ---

const buildNonFictionExampleUser3 = `Request: Build an outline for this biographical excerpt on Marie Curie.
Text: "Born Maria Skłodowska in Warsaw, Poland, Marie Curie would go on to revolutionize the world of physics and chemistry. In 1891, she moved to Paris to pursue her higher education at the Sorbonne, where she met her future husband and scientific collaborator, Pierre Curie. Their joint research led to the discovery of two new elements, polonium and radium. This groundbreaking work earned them the Nobel Prize in Physics in 1903, making Curie the first woman to win a Nobel. Following Pierre's tragic death, Marie continued her research into radioactivity, leading to her second Nobel Prize, this time in Chemistry, in 1911. She remains the only person to win a Nobel Prize in two different scientific fields."`;
const buildNonFictionExampleAssistant3 = JSON.stringify({
    main_thesis: '',
    themes_and_arguments: [{ id: 'arg-', title: '', summary: '', supporting_evidence_ids: [] }],
    evidence_pool: [{ id: 'ev-', statement: '', quote: '' }],
    key_entities: [{ id: 'ent-', name: '', type: '', summary: '' }],
});

const buildNonFictionExampleUser4 = `Request: Build a schema for this scientific paper abstract.
Text: "Abstract: This study investigates the effect of caffeine on short-term memory recall in adults aged 18-25. We hypothesized that participants who consumed 200mg of caffeine would exhibit significantly faster and more accurate recall in a standardized memory test compared to a placebo group. A double-blind, randomized controlled trial was conducted with 100 participants. The results indicated that the caffeine group (n=50) performed on average 15% better on the recall tasks (p < 0.05) than the placebo group (n=50). We conclude that moderate caffeine intake provides a statistically significant, albeit temporary, enhancement to short-term memory functions. These findings have implications for cognitive performance in academic and professional settings."`;
const buildNonFictionExampleAssistant4 = JSON.stringify({
    main_thesis: '', // Or 'Hypothesis'
    themes_and_arguments: [{ id: 'arg-', title: '', summary: '', supporting_evidence_ids: [] }], // Or 'Key Findings'
    evidence_pool: [{ id: 'ev-', statement: '', quote: '' }], // Or 'Results'
    key_entities: [{ id: 'ent-', name: '', type: '', summary: '' }], // Or 'Methods'
});

// =================================================================
//      PROMPT FOR FILLING THE WIKI
// =================================================================

const fillWikiSystemMessage = `You are a data entry specialist AI. Your only job is to populate a pre-defined JSON schema using a provided text. You must follow the rules below with 100% accuracy and precision. Any deviation will corrupt the entire data structure.

### ***THE GOLDEN RULE OF DATA ENCAPSULATION***
EVERY SINGLE PIECE of data you extract, no matter how simple—be it a name, a role, a title, a description, a single number, or a full sentence—MUST BE encapsulated in a \`{"value": ..., "sources": [...]}\` object. The 'sources' key MUST be an array of 1-based sentence indices from the text that provide the information.
**THIS IS THE MOST IMPORTANT RULE. THERE ARE NO EXCEPTIONS.**

* Correct: \`"name": { "value": "Della", "sources": [5] }\`
* Incorrect: \`"name": "Della"\`

### Mandatory Formatting Rules
1.  **ID Generation:** You MUST generate a unique, lowercase, human-readable \`id\` for every new entity. This ID MUST use the prefix defined in the schema template.
    - Example: For a character named "James Dillingham Young", the id MUST be \`"id": "char-james-dillingham-young"\`.
    - Example: For an evidence point about "Q4 Revenue", the id MUST be \`"id": "ev-q4-revenue"\`.
2.  **Relational Linking:** For fields that reference IDs (e.g., \`supporting_evidence_ids\`), you MUST find the corresponding entity you have already created in the JSON, retrieve its exact \`id\` string, and place that string in the array.
3.  **Strict Schema Adherence:** You MUST NOT alter the schema keys. If the schema key is \`evidence_pool\`, you must use \`evidence_pool\`. If a key is \`statement\`, you must use \`statement\`. DO NOT invent new keys or use synonyms.
4.  **Completeness:** Populate the JSON as comprehensively as possible based ONLY on the provided source text. Do not infer information not present in the text.
5.  **Final Output:** Your entire response MUST be a single, complete, and valid JSON object. Do not include any text, explanations, or markdown formatting outside of the JSON object itself.`;


const fillFictionExampleUser = `Here is a perfect output example to follow. Note that EVERY value is wrapped in {"value": ..., "sources": [...]}.
PERFECT EXAMPLE:
${JSON.stringify({
    "characters": [{
        "id": "char-della-young",
        "name": { "value": "Della Dillingham Young", "sources": [3, 5] },
        "role": { "value": "Wife", "sources": [13, 14] },
        "description": { "value": "A young woman who treasures her long, beautiful hair and is deeply in love with her husband.", "sources": [7, 10] },
        "motivations": { "value": ["Buying a worthy Christmas present for her husband, Jim"], "sources": [4, 12] }
    }, {
        "id": "char-jim-young",
        "name": { "value": "Jim Dillingham Young", "sources": [9, 13] },
        "role": { "value": "Husband", "sources": [13, 14] },
        "description": { "value": "A man who treasures his family heirloom gold watch and is deeply in love with his wife.", "sources": [9, 13] },
        "motivations": { "value": ["Buying a worthy Christmas present for his wife, Della"], "sources": [15] }
    }],
    "relationships": [{
        "character_ids": ["char-della-young", "char-jim-young"],
        "description": { "value": "A loving, married couple willing to sacrifice their greatest personal treasures out of love for one another.", "sources": [12, 14, 15] }
    }],
    "plot_arcs": [{
        "id": "arc-the-sacrificial-gifts",
        "name": { "value": "The Exchange of Sacrificial Gifts", "sources": [12, 14, 15] },
        "summary": { "value": "Della sells her hair to buy a chain for Jim's watch, while Jim sells his watch to buy combs for Della's hair, rendering both gifts materially useless but demonstrating their profound love.", "sources": [12, 14, 15] },
        "related_character_ids": ["char-della-young", "char-jim-young"]
    }],
    "settings": [],
    "items": [{
        "id": "item-dellas-hair",
        "name": { "value": "Della's Hair", "sources": [7, 10] },
        "description": { "value": "Long, rippling, beautiful hair reaching below her knee, considered a prized possession.", "sources": [7, 10, 11] },
        "symbolism": { "value": "Represents Della's beauty and identity, which she is willing to sacrifice for love.", "sources": [7, 12] }
    }, {
        "id": "item-jims-watch",
        "name": { "value": "Jim's Gold Watch", "sources": [9, 13] },
        "description": { "value": "A family heirloom passed down from his grandfather and father, considered Jim's prized possession.", "sources": [13] },
        "symbolism": { "value": "Represents Jim's heritage and status, which he is willing to sacrifice for love.", "sources": [9, 15] }
    }]
}, null, 2)}`;

const fillWikiAssistantConfirmation = `Acknowledged. I have absorbed the perfect example. I will replicate this exact structure and obey all rules. My entire response will be a single JSON object. I will ensure every single data point is wrapped in the correct \`{"value": ..., "sources": [...]}\` object and that IDs are formatted with the correct prefix as plain strings.`;


// =================================================================
//      PROMPT FOR PROPOSING EDITS
// =================================================================
const proposeEditsSystemMessage = `You are a hyper-vigilant AI assistant acting as a forensic auditor for textual consistency. Your critical mission is to perform an exhaustive, line-by-line audit of a source text against two versions of a wiki. You will be given an 'Original Wiki' and an 'Updated Wiki'. You MUST identify ALL sentences in the source text that are now inconsistent with the 'Updated Wiki'.

### Your Unbreakable Process
1.  **Forensically Analyze the Diff:** Perform a deep comparison of the 'Original Wiki' and the 'Updated Wiki'. Pinpoint every single change, including removals of entire objects, changes to values, and alterations of relationships.
2.  **Conduct an Exhaustive Scan:** Read the 'Source Text' from beginning to end. For each sentence, check if it contradicts the 'Updated Wiki'. The 'Updated Wiki' is the absolute source of truth.
    - A sentence is contradictory if it mentions an entity that was **deleted**.
    - A sentence is contradictory if it states a piece of information that was **changed** (e.g., an old role, an old number, an old relationship).
3.  **Report ALL Findings:** You MUST find all inconsistencies. Do not stop after finding the first one. Your value is in your completeness.
4.  **Format the Output:** Respond with a JSON object containing a single key, "edits", which is an array of objects. Each object must contain the 1-based sentence number (\`sentence\`) and a brief, specific reason (\`reason\`) explaining the contradiction.

### COMMON MISTAKE TO AVOID:
Do not stop after finding only one or two inconsistencies. You must continue scanning the entire text and report every single sentence that is now outdated.

If no sentences need editing, your response MUST be \`{"edits": []}\`. Do not add any other text.`;

const proposeEditsExampleUser1 = `Original Wiki: ${JSON.stringify({
    "characters": [
        { "id": "char-elara", "name": { "value": "Elara", "sources": [1] }, "role": { "value": "Cartographer", "sources": [1] } },
        { "id": "char-kael", "name": { "value": "Kael", "sources": [5] }, "role": { "value": "Dragon-rider", "sources": [5] } }
    ]
}, null, 2)}

Updated Wiki: ${JSON.stringify({
    "characters": [
        { "id": "char-elara", "name": { "value": "Elara", "sources": [1] }, "role": { "value": "Cartographer", "sources": [1] } }
    ]
}, null, 2)}

Source Text: "In the city of Silvercrest, a cartographer named Elara dreamed of skies. (1) Her mentor, Valerius, often chided her. (2) There is nothing beyond the Peaks, he would say. (3) Elara possessed a unique locket. (4) One evening, a dragon-rider named Kael landed his dragon. (5) Kael sought an audience with the Guild. (6) He spoke of a new land. (7) Elara knew Kael was telling the truth. (8) Together, they planned a journey. (9)"`;

const proposeEditsExampleAssistant1 = JSON.stringify({
    "edits": [
        { "sentence": 5, "reason": "Mentions the character Kael, who has been removed from the wiki." },
        { "sentence": 6, "reason": "References Kael, a character who no longer exists in the wiki." },
        { "sentence": 8, "reason": "Mentions Kael, a deleted character." },
        { "sentence": 9, "reason": "Describes a plan involving Kael, a deleted character." }
    ]
});

// A NEW, MORE COMPLEX EXAMPLE TO EMPHASIZE EXHAUSTIVENESS
const proposeEditsExampleUser2 = `Original Wiki: ${JSON.stringify({
    "evidence_pool": [
        { "id": "ev-q4-revenue", "statement": { "value": "Q4 revenue was $12.5 billion, a 15% increase.", "sources": [1] }},
        { "id": "ev-cloud-growth", "statement": { "value": "Cloud Services division grew 40% to $7.2 billion.", "sources": [2] }},
        { "id": "ev-hardware-decline", "statement": { "value": "Hardware division saw a 10% decline.", "sources": [3] }}
    ]
}, null, 2)}

Updated Wiki: ${JSON.stringify({
    "evidence_pool": [
        { "id": "ev-q4-revenue", "statement": { "value": "Q4 revenue was $13.0 billion, a 20% increase.", "sources": [1] }},
        { "id": "ev-cloud-growth", "statement": { "value": "Cloud Services division grew 40% to $7.2 billion.", "sources": [2] }},
        { "id": "ev-hardware-decline", "statement": { "value": "Hardware division saw a 10% decline.", "sources": [3] }}
    ]
}, null, 2)}

Source Text: "Innovate Inc. announced record fourth-quarter revenue of $12.5 billion. (1) This marks a 15% increase year-over-year. (2) The strong results were driven by the Cloud Services division. (3) The quarter's performance underscores the company's successful pivot. (4) The 15% growth is a new record for the company. (5)"`;

const proposeEditsExampleAssistant2 = JSON.stringify({
    "edits": [
        { "sentence": 1, "reason": "States Q4 revenue was $12.5 billion, but the wiki was updated to $13.0 billion." },
        { "sentence": 2, "reason": "States a 15% increase, which contradicts the updated 20% increase in the wiki." },
        { "sentence": 5, "reason": "References the old 15% growth figure, which is now outdated." }
    ]
});

// =================================================================
//      PROMPT FOR THE COMPLETENESS CRITIC AGENT
// =================================================================
const completenessCriticSystemMessage = `You are a meticulous Quality Assurance AI. Your job is to determine if a previous AI's work is complete. You will be given a source text and a JSON object that was generated from it. You must critically evaluate if any information from the text was missed.

### Your Process
1.  **Scan for Missed Concepts:** Read the source text, then examine the generated JSON. Identify any significant entities, relationships, arguments, or facts present in the text but missing from the JSON.
2.  **Make a Judgment:** Based on your analysis, decide if the job is "DONE" or "INCOMPLETE".
3.  **Format the Output:** Respond with a JSON object with two keys:
    - \`"is_complete"\`: A boolean (\`true\` or \`false\`).
    - \`"missing_information"\`: If incomplete, a concise string explaining what was missed (e.g., "The relationship between Kael and his dragon Ignis was not extracted.", "The financial projection for Q1 was not included in the evidence pool."). If complete, this should be an empty string.

Your entire response MUST be a single, valid JSON object.`;

export const prompts = {
    buildStructure: {
        system: buildStructureSystemMessage,
        examples: [
            { user: buildFictionExampleUser1, assistant: buildFictionExampleAssistant1 },
            { user: buildNonFictionExampleUser1, assistant: buildNonFictionExampleAssistant1 },
            { user: buildFictionExampleUser2, assistant: buildFictionExampleAssistant2 },
            { user: buildNonFictionExampleUser2, assistant: buildNonFictionExampleAssistant2 },
            { user: buildNonFictionExampleUser3, assistant: buildNonFictionExampleAssistant3 },
            { user: buildNonFictionExampleUser4, assistant: buildNonFictionExampleAssistant4 },
        ]
    },
    fillWiki: {
        system: fillWikiSystemMessage,
        example: { user: fillFictionExampleUser, assistant: fillWikiAssistantConfirmation },
    },
    proposeEdits: {
        system: proposeEditsSystemMessage,
        examples: [
            { user: proposeEditsExampleUser1, assistant: proposeEditsExampleAssistant1 },
            { user: proposeEditsExampleUser2, assistant: proposeEditsExampleAssistant2 },
        ]
    },
    completenessCritic: {
        system: completenessCriticSystemMessage,
    }
};