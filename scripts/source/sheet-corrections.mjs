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
};

/** Misspellings inside the Details text: "wrong" -> "right". */
export const DETAIL_FIXES = {
  Bahpomet: 'Baphomet',
};

/** Categories to replace: "old" -> "new". */
export const CATEGORY_FIXES = {
  Gear: 'Equipment', // Only used once (Crystal Pumps); same meaning as Equipment.
};

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
};
