import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 390, height: 1000 } });
await p.goto('http://127.0.0.1:4173/#/grade-three/pattern/core-grade-three-x108', { waitUntil: 'networkidle' });
await p.waitForTimeout(700);
await p.screenshot({ path: '/tmp/opencode/mmm/legend-v2.png', clip: { x: 0, y: 60, width: 390, height: 800 } });
await b.close();
