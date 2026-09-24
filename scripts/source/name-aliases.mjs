/**
 * Names the uaRO wiki (or the emulators) use for items that the sheet
 * lists under a different, in-game name: "other name" -> "sheet name".
 *
 * Used by scripts/check-uses.mjs when comparing wiki tables with the sheet.
 * Add to this when a comparison reports an item "not in the sheet" that
 * actually is, under another name.
 */
export const NAME_ALIASES = {
  'Spiritual Bandage': 'Miracle Bandage',
  'Blood Red': 'Red Blood',
  'Cotton Tufts': 'Cotton Wads',
  'Bapho Jr Card': 'Baphomet Jr Card',
  "Loki's Whisper": "Loki's Whispers",
  'Side Winder Card': 'Sidewinder Card',
  'Four-Leaf Clover': 'Four Leaf Clover',
  'Skull Helmet': 'Skull Helm',
  'Girl Doll': "Girl's Doll",
  'Rune of the Darkness': 'Rune of Darkness',
  'Old Magicbook': 'Old Magic Book',
  'Majestic Goat': 'Majestic Goat [0]',
  'Fit Pipe': 'Ghost Coffin',
};

/** "Used For" names the wiki writes differently: "wiki name" -> "sheet name". */
export const TARGET_ALIASES = {
  'Glaris Doll Hat [1]': 'Glaris Doll',
  'Defolty Doll Hat [1]': 'Defolty Doll',
  'Bacsojin/White Lady': 'Bacsojin Pet Evolution',
  'Chaotic Bapho Jr': 'Chaotic Baphomet Jr Pet Evolution',
};
