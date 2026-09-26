const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Scrolls to the top of the page (instantly for people who asked for less
 * motion) and puts keyboard focus on the main content, so keyboard users
 * continue from the top too, not from the button.
 */
export function goToTop() {
  window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  document.getElementById('main')?.focus({ preventScroll: true });
}
