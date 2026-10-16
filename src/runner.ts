import { expect, type Page } from '@playwright/test';
import { checkout } from './fingerprints';
import { HealingLocator } from './healing';
import type { TestCase } from './schema';

export async function runCase(page: Page, healer: HealingLocator, tc: TestCase) {
  for (const s of tc.steps) {
    const el = await healer.find(checkout[s.target]);
    if (s.action === 'fill') await el.fill(s.value);
    else if (s.action === 'click') await el.click();
    else await expect(el).toHaveText(s.value);
  }
}
