/**
 * Site-wide links and settings. Edit these here; the rest of the app reads them.
 */

/** The GitHub repository for this project. */
export const GITHUB_REPO_URL = 'https://github.com/rhya-ragnarok/uaro-loot-sheet';

/**
 * Where players can reach you on Discord (a server invite or profile link).
 * Set to null to hide Discord links.
 *
 * TODO: add the real Discord link.
 */
export const DISCORD_URL = null;

/** Name of the issue form in .github/ISSUE_TEMPLATE/ used for item reports. */
const ITEM_REPORT_TEMPLATE = 'item-report.yml';

/**
 * Link to a new GitHub issue for one item, with the item already filled in.
 * GitHub issue forms fill a field when its id is passed in the URL:
 * https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/creating-an-issue#creating-an-issue-from-a-url-query
 */
export function itemReportUrl(item) {
  const itemText = item.itemId ? `${item.name} (#${item.itemId})` : item.name;
  const params = new URLSearchParams({
    template: ITEM_REPORT_TEMPLATE,
    title: `[Item] ${item.name}`,
    item: itemText,
  });
  return `${GITHUB_REPO_URL}/issues/new?${params}`;
}

/** Link to a new GitHub issue that isn't about one item (bugs, ideas, ...). */
export const GENERAL_ISSUE_URL = `${GITHUB_REPO_URL}/issues/new/choose`;
