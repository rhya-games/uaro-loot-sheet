/**
 * Fixes applied by import-csv.mjs on top of the raw Google Sheet export.
 *
 * Item IDs and spellings were checked against the Hercules emulator item
 * database (db/re/item_db.conf and db/pre-re/item_db.conf, "stable" branch):
 * https://github.com/HerculesWS/Hercules
 *
 * These only matter if the CSV is re-imported. Day-to-day edits go
 * straight into src/data/loot.json.
 */

/** Misspelled item names in the sheet: "sheet name" -> "correct name". */
export const RENAMES = {
  'Baphoment Jr Card': 'Baphomet Jr Card',
  'Clock Hands': 'Needle of Alarm', // listed twice; merged on import
  'Fluroscent Liquid': 'Fluorescent Liquid',
  "Loki's Whisper": "Loki's Whispers",
  'Mini Furnance': 'Mini Furnace',
  'Monster Oxygen Max': 'Monster Oxygen Mask',
  'Moth Wing': 'Moth Wings',
  'Pincher of Bettle': 'Pincher of Beetle',
  'Shoulder Protectors': 'Shoulder Protector',
  'Skele Bone': 'Skel-Bone',
  'Skull Helmet': 'Skull Helm',
  'Sticky Posion': 'Sticky Poison',
  'Suspcious Bottle': 'Suspicious Bottle',
  "Tiger's Footksin": "Tiger's Footskin",
  'Witch Starsand': 'Witched Starsand',
  // Names that differ in game.
  'Green Dyestuffs': 'Darkgreen Dyestuffs',
  'Smokie Doll': 'Raccoon Doll',
  'Spiritual Bandage': 'Miracle Bandage',
};

/** Sheet rows to skip: items that couldn't be found in game. */
export const REMOVED = ['Ghost Coffin', 'Torn Paper Piece'];

/**
 * "Used for" targets that were spelled differently in different rows:
 * "sheet text" -> "correct name", or { for, note } to keep extra detail.
 */
export const USE_TARGET_FIXES = {
  'for Little Isis Pet Evolution': 'Little Isis Pet Evolution',
  'new world quest': 'New World Quest',
  'Baophomet Jr Pet Evolution': 'Baphomet Jr Pet Evolution',
  'Diabloic Pet Evolution': 'Diabolic Pet Evolution',
  'Diabolic Pet evolution': 'Diabolic Pet Evolution',
  'Rigid Nightmare Terror Pet evolution': 'Rigid Nightmare Terror Pet Evolution',
  'Finding the Moving Island (Moscovia Dungeon)': 'Finding the Moving Island Quest (Moscovia Dungeon Access)',
  'Finding the Moving Island Quest (Moscovia Dungeon)': 'Finding the Moving Island Quest (Moscovia Dungeon Access)',
  "Wikibine's Black Cat Ears": "Wickebine's Black Cat Ears",
  'Veins Sibling Quest (each try)': { for: 'Veins Siblings Quest', note: 'each try' },
};

/** Actions to rename or merge: "old" -> "new". */
export const ACTION_FIXES = {
  'Card Recycler': 'Vend',
  Junk: 'NPC',
};

/** Misspellings inside the Details text: "wrong" -> "right". */
export const DETAIL_FIXES = {
  Bahpomet: 'Baphomet',
  // Split the sentence from the use so the use is recognized.
  'seasonally. x500 for': 'seasonally, x500 for',
};

/**
 * Sheet categories to rename, merge, or remove: "old" -> [new categories].
 * An empty list removes the category. Categories not listed stay as-is.
 *
 * "Consumable", "Equipment" and "Misc" are not categories anymore; they
 * became the separate `itemType` field (see import-csv.mjs).
 */
export const CATEGORY_FIXES = {
  'Alchemy / Brewing / Potions': ['Brewing'],

  'Skill Use': ['Skills'],
  'Skill Crafting': ['Skills'],
  'Arrow Crafting': ['Skills'],
  'Refining / Ore / Forging': ['Skills'], // Except the refining items below.

  'Pet Taming Item': ['Pet'],
  'Pet Taming Item Ingredient': ['Pet'],
  'Pet Food': ['Pet'],
  'Pet Accessory': ['Pet'],
  'Pet Evolution': ['Pet Evolution', 'Pet', 'uaRO'],

  // Server-specific content is also tagged "uaRO".
  'Server Hat Quest': ['Server Hat Quest', 'uaRO'],
  'Repeatable Quest': ['Repeatable Quest', 'uaRO'],
  'Server Currency': ['uaRO'],
  'Server Quest Crafting': ['uaRO'],
  'Event Item Currency': ['uaRO'],

  'Valuable Consumable': [],
  Consumable: [],
  Equipment: [],
  Gear: [],
  Misc: [],
};

