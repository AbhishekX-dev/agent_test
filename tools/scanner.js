import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

export async function scanPage(url) {
  console.log('\x1b[36m[Observe]\x1b[0m Launching browser...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log(`\x1b[36m[Observe]\x1b[0m Navigating to ${url}`);
  await page.goto(url, { timeout: 30000, waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  console.log('\x1b[36m[Observe]\x1b[0m Injecting axe-core accessibility scanner...');

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();

  await browser.close();

  const violations = results.violations.map(v => ({
    id: v.id,
    description: v.description,
    impact: v.impact,
    wcagCriteria: v.tags.filter(t => t.startsWith('wcag')).join(', '),
    affectedNodes: v.nodes.slice(0, 3).map(n => ({
      element: n.html.substring(0, 200),
      failureSummary: n.failureSummary,
      target: n.target[0]
    })),
    nodeCount: v.nodes.length
  }));

  console.log(
    `\x1b[36m[Observe]\x1b[0m Found ${violations.length} WCAG violations across ${results.passes.length} passing rules`
  );

  return violations;
}
