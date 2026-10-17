'use client';

import React, { useEffect, useRef } from 'react';

export function MagneticCursor() {
  const primaryDropletRef = useRef<HTMLDivElement>(null);
  const followerRingRef = useRef<HTMLDivElement>(null);
  const trailDropletRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    // Disable on touch devices
    if (typeof window === 'undefined' || window.matchMedia('(pointer: coarse)').matches) {
      return;
    }

    let mouseX = -100;
    let mouseY = -100;
    let prevMouseX = -100;
    let prevMouseY = -100;

    let followerX = -100;
    let followerY = -100;

    let trailX = -100;
    let trailY = -100;

    let animId: number;
    let isVisible = false;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!isVisible) {
        isVisible = true;
        if (primaryDropletRef.current) primaryDropletRef.current.style.opacity = '1';
        if (followerRingRef.current) followerRingRef.current.style.opacity = '1';
        if (trailDropletRef.current) trailDropletRef.current.style.opacity = '0.55';
      }

      // Check if hovering interactive target
      const target = e.target as HTMLElement | null;
      if (target && followerRingRef.current) {
        const interactive = target.closest('button, a, input, select, [data-cursor], .action-btn, .control-btn');
        if (interactive) {
          followerRingRef.current.classList.add('hovered');
          const customLabel = interactive.getAttribute('data-cursor');
          if (labelRef.current) {
            if (customLabel) {
              labelRef.current.textContent = customLabel;
              labelRef.current.style.display = 'block';
            } else {
              labelRef.current.style.display = 'none';
            }
          }
        } else {
          followerRingRef.current.classList.remove('hovered');
          if (labelRef.current) labelRef.current.style.display = 'none';
        }
      }
    };

    const onMouseDown = () => {
      primaryDropletRef.current?.classList.add('ink-splat');
      followerRingRef.current?.classList.add('clicking');
    };

    const onMouseUp = () => {
      primaryDropletRef.current?.classList.remove('ink-splat');
      followerRingRef.current?.classList.remove('clicking');
    };

    const onMouseLeave = () => {
      isVisible = false;
      if (primaryDropletRef.current) primaryDropletRef.current.style.opacity = '0';
      if (followerRingRef.current) followerRingRef.current.style.opacity = '0';
      if (trailDropletRef.current) trailDropletRef.current.style.opacity = '0';
    };

    // 60-120fps direct hardware-accelerated transform loop
    const tick = () => {
      // Primary fluid velocity squash/stretch
      const vx = mouseX - prevMouseX;
      const vy = mouseY - prevMouseY;
      const speed = Math.sqrt(vx * vx + vy * vy);
      const angle = Math.atan2(vy, vx) * (180 / Math.PI);
      const stretch = Math.min(1 + speed * 0.02, 2.0);
      const squeeze = Math.max(1 / Math.sqrt(stretch), 0.58);

      prevMouseX = mouseX;
      prevMouseY = mouseY;

      if (primaryDropletRef.current) {
        primaryDropletRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) rotate(${angle}deg) scale(${stretch}, ${squeeze})`;
      }

      // Viscous spring physics for fluid ink follower
      followerX += (mouseX - followerX) * 0.22;
      followerY += (mouseY - followerY) * 0.22;

      if (followerRingRef.current) {
        followerRingRef.current.style.transform = `translate3d(${followerX}px, ${followerY}px, 0)`;
      }

      // Secondary trailing ink droplet with slower viscosity
      trailX += (followerX - trailX) * 0.14;
      trailY += (followerY - trailY) * 0.14;

      if (trailDropletRef.current) {
        trailDropletRef.current.style.transform = `translate3d(${trailX}px, ${trailY}px, 0) scale(0.72)`;
      }

      animId = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mousedown', onMouseDown, { passive: true });
    window.addEventListener('mouseup', onMouseUp, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave, { passive: true });
    animId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mouseleave', onMouseLeave);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <>
      {/* Secondary Trailing Viscous Ink Droplet */}
      <div
        ref={trailDropletRef}
        className="ink-trail-droplet"
        style={{ opacity: 0, willChange: 'transform' }}
      />

      {/* Primary Fluid Red Ink Droplet with Velocity Squish & Stretch */}
      <div
        ref={primaryDropletRef}
        className="ink-fluid-droplet"
        style={{ opacity: 0, willChange: 'transform' }}
      >
        <div className="ink-gloss-reflection" />
      </div>

      {/* Fluid Ink Wash Follower Ring / Interactive Bleed Aura */}
      <div
        ref={followerRingRef}
        className="ink-fluid-ring"
        style={{ opacity: 0, willChange: 'transform' }}
      >
        <span ref={labelRef} className="ink-cursor-label" style={{ display: 'none' }} />
      </div>
    </>
  );
}

