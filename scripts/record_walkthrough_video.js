const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function smoothScrollTo(page, targetY, durationMs = 1500) {
  await page.evaluate(async ({ targetY, durationMs }) => {
    const startY = window.scrollY;
    const diff = targetY - startY;
    const startTime = performance.now();

    return new Promise(resolve => {
      function step(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / durationMs, 1);
        // EaseInOutCubic
        const ease = progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;
        window.scrollTo(0, startY + diff * ease);

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          resolve();
        }
      }
      requestAnimationFrame(step);
    });
  }, { targetY, durationMs });
}

async function safeClick(page, selectorOrLocator, options = {}) {
  try {
    const loc = typeof selectorOrLocator === 'string' ? page.locator(selectorOrLocator).first() : selectorOrLocator.first();
    const isVis = await loc.isVisible({ timeout: 1500 }).catch(() => false);
    if (isVis) {
      await loc.click({ force: true, timeout: 2500, ...options });
      return true;
    }
  } catch (err) {
    console.log(`[SafeClick skipped] ${selectorOrLocator}`);
  }
  return false;
}

async function safeCloseAllModals(page) {
  try {
    await page.keyboard.press('Escape');
    await sleep(200);
    await page.keyboard.press('Escape');
    await sleep(200);
  } catch (_) {}
}

