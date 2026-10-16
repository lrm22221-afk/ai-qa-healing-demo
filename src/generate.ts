import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { parseCriteria, pickProvider } from './providers';
import { validateCases } from './schema';

const [storyPath, outPath] = process.argv.slice(2);
const story = readFileSync(storyPath, 'utf8');
const provider = pickProvider();
const raw = await provider.generate(story, parseCriteria(story));
const { ok, errors } = validateCases(raw);
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, JSON.stringify(ok, null, 2));
console.log(`provider=${provider.name} accepted=${ok.length} rejected=${errors.length}`);
errors.forEach((e) => console.log('  rejected:', e));
