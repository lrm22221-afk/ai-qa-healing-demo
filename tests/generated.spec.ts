import { readFileSync } from 'node:fs';
import { test } from '@playwright/test';
import { HealingLocator } from '../src/healing';
import { OfflineProvider, parseCriteria } from '../src/providers';
import { runCase } from '../src/runner';
import { validateCases } from '../src/schema';

const story = readFileSync('stories/checkout.story.md', 'utf8');
const { ok } = validateCases(await new OfflineProvider().generate(story, parseCriteria(story)));

for (const version of ['v1', 'v2']) {
  test.describe(`generated cases on ${version}`, () => {
    for (const tc of ok) {
      test(`${tc.id}: ${tc.title}`, async ({ page }) => {
        await page.goto(`/${version}.html`);
        const healer = new HealingLocator(page);
        await runCase(page, healer, tc);
        test.info().annotations.push({ type: 'heals', description: String(healer.events.length) });
      });
    }
  });
}
