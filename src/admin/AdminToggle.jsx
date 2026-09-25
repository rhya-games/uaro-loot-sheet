import { PencilSquareIcon } from '@heroicons/react/24/outline';
import { useAdmin } from './useAdmin.js';

/**
 * Turns admin mode on and off. Sits in the loot page's toolbar (admin mode
 * only changes that page), after Share. Only shown while running
 * `npm run dev`; the published site never has it.
 *
 * Props:
 *   className - the toolbar's button style, so it matches Filters and Share
 */
export default function AdminToggle({ className = '' }) {
  const { available, enabled, setEnabled } = useAdmin();
  if (!available) return null;

  return (
    <button
      type="button"
      onClick={() => setEnabled(!enabled)}
      aria-pressed={enabled}
      className={`${className} ${enabled ? 'border-accent-line bg-accent-soft text-accent' : ''}`}
    >
      <PencilSquareIcon className="size-5" aria-hidden="true" />
      <span className="hidden md:inline">Admin</span>
      <span className="sr-only md:hidden">Admin</span>
    </button>
  );
}
