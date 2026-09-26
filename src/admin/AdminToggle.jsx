import { ClipboardDocumentListIcon, PencilSquareIcon, TagIcon } from '@heroicons/react/24/outline';
import { ROUTES } from '../utils/route.js';
import { useAdmin } from './useAdmin.js';

/**
 * Turns admin mode on and off. Sits in the loot page's toolbar (admin mode
 * only changes that page), after Share. Only shown while running
 * `npm run dev`; the published site never has it. While it's on, a
 * Queues link opens the work queues, and a Targets link opens the page for
 * "Used For" target values.
 *
 * Props:
 *   className - the toolbar's button style, so it matches Filters and Share
 */
export default function AdminToggle({ className = '' }) {
  const { available, enabled, setEnabled } = useAdmin();
  if (!available) return null;

  return (
    <>
      {enabled && (
        <a href={ROUTES.admin} className={className}>
          <ClipboardDocumentListIcon className="size-5" aria-hidden="true" />
          <span className="hidden md:inline">Queues</span>
          <span className="sr-only md:hidden">Queues</span>
        </a>
      )}
      {enabled && (
        <a href={ROUTES.targets} className={className}>
          <TagIcon className="size-5" aria-hidden="true" />
          <span className="hidden md:inline">Targets</span>
          <span className="sr-only md:hidden">Targets</span>
        </a>
      )}
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
    </>
  );
}
