'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

export function SmoothScroller() {
  useEffect(() => {
    // Only initialize on desktop/mouse devices to preserve native momentum touch scrolling on mobile
    if (typeof window === 'undefined' || window.matchMedia('(pointer: coarse)').matches) {
      return;
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Apple/Locomotive luxury deceleration
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.5,
      prevent: (node: HTMLElement) => {
        if (!node) return false;

        // If body has modal-open / drawer-open or any overlay is active, prevent Lenis from hijacking wheel
        if (
          document.body.classList.contains('modal-open') ||
          document.body.classList.contains('drawer-open') ||
          Boolean(document.querySelector('.broadsheet-reader-overlay, .email-dispatch-overlay, .modal-overlay, .drawer-backdrop, .cmd-backdrop'))
        ) {
          return true;
        }

        // Check if node or any ancestor has data-lenis-prevent or matches any nested scrollable container
        return (
          node.hasAttribute?.('data-lenis-prevent') ||
          Boolean(node.closest?.('[data-lenis-prevent]')) ||
          Boolean(
            node.closest?.(
              '.broadsheet-reader-overlay, .broadsheet-reader-paper, .reader-scroll-content, ' +
              '.email-dispatch-overlay, .email-dispatch-modal, .preview-html-frame, ' +
              '.drawer-backdrop, .inspection-drawer, .drawer-body, ' +
              '.concierge-panel, .concierge-transcript, ' +
              '.cmd-backdrop, .cmd-palette-modal, .cmd-results-list, ' +
              '.theme-dropdown-menu, .theme-options-list, ' +
              '.modal-overlay, .modal-container, .persona-grid, .preferences-body, .archive-list, ' +
              '.table-responsive-container, [data-scrollable="true"]'
            )
          )
        );
      },
    });

    window.__lenis = lenis;

    let animationFrameId: number;
    function raf(time: number) {
      lenis.raf(time);
      animationFrameId = requestAnimationFrame(raf);
    }

    animationFrameId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(animationFrameId);
      lenis.destroy();
      delete window.__lenis;
    };
  }, []);

  return null;
}

