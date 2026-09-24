import { PencilSquareIcon } from '@heroicons/react/24/outline';
import { useAdmin } from './AdminContext.jsx';

/**
 * Header button that turns admin mode on and off. Only shown while running
 * `npm run dev`; the published site never has it.
 */
export default function AdminToggle() {
  const { available, enabled, setEnabled } = useAdmin();
  if (!available) return null;

  return (
    <button
      type="button"
      onClick={() => setEnabled(!enabled)}
      aria-pressed={enabled}
      className={`flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium focus-visible:outline-white ${
        enabled ? 'bg-white text-header' : 'text-emerald-50 hover:bg-white/10'
      }`}
    >
      <PencilSquareIcon className="size-4" aria-hidden="true" />
      Admin
    </button>
  );
}
