/** Minimal DSL that an LLM is allowed to emit. Anything outside it is rejected, not executed. */
export const TARGETS = ['email', 'qty', 'coupon', 'pay', 'cancel', 'total', 'message'] as const;
export type Target = (typeof TARGETS)[number];
export type Step =
  | { action: 'fill'; target: Target; value: string }
  | { action: 'click'; target: Target }
  | { action: 'expectText'; target: Target; value: string };
export interface TestCase { id: string; covers: string; title: string; steps: Step[] }

export function validateCases(input: unknown): { ok: TestCase[]; errors: string[] } {
  const errors: string[] = [];
  const ok: TestCase[] = [];
  if (!Array.isArray(input)) return { ok, errors: ['root must be an array'] };
  input.forEach((c, i) => {
    const where = `case[${i}]`;
    if (typeof c !== 'object' || c === null) return errors.push(`${where} not an object`);
    const tc = c as Record<string, unknown>;
    if (typeof tc.id !== 'string' || typeof tc.title !== 'string' || typeof tc.covers !== 'string') return errors.push(`${where} missing id/title/covers`);
    if (!Array.isArray(tc.steps) || tc.steps.length === 0) return errors.push(`${where} has no steps`);
    for (const s of tc.steps as Record<string, unknown>[]) {
      if (!['fill', 'click', 'expectText'].includes(s?.action as string)) return errors.push(`${where} bad action ${String(s?.action)}`);
      if (!TARGETS.includes(s.target as Target)) return errors.push(`${where} bad target ${String(s.target)}`);
      if (s.action !== 'click' && typeof s.value !== 'string') return errors.push(`${where} step needs value`);
    }
    if (!(tc.steps as Step[]).some((s) => s.action === 'expectText')) return errors.push(`${where} has no assertion`);
    ok.push(tc as unknown as TestCase);
  });
  return { ok, errors };
}
