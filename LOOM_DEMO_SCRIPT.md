# NaSCon'26 Hackathon — 5-Minute Loom Video Walkthrough Script

**Project:** Personal Morning Paper  
**Target Video Duration:** Exactly 4 minutes 30 seconds to 4 minutes 50 seconds (Maximum allowed: 5:00)  
**Presenter:** Project Lead / Engineer  
**Live URL:** `http://localhost:3000` (or deployed staging URL)  
**GitHub Repository:** [https://github.com/Baqir376/NasCon_AI-Hackathon](https://github.com/Baqir376/NasCon_AI-Hackathon)

---

## Video Breakdown & Timing Cue Sheet

| Timestamp | Phase | Visual Cue | Key Speaking Points |
| :--- | :--- | :--- | :--- |
| **0:00 – 0:45** | **1. The Problem & Core Concept** | Camera on presenter + screen showing the Masthead of *The Personal Morning Paper*. | "Hi judges, I'm excited to present our NaSCon'26 project: **The Personal Morning Paper**. Today, news is fragmented across dozens of algorithmic social feeds, clickbait teasers, and paywalls. People scroll endlessly and retain nothing. Our solution restores the finite, intentional experience of traditional morning print journalism, powered by an autonomous, source-grounded AI pipeline." |
| **0:45 – 1:30** | **2. Instant Onboarding & Persona Switching** | Click the **"Reader: Guest"** button in top right; open the **Persona Drawer**. Show the pre-seeded personas. | "To evaluate our personalization without signup friction, we built a server-side cryptographic session system with pre-seeded personas. Notice here: **Alex Chen** focuses on AI & Distributed Systems; **Dr. Sarah Lin** focuses on Genomics & Biotech; and **Marcus Vance** tracks Macro & Clean Energy. Watch how clicking 'Alex' instantly re-keys the session with strict data isolation and loads an edition specifically curated for deep-learning systems." |
| **1:30 – 2:30** | **3. Front Page Hero & Factual Grounding** | Scroll to the **Front Page Lead Story**. Hover over the source link, point out the **Primary Source Quote box**, and highlight **"Why this matters to you"**. | "Look at the editorial layout: this isn't a generic chatbot response. Every story is anchored to verifiable evidence. Notice this box: *'Primary Source Evidence'*—our synthesizer enforces that every single takeaway bullet is backed by a verbatim quote from the original article. Click on the publisher link—it takes you directly to the original reporting. Below it is our custom hook: *'Why this matters to you'*, translating the technical breakthrough directly into Alex's engineering workflow." |
| **2:30 – 3:15** | **4. Continuous Learning Loop & 'The Horizon'** | Click **"Relevant"** (Upvote), then scroll down to a section story and click **"Skip Topic"**. Scroll down to **"The Horizon"**. | "The paper learns continuously. Clicking *'Relevant'* or *'Skip Topic'* dynamically updates user topic weights in SQLite using an adaptive feedback loop. And to prevent algorithmic echo chambers, look at this unique section: **The Horizon**. This reserves a spot in every morning edition for a breakthrough strictly *outside* the reader's usual bubble—in this case, an astrophysics discovery for our AI engineer." |
| **3:15 – 4:00** | **5. The Downloadable Broadsheet PDF** | Click the black **"Download PDF"** button in the masthead. Show the rendered multi-column broadsheet PDF layout. | "The hackathon problem statement explicitly mandates a downloadable newspaper-style PDF. Clicking *'Download PDF'* compiles the **exact same canonical edition data** into a print-grade broadsheet layout. Notice the multi-column editorial grid, drop caps, masthead dateline, and source citations. Because web and PDF share a single canonical source of truth, there is zero data drift." |
| **4:00 – 4:45** | **6. Archive, Architecture & Resilience** | Click **"Archive"** to show past editions, then show the terminal test suite passing 26 tests and GitHub Actions green runs. | "Readers can revisit previous editions via the Archive drawer, with strict user isolation. Architecturally, we built a 9-stage pipeline in Next.js 15, Prisma ORM, and SQLite, with an offline deterministic fallback that works with zero API keys. Our GitHub repository has 26 automated unit and parity tests, and continuous CI runs passing on GitHub Actions." |
| **4:45 – 5:00** | **7. Conclusion & Wrap-Up** | Camera on presenter with the broadsheet newspaper visible in background. | "The Personal Morning Paper gives readers back their mornings with finite, trusted, and deeply personal news. Thank you to NaSCon'26 and Eynvision!" |

---

## Screen Recording Tips
1. Use 1080p full-screen capture with crisp microphone audio.
2. Keep the browser zoomed at 100% so typography renders cleanly.
3. Test PDF download once before starting the final recording run.
4. Stop the Loom recording at ~4:45 to safely comply with the 5:00 maximum limit.
