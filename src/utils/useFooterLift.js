import { useEffect, useState } from 'react';

/**
 * How many pixels of the page footer are on screen right now. The round
 * buttons fixed in the bottom-right corner lift by this much, so they ride
 * above the footer instead of covering its links at the end of the page.
 */
export function useFooterLift() {
  const [lift, setLift] = useState(0);

  useEffect(() => {
    const update = () => {
      const footer = document.querySelector('footer');
      const top = footer ? footer.getBoundingClientRect().top : window.innerHeight;
      setLift(Math.max(0, Math.round(window.innerHeight - top)));
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return lift;
}
