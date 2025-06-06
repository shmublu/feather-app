import { test, describe, before } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs/promises';
import path from 'node:path';
import { buildWikiStructure, fillWiki, proposeTextEditsForWikiChange, checkCompleteness } from './wikiAPI';
import type { Wiki, FictionWiki, NonFictionWiki, EditSuggestion, FictionCharacter, ThemeOrArgument, Evidence } from './types';

const deepCopy = (obj: any) => JSON.parse(JSON.stringify(obj));

/**
 * A validation function to check if an object is a valid WikiValue.
 */
function isValidWikiValue(obj: any, valueType: 'string' | 'object' | 'string[]') {
    assert.ok(typeof obj === 'object' && obj !== null, 'The property itself must be an object.');
    assert.ok(obj.hasOwnProperty('value'), 'Object must have a "value" key.');
    assert.ok(Array.isArray(obj.sources), 'Object must have a "sources" key that is an array.');
    if (valueType === 'string[]') {
        assert.ok(Array.isArray(obj.value), 'Value should be an array of strings.');
    } else {
        assert.strictEqual(typeof obj.value, valueType, `Value should be of type ${valueType}.`);
    }
}

describe('Advanced Wiki Builder E2E Tests', () => {
    let fictionText: string;
    let nonfictionText: string;
    let nonfictionTextPart2: string;
    
    let filledFictionWiki: FictionWiki;
    let filledNonFictionWiki: NonFictionWiki;

    before(async () => {
        fictionText = await fs.readFile(path.join(__dirname, 'sample-data', 'fiction-text.md'), 'utf-8');
        nonfictionText = await fs.readFile(path.join(__dirname, 'sample-data', 'nonfiction-text.md'), 'utf-8');
        nonfictionTextPart2 = `The Francis Field Trial was a monumental undertaking, involving over 1.8 million children. Its success was a major public health victory. The trial's data confirmed the vaccine's efficacy, paving the way for widespread immunization campaigns that would eventually slash polio rates worldwide. This effort showcased the power of large-scale clinical trials.`;
        
        // Pre-fill wikis for dependent tests
        const fictionStructure = await buildWikiStructure("Build a wiki for a fantasy story narrative.", fictionText);
        filledFictionWiki = await fillWiki(fictionStructure, fictionText) as FictionWiki;
        const nonfictionStructure = await buildWikiStructure("Build an analytical outline for a medical history article.", nonfictionText);
        filledNonFictionWiki = await fillWiki(nonfictionStructure, nonfictionText) as NonFictionWiki;
    });

    describe('Core Functionality & Schema Adherence', () => {
        test('buildWikiStructure: should generate a valid, empty schema', async () => {
            const structure = await buildWikiStructure("Build a schema for a fantasy story.", fictionText) as Partial<FictionWiki>;
            assert.ok(structure.characters && structure.characters[0].id === 'char-', 'Schema must have characters with "char-" id prefix.');
        });

        test('fillWiki: should populate a schema with structurally valid data', () => {
            assert.ok(filledFictionWiki.characters?.length > 0, 'Test Failed: Should extract at least one character.');
            const firstChar = filledFictionWiki.characters[0];
            assert.ok(firstChar.id.startsWith('char-'), 'Test Failed: Character id must start with "char-".');
            isValidWikiValue(firstChar.name, 'string');
        });
    });
    
    describe('Qualitative Content Sanity Checks', () => {
        test('Fiction: should extract specific, logical relationships', () => {
            const elaraAndKael = filledFictionWiki.relationships.find(r => 
                r.character_ids.includes('char-elara') && r.character_ids.includes('char-kael')
            );
            assert.ok(elaraAndKael, "A relationship between Elara and Kael must be identified.");
        });

        test('Non-Fiction: should link arguments to their evidence correctly', () => {
            const mainArgument = filledNonFictionWiki.themes_and_arguments.find(arg => arg.id === 'arg-polio-vaccine-development');
            assert.ok(mainArgument, 'The main argument about vaccine development must be present.');
            
            const hasSalkEvidence = mainArgument.supporting_evidence_ids.includes('ev-salk-vaccine');
            assert.ok(hasSalkEvidence, "The main argument must be supported by the 'ev-salk-vaccine' evidence ID.");
        });
    });

    describe('Intermediate, Complex, & Edge Case Workflows', () => {
        test('Intermediate Update: should add new information to an existing wiki', async () => {
            const originalEvidenceCount = filledNonFictionWiki.evidence_pool.length;
            const updatedWiki = await fillWiki(filledNonFictionWiki, nonfictionTextPart2) as NonFictionWiki;
            
            assert.ok(updatedWiki.evidence_pool.length > originalEvidenceCount, "Test Failed: New evidence should be added.");
            const trialEvidence = updatedWiki.evidence_pool.find(ev => ev.id === 'ev-francis-field-trial');
            assert.ok(trialEvidence?.statement.sources.some(s => s > 0), "Test Failed: The trial evidence should be linked to the new text.");
        });

        test('Complex Edit: should identify all sentences related to a removed character', async () => {
            const originalWiki = deepCopy(filledNonFictionWiki);
            let updatedWiki = deepCopy(filledNonFictionWiki);
            updatedWiki.key_entities = updatedWiki.key_entities.filter(p => !p.id.includes('salk'));
            updatedWiki.evidence_pool = updatedWiki.evidence_pool.filter(ev => !ev.id.includes('salk'));
            
            const edits = await proposeTextEditsForWikiChange(originalWiki, updatedWiki, nonfictionText);
            console.log('\n--- Edit Suggestions After Removing Dr. Salk ---');
            console.log(JSON.stringify(edits, null, 2));
            
            assert.ok(edits.length >= 2, 'Should find at least two sentences to edit after removing Dr. Salk.');
        });

        test('Edge Case: should return zero edits for an irrelevant change', async () => {
            const originalWiki = deepCopy(filledFictionWiki);
            const updatedWiki = deepCopy(originalWiki);
            (updatedWiki as any).metadata = { lastUpdated: "2025-01-01" };
            
            const edits = await proposeTextEditsForWikiChange(originalWiki, updatedWiki, fictionText);
            assert.strictEqual(edits.length, 0, "Should return an empty array for an irrelevant change.");
        });
    });

    describe('Self-Correction "Critic" Agent', () => {
        test('checkCompleteness: should identify that a job is complete when it is', async () => {
            // We use the already filled wiki which should be fairly complete.
            const critique = await checkCompleteness(filledFictionWiki, fictionText);
            console.log('\n--- Critique of a Complete Job ---');
            console.log(JSON.stringify(critique, null, 2));

            assert.strictEqual(critique.is_complete, true, "The critic should find the job to be complete.");
        });

        test('checkCompleteness: should identify that a job is incomplete', async () => {
            // Create a deliberately incomplete wiki
            const incompleteWiki = {
                characters: filledFictionWiki.characters.slice(0, 1) // Only include Elara
            };
            const critique = await checkCompleteness(incompleteWiki, fictionText);
            console.log('\n--- Critique of an Incomplete Job ---');
            console.log(JSON.stringify(critique, null, 2));

            assert.strictEqual(critique.is_complete, false, "The critic should find the job to be incomplete.");
            assert.ok(critique.missing_information.toLowerCase().includes('kael'), 'The critic should mention that Kael is missing.');
        });
    });
});