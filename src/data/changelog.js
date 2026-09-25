/**
 * Changelog entries shown on the Changelog page, newest first.
 * Format based on "Keep a Changelog" (https://keepachangelog.com).
 *
 * To add an entry, copy this template to the TOP of the list:
 *
 *   {
 *     version: '0.3.0',
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
 *
 * One entry per day: add to today's entry if there already is one.
 *
 * Versions follow Semantic Versioning (https://semver.org), except that the
 * site stays at 0.x until its first real release (1.0.0):
 *   - something new or changed (a feature, new data): raise the middle
 *     number and reset the last (0.2.3 -> 0.3.0)
 *   - only fixes: raise the last number (0.3.0 -> 0.3.1)
 * Set the same version in package.json (npm run validate checks). Merging
 * to main publishes a GitHub release with that version and these notes.
 */
export const CHANGE_TYPES = ['Added', 'Changed', 'Fixed', 'Removed'];

export const CHANGELOG = [
  {
    version: '0.2.0',
    date: '2026-09-24',
    title: 'Lots more loot, suggested actions, and sharing',
    changes: [
      {
        type: 'Added',
        text: 'Version numbers: each day’s changes share one, shown here, at the bottom of every page, and as a release on GitHub.',
      },
      { type: 'Added', text: 'The filter panel shows how many filters are on, next to its title.' },
      { type: 'Added', text: 'When nothing matches, the list says why and offers Clear search or Clear filters.' },
      {
        type: 'Added',
        text: 'Official quests in “Used For” on 52 items: job change quests (like x5 Talon for Rogue), the Sign quest, Nameless Island, Episode 13, town quests, ninja and gunslinger gear, and the Valkyrie Helm. Weapons that only need to be carried (to break the Sign seal, or any whip for the Zealotus Mask) say “not used up”.',
      },
      { type: 'Added', text: 'Barren Trunk, for the Archer job quest.' },
      {
        type: 'Changed',
        text: '“Uncategorized” is now “No Use”: we checked, and nothing uses these 246 items. New items start as “Not Reviewed” (dashed) until someone checks them.',
      },
      { type: 'Added', text: 'A loot bag icon, in the browser tab and next to the site name.' },
      {
        type: 'Added',
        text: 'The El Dicastes daily quest in “Used For” on the 9 items it can ask for (one request at a time), like x100 Apple and x26 Fluorescent Liquid. Pineapple and Melon are new.',
      },
      { type: 'Added', text: 'Shared links show the site’s name and a short description in chat apps.' },
      { type: 'Changed', text: 'Typing in the search box feels instant, even with the whole list showing.' },
      { type: 'Fixed', text: 'Checkboxes have a white check, and keyboard focus rings are never cut off or covered.' },
      {
        type: 'Changed',
        text: 'On wide screens the filter panel starts at the top with its own close button and shows the item count. Filter chips show above the table when the panel is closed (or floating on smaller screens), and adding a filter no longer pushes the table down.',
      },
      {
        type: 'Changed',
        text: 'Skills in “Used For” use the names players know, like Potion Pitcher (was Aid Potion), Slim Potion Pitcher, Chemical Protection, Pharmacy (was Prepare Potion), Graffiti and Abracadabra.',
      },
      {
        type: 'Added',
        text: 'Share, next to the search box: the address holds your search, filters and sort, so a link opens the same view. On phones it opens your share menu; on computers it copies the link.',
      },
      {
        type: 'Added',
        text: 'Your last search, filters and sort come back on your next visit. Clear all starts fresh.',
      },
      { type: 'Added', text: 'On wide screens, the filter panel stays open or closed the way you left it.' },
      {
        type: 'Changed',
        text: '“I don’t keep items” is now “I keep items for”: tick the things you do (hats, pets, cooking, crafting and skills, quests). Items you’d only keep for the others show how to sell them instead.',
      },
      {
        type: 'Changed',
        text: 'Vend and Whobuy tell three things apart: ✕ can’t be sold that way (Whobuy on cards and equipment, for one), None means nobody was buying or selling when checked, and — means not checked yet.',
      },
      {
        type: 'Changed',
        text: 'Ingredients only used for level 1–3 cooking aren’t marked Keep any more, like Banana and Yoyo Tail.',
      },
      { type: 'Fixed', text: 'Every card says Vend. Armeyer Dinze Card said NPC.' },
      {
        type: 'Changed',
        text: 'Pet accessories are equipment, and each one says which pet wears it. The ones worth under 5,000z that nothing else uses are Junk, like Afro and Backpack.',
      },
      {
        type: 'Added',
        text: 'The 15 turn-in items list their repeatable quest, like “x25 Langry Repeatable Quest (each turn-in)”, and are tagged uaRO.',
      },
      {
        type: 'Added',
        text: '248 drops from the hunting-quest monsters and every monster on the repeatable-quest maps (cards, equipment and more).',
      },
      {
        type: 'Changed',
        text: 'New cards start as Vend; the other new drops have no action yet until they’re sorted. Items NPCs sell say NPC.',
      },
      { type: 'Fixed', text: 'Acorn is sold by the Acorn Dealer in Moscovia.' },
      {
        type: 'Changed',
        text: '“Used For” only says what an item is for. Notes about which monsters drop an item are gone.',
      },
      { type: 'Fixed', text: 'Three pet cards listed Bacsojin’s evolution twice, once misspelled.' },
      {
        type: 'Added',
        text: '52 drops from uaRO’s renewal monsters (Scarabas, Queen Scaraba, Hillslion, Tatacho, Centipede, Bradium Golem, Naga, Cornus, Nepenthes, Dolomedes, Luciola Vespa and more), checked in game.',
      },
      {
        type: 'Changed',
        text: 'Meteo Plate Armor is now Meteor Plate, and Small Bottle is Small Water Bottle, their names in game.',
      },
      {
        type: 'Added',
        text: 'A Junk action for items nothing uses and nobody pays for, like Unripe Acorn (NPCs won’t buy it either).',
      },
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
      {
        type: 'Changed',
        text: 'Long Used For lists show the first 6, with a “+N more” button that opens the full list.',
      },
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
    version: '0.1.0',
    date: '2026-09-23',
    title: 'First version of the site',
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
      { type: 'Added', text: 'Searchable, sortable table of 643 items from the original Google Sheet.' },
      { type: 'Added', text: 'Filters for action, item type, category, and what an item is used for.' },
      { type: 'Added', text: 'Report Issue flag on every item, plus About, Feedback, and Contribute pages.' },
      { type: 'Changed', text: 'Items that NPCs sell are marked NPC instead of Vend or Whobuy.' },
      { type: 'Fixed', text: 'Five items had the wrong item ID (for example, Peaked Hat used Fly Wing’s ID).' },
      { type: 'Removed', text: 'The Junk and Card Recycler actions. Those items now show NPC or Vend.' },
    ],
  },
];
