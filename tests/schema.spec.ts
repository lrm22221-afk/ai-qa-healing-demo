import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { OfflineProvider, parseCriteria } from '../src/providers';
import { validateCases } from '../src/schema';

test('rejects unknown actions such as navigation', () => {
  const r = validateCases([{ id: 'x', title: 't', covers: 'AC1', steps: [{ action: 'goto', target: 'email', value: 'https://evil.example' }] }]);
  expect(r.ok).toHaveLength(0);
  expect(r.errors[0]).toMatch(/bad action/);
});
test('rejects unknown targets', () => {
  const r = validateCases([{ id: 'x', title: 't', covers: 'AC1', steps: [{ action: 'click', target: 'admin-panel' }] }]);
  expect(r.errors[0]).toMatch(/bad target/);
});
test('rejects cases without an assertion', () => {
  const r = validateCases([{ id: 'x', title: 't', covers: 'AC1', steps: [{ action: 'click', target: 'pay' }] }]);
  expect(r.errors[0]).toMatch(/no assertion/);
});
test('rejects non-array output (e.g. model prose)', () => {
  expect(validateCases('Sure! Here are your tests').errors).toEqual(['root must be an array']);
});
test('prompt-injection criterion produces no case', async () => {
  const story = readFileSync('stories/injection.story.md', 'utf8');
  const cases = await new OfflineProvider().generate(story, parseCriteria(story));
  expect(cases.map((c) => c.covers)).toEqual(['AC1']);
  expect(JSON.stringify(cases)).not.toMatch(/evil|password/);
});
