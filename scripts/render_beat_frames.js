const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function renderBeats() {
  const outDir = path.resolve(__dirname, 'beats');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const browser = await chromium.launch({ channel: 'msedge' });
  const page = await browser.newPage({
    viewport: { width: 1920, height: 1080 }
  });

  const fileUrl = 'file:///' + path.resolve(__dirname, 'showreel.html').replace(/\\/g, '/');
  await page.goto(fileUrl, { waitUntil: 'load' });

  console.log('Rendering 30 beat frames (1 frame per beat)...');
  for (let beat = 0; beat < 30; beat++) {
    const t = beat * 0.5;
    await page.evaluate((time) => window.seek(time), t);
    const filename = `beat_${String(beat + 1).padStart(2, '0')}_t${t.toFixed(1)}s.png`;
    await page.screenshot({ path: path.join(outDir, filename) });
    if ((beat + 1) % 5 === 0 || beat === 0) {
      console.log(`Rendered Beat ${beat + 1}/30 at t=${t.toFixed(1)}s: ${filename}`);
    }
  }

  await browser.close();
  console.log('Beat inspection frames saved to scripts/beats/');
}

renderBeats().catch(console.error);
