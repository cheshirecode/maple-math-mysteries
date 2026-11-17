import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 390, height: 1000 } });
await p.goto('http://127.0.0.1:4173/#/grade-three/pattern/core-grade-three-x108', { waitUntil: 'networkidle' });
await p.waitForTimeout(600);
const check = await p.evaluate(() => {
  const tiles = [...document.querySelectorAll('.pattern-strip .pattern-tile')].map((t) => ({
    rods: t.querySelectorAll('.count-rod').length,
    flats: t.querySelectorAll('.count-flat').length,
    dots: t.querySelectorAll('.dot').length,
  }))
  const legend = [...document.querySelectorAll('.pattern-legend .legend-text')].map((l) => l.textContent)
  const totalMarks = tiles.reduce((s, t) => s + t.rods * 10 + t.flats * 100 + t.dots, 0)
  return { tiles, legend, totalMarks }
})
console.log(JSON.stringify(check))
await p.screenshot({ path: '/tmp/opencode/mmm/legend-fixed.png', clip: { x: 0, y: 60, width: 390, height: 900 } })
await b.close();
