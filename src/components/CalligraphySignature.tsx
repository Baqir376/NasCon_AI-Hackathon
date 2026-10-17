'use client';

import React, { useEffect, useRef, useState } from 'react';

export function CalligraphySignature() {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className="colophon-signature-card" ref={containerRef}>
      <div className="colophon-text-col">
        <span className="colophon-tag">EDITORIAL CERTIFICATE OF PROVENANCE</span>
        <h4 className="colophon-title">The Sovereign Newsroom Covenant</h4>
        <p className="colophon-para">
          “In an era saturated by hallucinatory synthetic text and algorithmic engagement loops, we hold these truths to be foundational: that every story must be finite, every sentence must be grounded to accredited human reporting, and every reader deserves the tactile quiet luxury of a true morning broadsheet.”
        </p>
        <span className="colophon-sign-title">Chief Editorial Architect & Creative Technologist</span>
      </div>

      <div className="signature-svg-col">
        {/* Animated Hand-Drawn Calligraphy Signature Path */}
        <svg viewBox="0 0 320 120" className={`signature-svg ${isVisible ? 'draw-signature' : ''}`}>
          <path
            d="M 25,75 C 45,25 70,20 85,55 C 95,78 70,95 55,90 C 40,85 50,55 90,65 C 130,75 120,40 145,50 C 170,60 155,90 190,70 C 225,50 210,85 240,65 C 270,45 285,60 305,45"
            fill="none"
            stroke="var(--accent-primary)"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="calligraphy-path"
          />
          <path
            d="M 50,92 C 110,88 180,95 280,82"
            fill="none"
            stroke="var(--accent-primary)"
            strokeWidth="1.8"
            strokeLinecap="round"
            className="signature-flourish"
          />
        </svg>
        <div className="seal-monogram-mini">EST. 2026 // NASCON AI HACKATHON</div>
      </div>
    </div>
  );
}
