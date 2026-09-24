import { useEffect, useState } from 'react';
import { readPreference, writePreference } from './preferences.js';

/**
 * Light / dark mode.
 *   - No saved choice: follow the system setting (and keep following it if it changes).
 *   - After using the header toggle: remember that choice in this browser.
 * The "dark" class on <html> switches the colors (see index.css). index.html
 * applies it once before React loads; keep the two in sync.
 */
const SYSTEM_DARK = '(prefers-color-scheme: dark)';

export function useTheme() {
  const [saved, setSaved] = useState(() => readPreference('theme', null)); // 'light' | 'dark' | null
  const [systemDark, setSystemDark] = useState(() => window.matchMedia(SYSTEM_DARK).matches);

  // Keep up with the system setting.
  useEffect(() => {
    const list = window.matchMedia(SYSTEM_DARK);
    const onChange = () => setSystemDark(list.matches);
    list.addEventListener('change', onChange);
    return () => list.removeEventListener('change', onChange);
  }, []);

  const dark = saved ? saved === 'dark' : systemDark;

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  const toggle = () => {
    const next = dark ? 'light' : 'dark';
    setSaved(next);
    writePreference('theme', next);
  };

  return { dark, toggle };
}
