/**
 * The item's 24x24 game icon (public/items/, filled by `npm run sync:icons`).
 * Every card shares one picture, like in the game. The icon is decoration:
 * the name is always next to it, so it has no alt text. If a file is missing
 * the picture hides but keeps its space, so names still line up.
 *
 * Props:
 *   item - one entry from src/data/loot.json
 */
export default function ItemIcon({ item }) {
  const file = item.categories.includes('Card') ? 'card.gif' : `item${item.itemId}.gif`;
  return (
    <img
      src={`${import.meta.env.BASE_URL}items/${file}`}
      alt=""
      width={24}
      height={24}
      loading="lazy"
      decoding="async"
      // Keeps the 24px pixels crisp on high-density screens.
      className="size-6 shrink-0 [image-rendering:pixelated]"
      onError={(event) => {
        event.currentTarget.style.visibility = 'hidden';
      }}
    />
  );
}
