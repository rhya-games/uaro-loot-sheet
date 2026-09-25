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

  // When `open` changes: mount right away when opening, and switch to the
  // hidden styles right away when closing. Done while drawing (React's way
  // to follow a prop) rather than in an effect, which would draw twice.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setMounted(true);
    else setVisible(false);
  }

  useEffect(() => {
    if (open) {
      // Wait two frames (~30ms, not noticeable) so the browser has drawn the
      // hidden state before switching to "shown"; with one frame it can skip
      // the transition.
      let frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(() => setVisible(true));
      });
      return () => cancelAnimationFrame(frame);
    }
    // Closed: let the exit transition play, then unmount. (Nothing to do if it
    // was never shown, e.g. a tooltip on page load.)
    if (!mounted) return undefined;
    const timer = setTimeout(() => setMounted(false), prefersReducedMotion() ? 0 : duration);
    return () => clearTimeout(timer);
  }, [open, duration, mounted]);

  return { mounted, visible };
}
