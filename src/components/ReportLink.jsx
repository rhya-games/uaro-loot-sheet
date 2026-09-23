import { itemReportUrl } from '../config.js';

/**
 * Small "Report" link that opens a GitHub issue form (new tab) with this
 * item already filled in. See .github/ISSUE_TEMPLATE/item-report.yml.
 *
 * Props:
 *   item - one entry from loot.json
 */
export default function ReportLink({ item }) {
  return (
    <a
      href={itemReportUrl(item)}
      target="_blank"
      rel="noopener noreferrer"
      title={`Report a problem with ${item.name}`}
      className="text-gray-600 underline decoration-gray-400 underline-offset-2 hover:text-emerald-800 hover:decoration-emerald-800"
    >
      Report
      <span className="sr-only"> a problem with {item.name} (opens GitHub in a new tab)</span>
    </a>
  );
}
