import { createRequire } from 'node:module';
import assert from 'node:assert/strict';

// Development-only rendering using the already available browser tooling.
assert(process.env.BUNDLED_NODE_MODULES, 'Set BUNDLED_NODE_MODULES to the installed browser tooling directory.');
const require = createRequire(`${process.env.BUNDLED_NODE_MODULES}/package.json`);
const { chromium } = require('playwright');
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  await page.goto(process.env.PROFILE_PREVIEW_URL || 'http://localhost:4175/', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => {
    const hero = document.querySelector('[data-hero]');
    const portrait = hero?.querySelector('img');
    return hero?.classList.contains('is-ready') && portrait?.complete && portrait.naturalWidth > 0;
  });
  const content = await page.locator('.hero__inner').boundingBox();
  assert(content, 'The portfolio hero content is missing.');
  await page.screenshot({
    path: 'assets/mahesh-hero.png', animations: 'disabled',
    clip: { x: 0, y: Math.max(80, content.y - 24), width: 1440, height: content.height + 48 },
  });
  console.log('Rendered the actual portfolio hero, including portrait, as a GitHub-compatible PNG.');
} finally {
  await browser.close();
}
