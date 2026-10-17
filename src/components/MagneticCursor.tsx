'use client';

import React, { useEffect, useState } from 'react';

export function MagneticCursor() {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [follower, setFollower] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [hoverLabel, setHoverLabel] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Disable on touch devices
    if (window.matchMedia('(pointer: coarse)').matches) {
      return;
    }

    let mouseX = -100;
    let mouseY = -100;
    let followerX = -100;
    let followerY = -100;
    let animId: number;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      setPosition({ x: mouseX, y: mouseY });
      if (!isVisible) setIsVisible(true);

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

    const onMouseLeave = () => {
      setIsVisible(false);
    };

    const animateFollower = () => {
      // Smooth spring dampening towards target mouse coordinates
      followerX += (mouseX - followerX) * 0.18;
      followerY += (mouseY - followerY) * 0.18;
      setFollower({ x: followerX, y: followerY });
      animId = requestAnimationFrame(animateFollower);
    };

    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseleave', onMouseLeave);
    animId = requestAnimationFrame(animateFollower);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      cancelAnimationFrame(animId);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <>
      <div
        className="editorial-cursor-dot"
        style={{
          transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        }}
      />
      <div
        className={`editorial-cursor-ring ${isHovered ? 'hovered' : ''}`}
        style={{
          transform: `translate3d(${follower.x}px, ${follower.y}px, 0)`,
        }}
      >
        {hoverLabel && <span className="cursor-label">{hoverLabel}</span>}
      </div>
    </>
  );
}
