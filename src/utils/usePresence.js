import { useEffect, useState } from 'react';

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Keeps something on screen long enough to animate out, so panels and menus
 * can fade/slide away instead of vanishing.
 *
 *   const { mounted, visible } = usePresence(open, 250);
 *   {mounted && <div className={visible ? 'opacity-100' : 'opacity-0'} />}
 *
 *   mounted - render it at all
 *   visible - apply the "shown" styles (it starts false for one frame after
 *             opening, so the enter transition has a starting point)
 *
 * `duration` (ms) should match the CSS transition. With reduced motion turned
 * on in the system settings, it closes instantly.
 */
export function usePresence(open, duration = 250) {
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(open);

  useEffect(() => {
    if (open) {
      setMounted(true);
      // Wait two frames so the browser draws the hidden state first.
      let frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(() => setVisible(true));
      });
      return () => cancelAnimationFrame(frame);
    }
    setVisible(false);
    const timer = setTimeout(() => setMounted(false), prefersReducedMotion() ? 0 : duration);
    return () => clearTimeout(timer);
  }, [open, duration]);

  return { mounted, visible };
}
