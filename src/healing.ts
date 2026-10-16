import type { Locator, Page } from '@playwright/test';

export interface Fingerprint {
  key: string;
  primary: string;
  tag: string;
  type?: string;
  label?: string;
  text?: string;
  role?: string;
  nameAttr?: string;
  idTokens?: string[];
}

export interface Candidate { score: number; describe: string; healId: string }
export interface HealEvent { key: string; primary: string; healedTo: string; score: number; runnerUp: number }

export const HEAL_THRESHOLD = 0.6;
export const HEAL_MARGIN = 0.15;

/**
 * Scores every element on the page against a fingerprint, in the browser.
 * Weights: label 0.30, visible text 0.25, name attr 0.20, tag+type/role 0.15, id/class/data-* token overlap 0.10.
 */
export async function scoreCandidates(page: Page, fp: Fingerprint): Promise<Candidate[]> {
  return page.evaluate((fp) => {
    const norm = (s: string | null | undefined) => (s || '').toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
    const tokSim = (a: string, b: string) => {
      const A = new Set(norm(a).split(' ').filter(Boolean));
      const B = new Set(norm(b).split(' ').filter(Boolean));
      if (!A.size || !B.size) return 0;
      let inter = 0;
      A.forEach((t) => { if (B.has(t)) inter++; });
      return inter / Math.max(A.size, B.size);
    };
    const out: { score: number; describe: string; healId: string }[] = [];
    let n = 0;
    // clear ids from earlier scoring runs so a stale id can never match two elements
    document.querySelectorAll('[data-heal-id]').forEach((x) => x.removeAttribute('data-heal-id'));
    const run = Math.random().toString(36).slice(2, 8);
    document.querySelectorAll('body *').forEach((el) => {
      const e = el as HTMLElement;
      if (e.tagName.toLowerCase() !== fp.tag) return;
      let s = 0;
      const id = e.id;
      const labelEl = id ? document.querySelector(`label[for="${CSS.escape(id)}"]`) : null;
      const label = labelEl?.textContent || e.getAttribute('aria-label') || '';
      if (fp.label) s += 0.3 * tokSim(fp.label, label);
      if (fp.text) s += 0.25 * tokSim(fp.text, e.textContent || '');
      if (fp.nameAttr) s += 0.2 * (e.getAttribute('name') === fp.nameAttr ? 1 : 0);
      const typeOk = !fp.type || (e.getAttribute('type') || (fp.tag === 'input' ? 'text' : '')) === fp.type;
      const roleOk = !fp.role || e.getAttribute('role') === fp.role;
      s += 0.15 * ((typeOk ? 0.5 : 0) + (roleOk ? 0.5 : 0));
      const attrs = Array.from(e.attributes).filter((a) => a.name === 'id' || a.name === 'class' || a.name.startsWith('data-')).map((a) => a.value).join(' ').replace(/[-_]/g, ' ');
      if (fp.idTokens?.length) s += 0.1 * tokSim(fp.idTokens.join(' '), attrs);
      // re-normalise so that fingerprints without label/text/name are not penalised
      const max = (fp.label ? 0.3 : 0) + (fp.text ? 0.25 : 0) + (fp.nameAttr ? 0.2 : 0) + 0.15 + (fp.idTokens?.length ? 0.1 : 0);
      const healId = `${run}-${n++}`;
      e.setAttribute('data-heal-id', healId);
      out.push({ score: +(s / max).toFixed(3), describe: e.outerHTML.slice(0, 90), healId });
    });
    return out.sort((a, b) => b.score - a.score);
  }, fp);
}

export class HealingLocator {
  readonly events: HealEvent[] = [];
  constructor(private page: Page) {}

  /** Returns the primary locator if it matches, otherwise the best-scoring candidate. Refuses to guess when unsure. */
  async find(fp: Fingerprint): Promise<Locator> {
    const primary = this.page.locator(fp.primary);
    if ((await primary.count()) === 1) return primary;
    const [best, second] = await scoreCandidates(this.page, fp);
    const runnerUp = second?.score ?? 0;
    if (!best || best.score < HEAL_THRESHOLD) throw new Error(`heal failed for "${fp.key}": best score ${best?.score ?? 0} < ${HEAL_THRESHOLD}`);
    if (best.score - runnerUp < HEAL_MARGIN) throw new Error(`heal ambiguous for "${fp.key}": ${best.score} vs ${runnerUp}`);
    this.events.push({ key: fp.key, primary: fp.primary, healedTo: best.describe, score: best.score, runnerUp });
    return this.page.locator(`[data-heal-id="${best.healId}"]`);
  }
}
