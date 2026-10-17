import { CanonicalEdition } from '../synthesis/schema';

/**
 * Builds a standalone print-optimized HTML document for broadsheet PDF rendering.
 * Generated from the exact canonical edition data powering the web reader.
 */
export function buildBroadsheetHtml(edition: CanonicalEdition): string {
  const formattedDate = new Date(edition.editionDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const sectionsHtml = edition.sections
    .map(
      (sec) => `
    <section class="pdf-section">
      <div class="pdf-section-header">
        <h2>${sec.name.toUpperCase()}</h2>
        <span>${sec.stories.length} DISPATCHES</span>
      </div>
      <div class="pdf-columns-grid">
        ${sec.stories
          .map(
            (story) => `
          <article class="pdf-story-card">
            <div class="pdf-story-meta">
              <span>${story.sourceName}</span>
              <span>${new Date(story.publishedAt).toLocaleDateString()}</span>
            </div>
            <h3 class="pdf-story-headline">${story.headline}</h3>
            <p class="pdf-narrative">${story.narrativeText}</p>
            <ul class="pdf-bullets">
              ${story.summaryBullets.map((b) => `<li>• ${b}</li>`).join('')}
            </ul>
            ${
              story.sourceQuote
                ? `<div class="pdf-quote-box">“${story.sourceQuote}”</div>`
                : ''
            }
            <div class="pdf-why-box">
              <strong>Impact:</strong> ${story.whyItMatters}
            </div>
            <div class="pdf-source-attribution">
              Source: <a href="${story.sourceUrl}">${story.sourceUrl}</a>
            </div>
          </article>
        `
          )
          .join('')}
      </div>
    </section>
  `
    )
    .join('');

  const horizonHtml = edition.horizonStory
    ? `
    <section class="pdf-horizon">
      <div class="pdf-horizon-header">
        <span>✦ THE HORIZON • SERENDIPITY DISCOVERY ✦</span>
      </div>
      <div class="pdf-horizon-body">
        <h3 class="pdf-horizon-headline">${edition.horizonStory.headline}</h3>
        <p class="pdf-narrative">${edition.horizonStory.narrativeText}</p>
        <ul class="pdf-bullets">
          ${edition.horizonStory.summaryBullets.map((b) => `<li>✦ ${b}</li>`).join('')}
        </ul>
        <div class="pdf-horizon-why">
          <strong>Why curated:</strong> ${edition.horizonStory.whyItMatters}
        </div>
        <div class="pdf-source-attribution">
          Source: <a href="${edition.horizonStory.sourceUrl}">${edition.horizonStory.sourceUrl}</a>
        </div>
      </div>
    </section>
  `
    : '';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${edition.mastheadTitle}</title>
  <style>
    @page {
      size: A4;
      margin: 12mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'Times New Roman', Times, serif;
      background: #ffffff;
      color: #111111;
      line-height: 1.45;
      font-size: 10pt;
    }
    .pdf-container {
      width: 100%;
    }
    /* Masthead */
    .pdf-masthead {
      text-align: center;
      border-bottom: 2.5pt double #000;
      padding-bottom: 6pt;
      margin-bottom: 12pt;
    }
    .pdf-masthead-sub {
      font-family: Arial, sans-serif;
      font-size: 7.5pt;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: #555;
    }
    .pdf-masthead-title {
      font-family: 'Times New Roman', serif;
      font-size: 26pt;
      font-weight: 900;
      letter-spacing: 0.04em;
      margin: 4pt 0;
    }
    .pdf-dateline {
      display: flex;
      justify-content: space-between;
      border-top: 1pt solid #000;
      border-bottom: 1pt solid #000;
      padding: 3pt 0;
      font-family: Arial, sans-serif;
      font-size: 7.5pt;
      font-weight: bold;
      margin-top: 4pt;
    }
    /* Lead Story Hero */
    .pdf-lead-story {
      border-bottom: 1.5pt solid #000;
      padding-bottom: 10pt;
      margin-bottom: 12pt;
    }
    .pdf-lead-badge {
      display: inline-block;
      background: #8b0000;
      color: #fff;
      font-family: Arial, sans-serif;
      font-size: 6.5pt;
      font-weight: bold;
      padding: 1.5pt 4pt;
      letter-spacing: 0.08em;
      margin-bottom: 4pt;
    }
    .pdf-lead-headline {
      font-size: 18pt;
      font-weight: bold;
      line-height: 1.15;
      margin-bottom: 6pt;
    }
    .pdf-lead-grid {
      display: flex;
      gap: 12pt;
    }
    .pdf-lead-main {
      flex: 1.4;
    }
    .pdf-lead-sidebar {
      flex: 1;
      background: #f7f7f5;
      padding: 8pt;
      border: 0.5pt solid #ddd;
    }
    .pdf-narrative {
      font-size: 10pt;
      line-height: 1.5;
      margin-bottom: 6pt;
      text-align: justify;
    }
    .pdf-quote-box {
      font-style: italic;
      background: #fdfaf3;
      border-left: 2pt solid #8b0000;
      padding: 5pt 8pt;
      font-size: 8.5pt;
      margin: 6pt 0;
    }
    .pdf-why-box {
      font-family: Arial, sans-serif;
      font-size: 7.5pt;
      background: #f0f5fa;
      border-left: 2pt solid #0f4c81;
      padding: 4pt 6pt;
      margin-top: 6pt;
    }
    .pdf-bullets {
      list-style: none;
      font-size: 8.5pt;
      line-height: 1.4;
      margin: 4pt 0;
    }
    .pdf-bullets li {
      margin-bottom: 4pt;
    }
    .pdf-source-attribution {
      font-family: Arial, sans-serif;
      font-size: 6.5pt;
      color: #666;
      margin-top: 4pt;
    }
    .pdf-source-attribution a {
      color: #0f4c81;
      text-decoration: none;
    }
    /* Thematic Sections */
    .pdf-section {
      margin-bottom: 12pt;
      page-break-inside: avoid;
    }
    .pdf-section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1.5pt solid #000;
      border-bottom: 0.5pt solid #000;
      padding: 2pt 0;
      margin-bottom: 8pt;
      font-family: Arial, sans-serif;
      font-size: 7.5pt;
      font-weight: bold;
    }
    .pdf-columns-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 10pt;
    }
    .pdf-story-card {
      flex: 1 1 45%;
      border-bottom: 0.5pt solid #ccc;
      padding-bottom: 8pt;
      margin-bottom: 8pt;
      page-break-inside: avoid;
    }
    .pdf-story-meta {
      display: flex;
      justify-content: space-between;
      font-family: Arial, sans-serif;
      font-size: 6.5pt;
      color: #666;
      margin-bottom: 2pt;
    }
    .pdf-story-headline {
      font-size: 11pt;
      font-weight: bold;
      line-height: 1.25;
      margin-bottom: 4pt;
    }
    /* The Horizon */
    .pdf-horizon {
      border: 1pt solid #c59b27;
      background: #fffef9;
      padding: 8pt;
      margin-top: 10pt;
      page-break-inside: avoid;
    }
    .pdf-horizon-header {
      font-family: Arial, sans-serif;
      font-size: 7pt;
      font-weight: bold;
      color: #795548;
      letter-spacing: 0.1em;
      border-bottom: 0.5pt solid #e6d39a;
      padding-bottom: 3pt;
      margin-bottom: 6pt;
    }
    .pdf-horizon-headline {
      font-size: 11pt;
      font-weight: bold;
      margin-bottom: 4pt;
    }
    .pdf-horizon-why {
      font-family: Arial, sans-serif;
      font-size: 7.5pt;
      color: #5d4037;
      background: #faf4e8;
      padding: 4pt 6pt;
      margin-top: 4pt;
    }
    /* Footer */
    .pdf-footer {
      border-top: 0.5pt solid #666;
      padding-top: 4pt;
      margin-top: 14pt;
      display: flex;
      justify-content: space-between;
      font-family: Arial, sans-serif;
      font-size: 6.5pt;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="pdf-container">
    <header class="pdf-masthead">
      <div class="pdf-masthead-sub">NaSCon’26 Personal Morning Paper • Broadsheet Edition</div>
      <h1 class="pdf-masthead-title">${edition.mastheadTitle.toUpperCase()}</h1>
      <div class="pdf-dateline">
        <span>VOL. I • NO. ${edition.editionNumber}</span>
        <span>${formattedDate.toUpperCase()}</span>
        <span>CANONICAL EDITION ID: ${edition.id.slice(0, 8)}</span>
      </div>
    </header>

    <!-- Lead Story -->
    <article class="pdf-lead-story">
      <div class="pdf-lead-badge">FRONT PAGE LEAD</div>
      <h2 class="pdf-lead-headline">${edition.leadStory.headline}</h2>
      <div class="pdf-lead-grid">
        <div class="pdf-lead-main">
          <p class="pdf-narrative">${edition.leadStory.narrativeText}</p>
          ${
            edition.leadStory.sourceQuote
              ? `<div class="pdf-quote-box">“${edition.leadStory.sourceQuote}”</div>`
              : ''
          }
          <div class="pdf-why-box">
            <strong>Relevance to you:</strong> ${edition.leadStory.whyItMatters}
          </div>
          <div class="pdf-source-attribution">
            Reported by <strong>${edition.leadStory.sourceName}</strong> • Verified link: <a href="${edition.leadStory.sourceUrl}">${edition.leadStory.sourceUrl}</a>
          </div>
        </div>
        <div class="pdf-lead-sidebar">
          <strong style="font-family: Arial, sans-serif; font-size: 7.5pt; display: block; margin-bottom: 4pt; border-bottom: 0.5pt solid #bbb; padding-bottom: 2pt;">
            CORE VERIFIED TAKEAWAYS
          </strong>
          <ul class="pdf-bullets">
            ${edition.leadStory.summaryBullets.map((b) => `<li>• ${b}</li>`).join('')}
          </ul>
        </div>
      </div>
    </article>

    <!-- Thematic Sections -->
    ${sectionsHtml}

    <!-- The Horizon Serendipity -->
    ${horizonHtml}

    <footer class="pdf-footer">
      <span>AUTONOMOUS JOURNALISM PIPELINE • ZERO HALLUCINATION POLICY</span>
      <span>GENERATED IN ${edition.generationMs}MS • TOKENS: ${edition.totalTokens}</span>
      <span>PAGE 1 OF 1</span>
    </footer>
  </div>
</body>
</html>
`;
}
