export default function HomePage() {
  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <header style={{ borderBottom: '3px double var(--border-ink)', paddingBottom: '1rem', marginBottom: '2rem', textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-muted)' }}>
          NaSCon’26 Hackathon Edition • Autonomous AI Daily
        </p>
        <h1 style={{ fontFamily: 'var(--font-masthead)', fontSize: '3rem', fontWeight: 900, letterSpacing: '0.04em', margin: '0.5rem 0' }}>
          THE PERSONAL MORNING PAPER
        </h1>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-ink)', borderBottom: '1px solid var(--border-ink)', padding: '0.4rem 0', fontFamily: 'var(--font-sans)', fontSize: '0.8rem', fontWeight: 600 }}>
          <span>VOL. I • NO. 1</span>
          <span>AUTONOMOUS CURATION & VERIFICATION PIPELINE</span>
          <span>EST. 2026</span>
        </div>
      </header>

      <section style={{ textAlign: 'center', padding: '3rem 1rem' }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>Engineering Foundation Verified</h2>
        <p style={{ maxWidth: '650px', margin: '0 auto', color: 'var(--text-secondary)' }}>
          The NaSCon’26 Personal Morning Paper system is initializing. Phase 0 foundation complete with Next.js, Prisma ORM, Vitest, and GitHub Actions CI.
        </p>
      </section>
    </main>
  );
}