async function recordWalkthrough() {
  const recordingsDir = path.resolve(__dirname, 'walkthrough_raw');
  if (!fs.existsSync(recordingsDir)) {
    fs.mkdirSync(recordingsDir, { recursive: true });
  } else {
    // Clean old recordings
    const oldFiles = fs.readdirSync(recordingsDir);
    for (const f of oldFiles) {
      try { fs.unlinkSync(path.join(recordingsDir, f)); } catch (_) {}
    }
  }

  const audioPath = path.resolve(__dirname, 'narration_stems/walkthrough_master_soundtrack.wav');
  const outputMp4 = path.resolve(__dirname, '../public/showreel/morning_paper_loom_walkthrough.mp4');

  console.log('================================================================');
  console.log('THE PERSONAL MORNING PAPER — FLAGSHIP 3:31 WALKTHROUGH RECORDER');
  console.log('Target Duration: 211.40 seconds | Synchronized Natural Voiceover');
  console.log('NaSCon\'26 Rubric All 8 Criteria Alignment');
  console.log('================================================================\n');

  let browser;
  let context;

  try {
    browser = await chromium.launch({
      channel: 'msedge',
      headless: false, // Visible presentation mode
      args: ['--start-maximized'],
    });

    context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      recordVideo: {
        dir: recordingsDir,
        size: { width: 1920, height: 1080 },
      },
    });

    const page = await context.newPage();
    console.log('Navigating to http://localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 30000 });
    await sleep(1500);

    // =========================================================================
    // SCENE 1: Introduction, Problem Statement, & Masthead Architecture (29.0s)
    // 0:00 -> 0:29
    // =========================================================================
    console.log('>>> [Scene 1] Intro & Masthead Architecture (0:00 - 0:29) [29s]');
    await sleep(3500); // Admire initial reveal and ticker
    await page.mouse.move(960, 210, { steps: 25 }); // Move to masthead
    await sleep(4500);
    await page.mouse.move(1740, 48, { steps: 25 }); // Move to CRT Telemetry HUD
    await sleep(5500);
    // Smooth scroll down to Lead Essay
    await smoothScrollTo(page, 480, 2000);
    await sleep(3500);
    await page.mouse.move(620, 520, { steps: 20 }); // Hover on lead article title
    await sleep(5500);
    await page.mouse.move(760, 720, { steps: 20 }); // Hover on Why It Matters
    await sleep(4500);

    // =========================================================================
    // SCENE 2: Autonomous Intelligence Engine & Token Optimization (41.5s)
    // 0:29 -> 1:10.5
    // =========================================================================
    console.log('>>> [Scene 2] AI Architecture & Token Optimization (0:29 - 1:10.5) [41.5s]');
    await smoothScrollTo(page, 1020, 2000); // Architecture & pipeline metrics
    await sleep(6500);
    await smoothScrollTo(page, 1600, 2000); // Telemetry table section
    await sleep(5500);

    // Instantaneous Wire Search Filter
    const searchInput = page.locator('input[placeholder*="Search"]').first();
    const isSearchVis = await searchInput.isVisible().catch(() => false);
    if (isSearchVis) {
      await searchInput.click({ force: true });
      await page.keyboard.type('quantum', { delay: 100 });
      await sleep(4500);
      await searchInput.fill('');
      await sleep(1500);
    } else {
      await sleep(6000);
    }

    // Scroll through table and inspect row chips
    await page.mouse.move(960, 600, { steps: 20 });
    await sleep(8000);
    await smoothScrollTo(page, 1950, 2000);
    await sleep(11500);

    // =========================================================================
    // SCENE 3: Dual-Theme Ergonomics, Command Palette & Personalization (31.0s)
    // 1:10.5 -> 1:41.5
    // =========================================================================
    console.log('>>> [Scene 3] Dual-Theme Ergonomics & Command Palette (1:10.5 - 1:41.5) [31s]');
    // Scroll smoothly to top
    await smoothScrollTo(page, 0, 1500);
    await sleep(1500);

    // Open Command Palette with Ctrl+K
    await page.keyboard.press('Control+k');
    await sleep(2500);
    await page.keyboard.type('Red & Charcoal', { delay: 90 });
    await sleep(2000);
    await page.keyboard.press('Enter');
    await sleep(4000); // Admire luxury dark theme transition

    // Open Command Palette again to demonstrate Persona Envoy
    await page.keyboard.press('Control+k');
    await sleep(2000);
    await page.keyboard.type('Envoy', { delay: 90 });
    await sleep(2000);
    await page.keyboard.press('Enter');
    await sleep(5000); // Inspect Persona modal
    await safeCloseAllModals(page);
    await sleep(4000);

    // Ensure all overlays are fully closed
    await safeCloseAllModals(page);
    await sleep(8000);

    // =========================================================================
    // SCENE 4: Spatial 3D Vitrine, Curatorial Bézier Math & Blueprint (35.5s)
    // 1:41.5 -> 2:17
    // =========================================================================
    console.log('>>> [Scene 4] 360° Vitrine, Bézier Math & Spatial Blueprint (1:41.5 - 2:17) [35.5s]');
    // Scroll to 360° Vitrine
    const vitrineSection = page.locator('#orbital-vitrine-section');
    if (await vitrineSection.isVisible().catch(() => false)) {
      const box = await vitrineSection.boundingBox();
      if (box) await smoothScrollTo(page, box.y - 70, 2000);
      else await smoothScrollTo(page, 2400, 2000);
    } else {
      await smoothScrollTo(page, 2400, 2000);
    }
    await sleep(3000);

    // Rotate cardinal angles
    await safeClick(page, 'button:has-text("90°")');
    await sleep(3500);
    await safeClick(page, 'button:has-text("180°")');
    await sleep(3500);
    await safeClick(page, 'button:has-text("0°")');
    await sleep(3500);

    // Scroll to Curatorial Bézier Simulator
    await smoothScrollTo(page, 3200, 2000);
    await sleep(6500);

    // Scroll to Autonomous Blueprint Schematic
    await smoothScrollTo(page, 4000, 2000);
    await sleep(3000);
    await safeClick(page, '.blueprint-node-pin, .hotspot-beacon');
    await sleep(6000);
    await safeCloseAllModals(page);
    await sleep(4000);

    // =========================================================================
    // SCENE 5: Grounded Fact Synthesis, Broadsheet Reader & RL Taste (37.0s)
    // 2:17 -> 2:54
    // =========================================================================
    console.log('>>> [Scene 5] Grounded Fact Synthesis, Reader Room & RL Taste (2:17 - 2:54) [37s]');
    // Scroll back to main news section
    await smoothScrollTo(page, 520, 2000);
    await sleep(2500);

    // Upvote feedback button for reinforcement learning
    await safeClick(page, 'button:has-text("Relevant")');
    await sleep(3000);

    // Open Broadsheet Reading Room modal
    const openedReader = await safeClick(page, 'button:has-text("Read Story")');
    if (openedReader) {
      await sleep(3500);
      // Mouse scroll inside reader modal
      await page.mouse.wheel(0, 350);
      await sleep(3000);
      await page.mouse.wheel(0, -350);
      await sleep(3000);
      await safeCloseAllModals(page);
      await sleep(2500);
    } else {
      await sleep(12000);
    }

    // Scroll down to Horizon & Tomorrow's Agenda
    await smoothScrollTo(page, 1250, 2000);
    await sleep(10000);

    // =========================================================================
    // SCENE 6: Real Email Courier, Colophon & Wrap-Up (37.4s)
    // 2:54 -> 3:31.4
    // =========================================================================
    console.log('>>> [Scene 6] Real Email Courier, Colophon & Wrap-Up (2:54 - 3:31.4) [37.4s]');
    // Scroll to top navigation
    await smoothScrollTo(page, 0, 1500);
    await sleep(1500);

    // Open Email Courier
    const openedEmail = await safeClick(page, 'button:has-text("Email Courier")');
    if (openedEmail) {
      await sleep(3000);
      // Switch to Live Broadsheet Preview tab
      await safeClick(page, 'button:has-text("Live Broadsheet Preview")');
      await sleep(5500);
      await safeCloseAllModals(page);
      await sleep(2000);
    } else {
      await sleep(10500);
    }

    // Open Concierge Drawer
    const openedConcierge = await safeClick(page, '.concierge-launcher-btn, .acoustic-orb-container');
    if (openedConcierge) {
      await sleep(3500);
      await safeClick(page, '.prompt-chip-btn');
      await sleep(4000);
      await safeCloseAllModals(page);
      await sleep(2000);
    } else {
      await sleep(9500);
    }

    // Scroll to Colophon section at the very bottom
    await smoothScrollTo(page, 5600, 2000);
    await sleep(8400);

    console.log('>>> Walkthrough visual script complete! Closing browser context...');

  } catch (err) {
    console.error('Recording encounter warning:', err);
  } finally {
    if (context) {
      await context.close().catch(() => {});
    }
    if (browser) {
      await browser.close().catch(() => {});
    }
  }

  // Find recorded webm file in recordingsDir
  const files = fs.readdirSync(recordingsDir).filter(f => f.endsWith('.webm'));
  if (files.length === 0) {
    throw new Error('No recorded video file found in ' + recordingsDir);
  }

  files.sort((a, b) => fs.statSync(path.join(recordingsDir, b)).mtimeMs - fs.statSync(path.join(recordingsDir, a)).mtimeMs);
  const rawVideoPath = path.join(recordingsDir, files[0]);

  console.log(`\nRaw video captured: ${rawVideoPath} (${(fs.statSync(rawVideoPath).size / (1024 * 1024)).toFixed(2)} MB)`);
  console.log(`Muxing with master voiceover soundtrack: ${audioPath}...`);

  // Use ffmpeg to mux video and audio into high-quality MP4
  const muxCmd = [
    'ffmpeg', '-y',
    '-i', `"${rawVideoPath}"`,
    '-i', `"${audioPath}"`,
    '-c:v', 'libx264',
    '-preset', 'medium',
    '-crf', '20',
    '-pix_fmt', 'yuv420p',
    '-c:a', 'aac',
    '-b:a', '256k',
    '-shortest',
    `"${outputMp4}"`
  ].join(' ');

  console.log('Running muxing command:', muxCmd);
  execSync(muxCmd, { stdio: 'inherit' });

  const finalSize = fs.statSync(outputMp4).size;
  console.log(`\n================================================================`);
  console.log(`🎉 FLAGSHIP LOOM WALKTHROUGH VIDEO COMPLETE!`);
  console.log(`Output: ${outputMp4}`);
  console.log(`File Size: ${(finalSize / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`================================================================\n`);
}

recordWalkthrough().catch(console.error);