/** Refining items: they drop "Refining / Ore / Forging" without becoming Skills. */
export const REFINING_ONLY = ['Elunium', 'Rough Elunium', 'Rough Oridecon'];

/**
 * Item IDs to set, keyed by the (corrected) item name.
 * Overrides whatever the sheet had.
 */
export const ITEM_IDS = {
  // Wrong IDs in the sheet (they belonged to other items).
  Bacillus: 7119, // was 581 (Edible Mushroom)
  Yam: 549, // was 529 (Candy)
  'Horn of Hillslion': 6032, // was 6023 (Mystic Horn)
  'Peaked Hat': 6021, // was 601 (Fly Wing)
  'Big Ribbon [0]': 2244, // was 224 (doesn't exist)

  // Missing in the sheet. Where several IDs share a name, the base
  // item is used rather than its "_C" variant.
  'Angel Wing [0]': 2254,
  'Angel Wing Ears [0]': 5074,
  'Apple of Archer [0]': 2285,
  'Bandana [0]': 2211,
  'Baphomet Jr Card': 4129,
  'Blush [0]': 5040,
  'Bomb Wick [0]': 2279,
  'Bone Helm [1]': 5162,
  'Candle [0]': 5028,
  'Cap [0]': 2226,
  'Cap [1]': 2227,
  "Celebrant's Mitten [0]": 2617,
  'Chain [3]': 1520,
  'Cigarette [0]': 2267,
  'Circlet [1]': 2233,
  'Cookie Bat': 11605,
  'Cotton Tufts': 25233,
  'Crown [0]': 2235,
  'Cultish Masque': 1045,
  'Cursed Ruby': 724,
  'Cursed Seal': 7442,
  'Drooping Cat [0]': 5058,
  'Egg Shell [0]': 5015,
  'Eggring Card': 4659,
  'Evil Wing Ears [0]': 5068,
  'Fang of Garm / Fang of Hatii': 7036,
  'Gangster Mask [0]': 2265,
  'Golden Earring': 10022,
  'Grandpa Beard': 2241,
  'Guitar [0]': 1907,
  'Halo [0]': 2282,
  'Hat [1]': 2221,
  'Headset [0]': 5001,
  'Helm [1]': 2229,
  "Loki's Whispers": 7019,
  'Luxurious Pet Food': 25377,
  'Magician Hat [0]': 5045,
  'Majestic Goat [0]': 2256,
  'Majestic Goat [1]': 5160,
  'Marionette Doll [1]': 5141,
  'Mini Furnace': 612,
  'Monster Oxygen Mask': 10002,
  'Moth Wings': 1058,
  'Nut Shell [0]': 5037,
  'Old Magic Book': 1006,
  'Opera Masque [0]': 2281,
  'Orcish Sword [0]': 1124,
  'Puppy Headband [0]': 5118,
  'Red Bandana [0]': 2275,
  'Romantic Flower [0]': 2269,
  'Romantic Gent [0]': 2247,
  'Rosary [0]': 2608,
  'Safety Helmet [0]': 5009,
  'Sakkat [0]': 2280,
  'Santa Hat [0]': 2236,
  'Sap Jelly': 23187,
  'Shoulder Protector': 7196,
  'Skel-Bone': 932,
  'Skull Helm': 10001,
  'Small Doll Needle': 23189,
  'Straw Hat [0]': 5062,
  'Suspicious Bottle': 25231,
  "Tiger's Footskin": 1030,
  'Western Grace [0]': 2248,

  // Renewal items that aren't in Hercules; IDs from rAthena's renewal database.
  'Delicious Meat': 11616,
  "Old Tree's Dew": 23257,
  'Sweets Festival Coin': 25290,

  // uaRO names or custom items (the emulators use a different name, or
  // use the ID for another item).
  'Miracle Bandage': 23256,
  'Scatleton Memory': 25408,
};
