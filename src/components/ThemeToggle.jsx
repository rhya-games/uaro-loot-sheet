import { MoonIcon, SunIcon } from '@heroicons/react/24/outline';
import Tooltip from './Tooltip.jsx';
import { useTheme } from '../utils/theme.js';
import { track } from '../utils/analytics.js';

/**
 * Sun / moon button in the header that switches light and dark mode.
 * Starts from the system setting; see utils/theme.js.
 */
export default function ThemeToggle() {
  const { dark, toggle } = useTheme();
  const label = dark ? 'Switch to light mode' : 'Switch to dark mode';
  const Icon = dark ? SunIcon : MoonIcon;

  return (
    <Tooltip text={label} placement="bottom">
      <button
        type="button"
        onClick={() => {
          track('theme', { to: dark ? 'light' : 'dark' });
          toggle();
        }}
        aria-label={label}
        className="flex size-9 items-center justify-center rounded-lg text-emerald-50 hover:bg-white/10 focus-visible:outline-white"
      >
        <Icon className="size-5" aria-hidden="true" />
      </button>
    </Tooltip>
  );
}
