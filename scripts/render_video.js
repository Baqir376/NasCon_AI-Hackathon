const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

async function renderVideo() {
  const fps = 60;
  const duration = 15.0;
  const totalFrames = Math.floor(fps * duration); // 900 frames

  const audioPath = path.resolve(__dirname, 'master_audio.wav');
  const outputPath = path.resolve(__dirname, '../public/showreel/morning_paper_showreel.mp4');

  console.log(`Starting render: 15.0s @ ${fps}fps (${totalFrames} frames at 1920x1080)...`);
  console.log(`Target output: ${outputPath}`);

  const ffmpegArgs = [
    '-y',
    '-f', 'image2pipe',
    '-vcodec', 'png',
    '-r', String(fps),
    '-i', '-',
    '-i', audioPath,
    '-c:v', 'libx264',
    '-preset', 'fast',
    '-crf', '16',
    '-pix_fmt', 'yuv420p',
    '-c:a', 'aac',
    '-b:a', '320k',
    '-shortest',
    outputPath
  ];

  const ffmpeg = spawn('ffmpeg', ffmpegArgs, { stdio: ['pipe', 'inherit', 'inherit'] });

  ffmpeg.on('error', (err) => {
    console.error('FFmpeg process error:', err);
  });

  const browser = await chromium.launch({ channel: 'msedge' });
  const page = await browser.newPage({
    viewport: { width: 1920, height: 1080 }
  });

  const fileUrl = 'file:///' + path.resolve(__dirname, 'showreel.html').replace(/\\/g, '/');
  await page.goto(fileUrl, { waitUntil: 'load' });

  const dt = 1.0 / fps;
  const startTime = Date.now();

  for (let f = 0; f < totalFrames; f++) {
    const t = f * dt;
    await page.evaluate((time) => window.seek(time), t);
    const buffer = await page.screenshot({ type: 'png' });

    const canWrite = ffmpeg.stdin.write(buffer);
    if (!canWrite) {
      await new Promise(resolve => ffmpeg.stdin.once('drain', resolve));
    }

    if (f % 60 === 0 || f === totalFrames - 1) {
      const pct = (((f + 1) / totalFrames) * 100).toFixed(1);
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      const fpsRate = ((f + 1) / (elapsed || 0.001)).toFixed(1);
      console.log(`Progress: ${pct}% (${f + 1}/${totalFrames} frames) | Elapsed: ${elapsed}s @ ${fpsRate} fps`);
    }
  }

  ffmpeg.stdin.end();

  await new Promise((resolve, reject) => {
    ffmpeg.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`FFmpeg exited with code ${code}`));
    });
  });

  await browser.close();
  const stats = fs.statSync(outputPath);
  console.log(`Video render complete! File size: ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);
}

renderVideo().catch(console.error);
