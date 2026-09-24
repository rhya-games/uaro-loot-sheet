/**
 * Changelog entries shown on the Changelog page, newest first.
 * Format based on "Keep a Changelog" (https://keepachangelog.com).
 *
 * To add an entry, copy this template to the TOP of the list:
 *
 *   {
 *     date: 'YYYY-MM-DD',
 *     title: 'Short summary of this update',
 *     changes: [
 *       { type: 'Added', text: 'Something new.' },
 *       { type: 'Changed', text: 'Something that works differently now.' },
 *       { type: 'Fixed', text: 'Something that was wrong and is now right.' },
 *       { type: 'Removed', text: 'Something that is gone.' },
 *     ],
 *   },
 *
 * `type` must be one of: Added, Changed, Fixed, Removed.
 * Only include the types you need.
 */
export const CHANGE_TYPES = ['Added', 'Changed', 'Fixed', 'Removed'];

export const CHANGELOG = [
  {
    date: '2026-09-24',
    title: 'Repeatable quests',
    changes: [
      {
        type: 'Added',
        text: 'The 15 turn-in items list their repeatable quest, like “x25 Langry Repeatable Quest (each turn-in)”, and are tagged uaRO.',
      },
      {
        type: 'Added',
        text: '248 drops from the hunting-quest monsters and every monster on the repeatable-quest maps (cards, equipment and more). Each note says which monsters drop it.',
      },
      {
        type: 'Changed',
        text: 'New cards start as Vend; the other new drops have no action yet until they’re sorted. Items NPCs sell say NPC.',
      },
      { type: 'Fixed', text: 'Acorn is sold by the Acorn Dealer in Moscovia.' },
      {
        type: 'Added',
        text: 'A Junk action for items nothing uses and nobody pays for, like Unripe Acorn (NPCs won’t buy it either).',
      },
    ],
  },
  {
    date: '2026-09-24',
    title: 'Cooking',
    changes: [
      {
        type: 'Added',
        text: 'All 60 foods (levels 1–10), with their stat bonus. NPCs don’t sell food, so they’re marked Vend.',
      },
      {
        type: 'Added',
        text: 'Ingredients list each food they’re for and what it does, like “x10 Morroc Fruit Wine (+4 INT food)”. Also added: the cookbooks and eight missing ingredients (Bao, Bug Leg, China, Live Coal, Nipper, Scale Shell, Scorpion Claw, Yoyo Tail).',
      },
      { type: 'Changed', text: 'Flame Heart, Mystic Frozen, Rough Wind and Great Nature are tagged Other Quest.' },
      {
        type: 'Fixed',
        text: 'Level 1–5 Cookbooks and the Outdoor and Home Cooking Kits are sold by NPCs in Prontera Castle. The items you trade for the cookbooks list them too.',
      },
      { type: 'Added', text: 'Click an item ID (like #7539) to copy it.' },
      { type: 'Added', text: 'A back to top button appears after you scroll down.' },
      {
        type: 'Changed',
        text: 'The Report Issue flag shows over the Verified column when you point at a row, so the table has more room.',
      },
      { type: 'Fixed', text: 'Filter checkboxes line up with the first line of long labels.' },
    ],
  },
  {
    date: '2026-09-24',
    title: 'Items used by skills',
    changes: [
      {
        type: 'Added',
        text: 'Used For now lists skills that use up an item, like “x1 Warp Portal (each cast)” for Blue Gemstone.',
      },
      {
        type: 'Added',
        text: 'Crafting skills list what they make, like “x30 Falchion (Smith Sword)” for Iron. Pharmacy materials are tagged Brewing.',
      },
      {
        type: 'Fixed',
        text: 'Items no pre-renewal skill uses are no longer tagged Skills (for example, Agate, Citrin and Rose Quartz, which are for the Level 4 weapon quest instead).',
      },
      {
        type: 'Added',
        text: 'The Level 4 weapon quest: which stones and materials each weapon needs (for example, 30 Phlogopite, Pyroxene and Rose Quartz for Longinus’s Spear or Brionac).',
      },
      { type: 'Added', text: 'Rough Elunium and Rough Oridecon: 5 turn into 1 Elunium or Oridecon at the refiner.' },
      {
        type: 'Fixed',
        text: 'Searching an item’s name (like “gold”) no longer fades its Used For list. Search only brings forward uses that match whole words.',
      },
      {
        type: 'Added',
        text: '21 items skills use, including ones NPCs sell (Red Potion, Trap, Medicine Bowl, ninja stones) so you know not to vend them.',
      },
      {
        type: 'Added',
        text: 'Crafted items skills use, like Acid Bottle, Glistening Coat, Embryo and the four Elemental Converters (now named by element).',
      },
      { type: 'Changed', text: 'Bigger, bolder icons, all in the same style and two sizes.' },
      {
        type: 'Added',
        text: 'Flame Heart, Mystic Frozen, Rough Wind and Great Nature: the Utan Shaman in Umbala turns each into 6–10 Red Blood, Crystal Blue, Wind of Verdure or Green Live.',
      },
    ],
  },
  {
    date: '2026-09-24',
    title: 'Which items NPCs sell',
    changes: [
      {
        type: 'Added',
        text: 'NPC Shop for every item, from the emulators’ NPC shops. About 290 items that were blank are now filled in.',
      },
      {
        type: 'Fixed',
        text: 'Items NPCs sell that were marked Vend (for example, Chonchon Doll and Topaz) now say NPC.',
      },
      { type: 'Changed', text: 'Renamed the NPC Sell column to NPC and NPC Buy to NPC Shop. NPC Only shows as ✓.' },
      { type: 'Fixed', text: 'Blood Red is now Red Blood, with its item ID and NPC price.' },
      { type: 'Changed', text: 'Green Apple is sold by the Pet Dealer, so it now says NPC instead of Vend.' },
      { type: 'Changed', text: 'Cotton Tufts is now Cotton Wads, its name in game.' },
      {
        type: 'Changed',
        text: 'New vend prices for Peaked Hat, Phlogopite, Red Herb, Rose Quartz, Valhalla’s Flower and Expanded Token Fragment.',
      },
      {
        type: 'Added',
        text: 'Temporal Crystal, Coagulated Spell, Contaminated Magic, Lever Action Rifle, Hatii Claw and Santa’s Bag, with vend prices.',
      },
      { type: 'Changed', text: 'Grape is sold by the Tool Dealer, so it now shows ✓ under NPC Shop.' },
      { type: 'Added', text: 'Trident, which uaRO’s NPCs no longer sell, so players vend it.' },
      {
        type: 'Fixed',
        text: 'Dimonka headgear quest materials now match the uaRO wiki (for example, Pirate Dagger needs 120 Wooden Heart, not 20).',
      },
      { type: 'Added', text: 'Margaretha Sorin Card (for Mitra) and Errende Ebecee Card (for Love Guard).' },
      { type: 'Added', text: 'Poring Coin now lists the 41 Dimonka headgears it’s used for.' },
      { type: 'Changed', text: 'Long Used For lists show the first 6, with a “+N more” button that opens the full list.' },
      { type: 'Changed', text: 'Filtering by Used For moves the matching use to the front and fades the rest.' },
      { type: 'Added', text: 'A GitHub link in the header and a footer at the bottom of every page.' },
      { type: 'Changed', text: 'Clearer column descriptions, and tooltips wait a moment before showing on hover.' },
      {
        type: 'Fixed',
        text: 'Pet evolution materials now match the uaRO wiki’s Pet System page (for example, Leaf Lunatic needs 250 Clover, not 25).',
      },
      {
        type: 'Added',
        text: '12 pet items: evolution cards and materials (like Airship Part and Young Twig), Earthworm the Dude, and four pet accessories.',
      },
      { type: 'Added', text: 'Beehive Box (Hornet) and Ghost Coffin (Whisper) taming items.' },
      {
        type: 'Changed',
        text: 'Used For is sorted A-Z, and anything you search for moves to the front (search “Headset” and Coal lists Headset first).',
      },
      { type: 'Changed', text: 'Fewer shades of gray text, so dark mode is easier to read.' },
      {
        type: 'Fixed',
        text: 'Official headgear quests now match the pre-renewal quest scripts: 88 missing materials added, and quantities fixed (for example, Mage Hat needs 50 Mould Powder).',
      },
      {
        type: 'Added',
        text: '16 headgear quest items, like Elven Ears, Coronet, Panda Hat and Transparent Celestial Robe.',
      },
      { type: 'Fixed', text: 'Items no official headgear uses are no longer tagged Official Hat Quest.' },
      {
        type: 'Added',
        text: 'Zealotus Mask and Orc Hero Helm materials, and the Cute Ribbon color changes (any Cute Ribbon + a dye).',
      },
      { type: 'Changed', text: 'Headgears use their in-game names: Ayam, Mine Hat, Candle and Teddybear Hat.' },
    ],
  },
  {
    date: '2026-09-23',
    title: 'NPC sell prices from Hercules',
    changes: [
      {
        type: 'Changed',
        text: 'NPC Sell now uses each item’s sell price from the Hercules emulator plus the Overcharge level 10 bonus (+24%), also read from Hercules.',
      },
      { type: 'Added', text: 'NPC Sell prices for 481 items that were blank in the original sheet.' },
      {
        type: 'Added',
        text: 'uaRO’s modified NPC prices (lock icon, no Overcharge) and a ✕ for items NPCs won’t buy, like Poring Coin.',
      },
      {
        type: 'Fixed',
        text: 'NPC Sell prices that didn’t match the game (for example, Blue Feather was missing the Overcharge bonus).',
      },
      {
        type: 'Fixed',
        text: 'Item names that differ in game: Green Dyestuffs is now Darkgreen Dyestuffs, Smokie Doll is Raccoon Doll, and Spiritual Bandage is Miracle Bandage. Clock Hands was a duplicate of Needle of Alarm.',
      },
      { type: 'Removed', text: 'Ghost Coffin and Torn Paper Piece, which couldn’t be found in game.' },
      { type: 'Changed', text: 'NPC Buy shows ✓ or ✕. Vend and Whobuy show ✕ for items NPCs sell.' },
    ],
  },
  {
    date: '2026-09-23',
    title: 'First version of the site (sample entry)',
    changes: [
      { type: 'Added', text: 'Searchable, sortable table of 643 items from the original Google Sheet.' },
      { type: 'Added', text: 'Filters for action, item type, category, and what an item is used for.' },
      { type: 'Added', text: 'Report Issue flag on every item, plus About, Feedback, and Contribute pages.' },
      { type: 'Changed', text: 'Items that NPCs sell are marked NPC instead of Vend or Whobuy.' },
      { type: 'Fixed', text: 'Five items had the wrong item ID (for example, Peaked Hat used Fly Wing’s ID).' },
      { type: 'Removed', text: 'The Junk and Card Recycler actions. Those items now show NPC or Vend.' },
    ],
  },
];
