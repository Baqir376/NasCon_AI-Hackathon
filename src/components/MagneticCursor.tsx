'use client';

import React, { useEffect, useState, useRef } from 'react';

interface DropletTrail {
  x: number;
  y: number;
  scale: number;
  alpha: number;
}

export function MagneticCursor() {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [follower, setFollower] = useState({ x: -100, y: -100 });
  const [trail, setTrail] = useState<DropletTrail>({ x: -100, y: -100, scale: 0.8, alpha: 0.6 });
  const [isHovered, setIsHovered] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [hoverLabel, setHoverLabel] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [fluidTransform, setFluidTransform] = useState({ stretch: 1, squeeze: 1, angle: 0 });

  const prevPos = useRef({ x: -100, y: -100 });

  useEffect(() => {
    // Disable on touch devices
    if (typeof window === 'undefined' || window.matchMedia('(pointer: coarse)').matches) {
      return;
    }

    let mouseX = -100;
    let mouseY = -100;
    let followerX = -100;
    let followerY = -100;
    let trailX = -100;
    let trailY = -100;
    let animId: number;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      setPosition({ x: mouseX, y: mouseY });
      if (!isVisible) setIsVisible(true);

      // Compute velocity vector for fluid ink squish & stretch
      const vx = mouseX - prevPos.current.x;
      const vy = mouseY - prevPos.current.y;
      const speed = Math.sqrt(vx * vx + vy * vy);
      const angle = Math.atan2(vy, vx) * (180 / Math.PI);
      const stretch = Math.min(1 + speed * 0.025, 2.1);
      const squeeze = Math.max(1 / Math.sqrt(stretch), 0.55);

      setFluidTransform({ stretch, squeeze, angle });
      prevPos.current = { x: mouseX, y: mouseY };

      // Check if target is interactive
      const target = e.target as HTMLElement | null;
      if (target) {
        const interactive = target.closest('button, a, input, select, [data-cursor], .action-btn, .control-btn');
        if (interactive) {
          setIsHovered(true);
          const customLabel = interactive.getAttribute('data-cursor');
          setHoverLabel(customLabel);
        } else {
          setIsHovered(false);
          setHoverLabel(null);
        }
      }
    };

    const onMouseDown = () => setIsClicking(true);
    const onMouseUp = () => setIsClicking(false);
    const onMouseLeave = () => setIsVisible(false);

    const animateFollower = () => {
      // Viscous spring physics for fluid ink follower
      followerX += (mouseX - followerX) * 0.22;
      followerY += (mouseY - followerY) * 0.22;
      setFollower({ x: followerX, y: followerY });

      // Secondary trailing ink droplet with slower viscosity
      trailX += (followerX - trailX) * 0.14;
      trailY += (followerY - trailY) * 0.14;
      setTrail({ x: trailX, y: trailY, scale: 0.7, alpha: 0.5 });

      animId = requestAnimationFrame(animateFollower);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mouseleave', onMouseLeave);
    animId = requestAnimationFrame(animateFollower);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mouseleave', onMouseLeave);
      cancelAnimationFrame(animId);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <>
      {/* Secondary Trailing Viscous Ink Droplet */}
      <div
        className="ink-trail-droplet"
        style={{
          transform: `translate3d(${trail.x}px, ${trail.y}px, 0) scale(${trail.scale})`,
          opacity: trail.alpha,
        }}
      />

      {/* Primary Fluid Red Ink Droplet with Velocity Squish & Stretch */}
      <div
        className={`ink-fluid-droplet ${isClicking ? 'ink-splat' : ''}`}
        style={{
          transform: `translate3d(${position.x}px, ${position.y}px, 0) rotate(${fluidTransform.angle}deg) scale(${fluidTransform.stretch}, ${fluidTransform.squeeze})`,
        }}
      >
        <div className="ink-gloss-reflection" />
      </div>

      {/* Fluid Ink Wash Follower Ring / Interactive Bleed Aura */}
      <div
        className={`ink-fluid-ring ${isHovered ? 'hovered' : ''} ${isClicking ? 'clicking' : ''}`}
        style={{
          transform: `translate3d(${follower.x}px, ${follower.y}px, 0)`,
        }}
      >
        {hoverLabel && <span className="ink-cursor-label">{hoverLabel}</span>}
      </div>
    </>
  );
}
