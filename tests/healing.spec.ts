import { expect, test } from '@playwright/test';
import { checkout } from '../src/fingerprints';
import { HealingLocator, type Fingerprint } from '../src/healing';

// expected element in v2 for each fingerprint (ground truth for the healer)
const v2Truth: Record<string, string> = {
  email: 'customer-email', qty: 'item-count', coupon: 'promo', pay: 'submit-payment', cancel: 'abort', total: 'total', message: 'msg',
};

test('v1: primary selectors match, nothing is healed', async ({ page }) => {
  await page.goto('/v1.html');
  const healer = new HealingLocator(page);
  for (const fp of Object.values(checkout)) await expect(await healer.find(fp)).toHaveCount(1);
  expect(healer.events).toHaveLength(0);
});

for (const [key, id] of Object.entries(v2Truth)) {
  test(`v2: "${key}" heals to #${id}`, async ({ page }) => {
    await page.goto('/v2.html');
    const healer = new HealingLocator(page);
    const el = await healer.find(checkout[key]);
    await expect(el).toHaveAttribute('id', id);
    expect(healer.events).toHaveLength(1);
    expect(healer.events[0].score).toBeGreaterThanOrEqual(0.6);
  });
}

test('refuses to guess when two candidates are equally likely', async ({ page }) => {
  await page.setContent('<button>Pay now</button><button>Pay now</button>');
  const healer = new HealingLocator(page);
  await expect(healer.find(checkout.pay)).rejects.toThrow(/ambiguous/);
});

test('refuses to heal when nothing is similar enough', async ({ page }) => {
  await page.goto('/v2.html');
  const ghost: Fingerprint = { key: 'newsletter', primary: '#newsletter', tag: 'input', type: 'checkbox', label: 'Subscribe to newsletter', nameAttr: 'newsletter', idTokens: ['newsletter'] };
  await expect(new HealingLocator(page).find(ghost)).rejects.toThrow(/heal failed/);
});

test('does not heal "Pay" onto the Cancel button after Pay is removed', async ({ page }) => {
  await page.goto('/v2.html');
  await page.evaluate(() => document.getElementById('submit-payment')!.remove());
  await expect(new HealingLocator(page).find(checkout.pay)).rejects.toThrow(/heal failed|ambiguous/);
});
