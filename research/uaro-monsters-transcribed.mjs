/**
 * Monster info transcribed by hand from in-game @mi screenshots on uaRO
 * (2026-09-24, two batches). These are renewal monsters uaRO added; their drops differ
 * from the emulators (every one drops Poring Coin, most drop Expanded Token
 * Fragment).
 *
 * Run `node research/build-monsters.mjs` to turn this into
 * research/uaro-monsters.json with item IDs filled in.
 *
 * Drops are [item name as shown in game, chance in %].
 */
export const SOURCE = 'In-game @mi screenshots on uaRO, 2026-09-24';

export const MONSTERS = [
  {
    id: 2086, name: 'Rake Scaraba', sprite: 'RAKE_SCARABA', mvp: false,
    level: 111, hp: 54094, baseExp: 81090, jobExp: 97340, hit: 220, flee: 158, def: 63, mdef: 23,
    stats: { str: 1, agi: 47, vit: 74, int: 52, dex: 109, luk: 66 },
    atk: [5361, 5521], range: 1, size: 'Medium', race: 'Insect', element: 'Earth', elementLevel: 2,
    drops: [['Poring Coin', 5], ['Rake Horn Helm', 32.5], ['Expanded Token Fragment', 3], ['Green Live', 2.5], ['Apple', 1], ['Bone Plate [1]', 0.1], ['Scaraba Card', 0.05]],
  },
  {
    id: 2087, name: 'Queen Scaraba', sprite: 'QUEEN_SCARABA', mvp: true, mvpBonusExp: 375000,
    level: 112, hp: 1304459, baseExp: 750000, jobExp: 312500, hit: 298, flee: 158, def: 29, mdef: 25,
    stats: { str: 55, agi: 46, vit: 28, int: 96, dex: 186, luk: 131 },
    atk: [4236, 5259], range: 3, size: 'Large', race: 'Insect', element: 'Earth', elementLevel: 3,
    drops: [['Poring Coin', 3], ["Piece of Queen's Wing", 35.01], ['Alca Bringer', 15], ['Meteor Plate [1]', 15], ['Chrome Metal Two-Handed Sword', 6], ['Zelunium', 1.5], ['Queen Scaraba Card', 0.01]],
  },
  {
    id: 2084, name: 'Two-Horned Scaraba', sprite: 'HORN_SCARABA2', mvp: false,
    level: 106, hp: 41735, baseExp: 63040, jobExp: 33890, hit: 227, flee: 154, def: 41, mdef: 11,
    stats: { str: 5, agi: 48, vit: 71, int: 26, dex: 121, luk: 51 },
    atk: [2437, 3684], range: 1, size: 'Small', race: 'Insect', element: 'Earth', elementLevel: 1,
    drops: [['Poring Coin', 5], ['Twin Horn Helm', 32.5], ['Expanded Token Fragment', 3], ['Elder Branch', 2.5], ['Green Live', 2.5], ['Forbidden Grimoire [1]', 0.05], ['Scaraba Card', 0.05]],
  },
  {
    id: 2085, name: 'Antler Scaraba', sprite: 'ANTLER_SCARABA', mvp: false,
    level: 108, hp: 61268, baseExp: 143910, jobExp: 45250, hit: 207, flee: 203, def: 35, mdef: 18,
    stats: { str: 6, agi: 95, vit: 29, int: 108, dex: 99, luk: 27 },
    atk: [2716, 5016], range: 1, size: 'Medium', race: 'Insect', element: 'Earth', elementLevel: 2,
    drops: [['Poring Coin', 5], ['Antler Helm', 32.5], ['Expanded Token Fragment', 3], ['Ghost Whisper [1]', 0.05], ['Elder Branch', 2.5], ['Green Live', 2.5], ['Scaraba Card', 0.05]],
  },
  {
    id: 2083, name: 'One-Horned Scaraba', sprite: 'HORN_SCARABA', mvp: false,
    level: 102, hp: 28480, baseExp: 51170, jobExp: 25130, hit: 197, flee: 152, def: 30, mdef: 5,
    stats: { str: 3, agi: 50, vit: 47, int: 6, dex: 95, luk: 36 },
    atk: [1538, 1756], range: 1, size: 'Small', race: 'Insect', element: 'Earth', elementLevel: 1,
    drops: [['Poring Coin', 5], ['Single Horn Helm', 32.5], ['Expanded Token Fragment', 3], ['Imperial Spear [1]', 0.1], ['Elder Branch', 2.5], ['Green Live', 2.5], ['Scaraba Card', 0.05]],
  },
  {
    id: 1989, name: 'Hillslion', sprite: 'HILLSRION', mvp: false,
    level: 105, hp: 34600, baseExp: 103800, jobExp: 60550, hit: 220, flee: 165, def: 28, mdef: 15,
    stats: { str: 105, agi: 60, vit: 30, int: 15, dex: 115, luk: 5 },
    atk: [5000, 5500], range: 1, size: 'Small', race: 'Beast', element: 'Earth', elementLevel: 1,
    drops: [['Poring Coin', 5], ['Expanded Token Fragment', 3], ['Sprint Shoes [1]', 0.5], ['Horn of Hillslion [3]', 1], ['Horn of Hillslion', 100], ['Fur', 100], ['Wild Beast Claw [1]', 0.5], ['Soft Feather', 6], ['Brigan', 100], ['Hillslion Card', 0.05]],
  },
  {
    id: 1986, name: 'Tatacho', sprite: 'TATACHO', mvp: false,
    level: 106, hp: 39500, baseExp: 118500, jobExp: 69125, hit: 221, flee: 146, def: 20, mdef: 17,
    stats: { str: 106, agi: 40, vit: 30, int: 25, dex: 115, luk: 6 },
    atk: [10000, 11000], range: 2, size: 'Medium', race: 'Beast', element: 'Earth', elementLevel: 1,
    drops: [['Poring Coin', 5], ['Expanded Token Fragment', 3], ['Lunakaligo [3]', 1], ['Cello [3]', 0.5], ['Fur', 100], ['Peaked Hat', 100], ['Fresh Fish', 100], ['Potato', 100], ['Tatacho Card', 0.05]],
  },
  {
    id: 1987, name: 'Centipede', sprite: 'CENTIPEDE', mvp: false,
    level: 110, hp: 45662, baseExp: 136985, jobExp: 79910, hit: 241, flee: 153, def: 40, mdef: 25,
    stats: { str: 112, agi: 43, vit: 30, int: 5, dex: 131, luk: 12 },
    atk: [15000, 16000], range: 2, size: 'Medium', race: 'Insect', element: 'Poison', elementLevel: 2,
    drops: [['Poring Coin', 5], ['Expanded Token Fragment', 3], ['Cold Heart', 0.1], ['Black Cat', 0.1], ['Cursed Lyre [1]', 0.5], ['Bug Leg', 100], ['Zargon', 100], ['Worm Peeling', 100], ['Solid Shell', 100], ['Centipede Card', 0.05]],
  },
  {
    id: 1999, name: 'Centipede Larva', sprite: 'CENTIPEDE_LARVA', mvp: false,
    level: 80, hp: 12000, baseExp: 18000, jobExp: 24000, hit: 155, flee: 113, def: 20, mdef: 20,
    stats: { str: 80, agi: 33, vit: 15, int: 3, dex: 75, luk: 10 },
    atk: [948, 1115], range: 2, size: 'Small', race: 'Insect', element: 'Poison', elementLevel: 1,
    drops: [['Poring Coin', 5], ['Expanded Token Fragment', 3], ['Boots [1]', 0.45], ['3carat Diamond', 2.5], ['Bug Leg', 100], ['Zargon', 100], ['Worm Peeling', 100], ['Solid Shell', 100], ['Centipede Larva Card', 0.05]],
  },
  {
    id: 2024, name: 'Bradium Golem', sprite: 'BRADIUM_GOLEM', mvp: false,
    level: 101, hp: 45200, baseExp: 70000, jobExp: 94600, hit: 161, flee: 111, def: 78, mdef: 22,
    stats: { str: 1, agi: 10, vit: 82, int: 25, dex: 60, luk: 12 },
    atk: [12000, 13000], range: 1, size: 'Large', race: 'Formless', element: 'Earth', elementLevel: 2,
    drops: [['Poring Coin', 5], ['Expanded Token Fragment', 3], ['Stone Fragment', 100], ['Stone Heart', 100], ['Refined Bradium', 25], ['Bradium Shield [1]', 0.5], ['Bradium Brooch [1]', 0.05]],
  },
  {
    id: 1993, name: 'Naga', sprite: 'NAGA', mvp: false,
    level: 111, hp: 46708, baseExp: 151800, jobExp: 81740, hit: 233, flee: 153, def: 38, mdef: 15,
    stats: { str: 113, agi: 42, vit: 30, int: 108, dex: 122, luk: 13 },
    atk: [8000, 8800], range: 3, size: 'Large', race: 'Beast', element: 'Earth', elementLevel: 2,
    drops: [['Poring Coin', 5], ['Expanded Token Fragment', 3], ['Armor of Naga [1]', 0.5], ['Shield of Naga [1]', 0.5], ['Battle Fork [4]', 0.5], ['Snake Scale', 100], ['Scale Shell', 100], ['Shining Scale', 100], ['Pike [4]', 1]],
  },
  {
    id: 1992, name: 'Cornus', sprite: 'CORNUS', mvp: false,
    level: 108, hp: 41220, baseExp: 154270, jobExp: 22135, hit: 213, flee: 153, def: 35, mdef: 80,
    stats: { str: 110, agi: 45, vit: 80, int: 200, dex: 105, luk: 10 },
    atk: [12000, 13000], range: 2, size: 'Medium', race: 'Beast', element: 'Holy', elementLevel: 3,
    drops: [['Poring Coin', 5], ['Expanded Token Fragment', 3], ['Sprint Mail [1]', 0.5], ['Angelic Ring', 0.05], ['Mystic Horn', 100], ['Soft Feather', 100], ['Horseshoe', 100], ['Unicorn Horn', 0.1], ['Long Horn [1]', 0.05], ['Cornus Card', 0.05]],
  },
  {
    id: 2017, name: 'Rata', sprite: 'RATA', mvp: false,
    level: 107, hp: 216600, baseExp: 350060, jobExp: 170000, hit: 206, flee: 158, def: 32, mdef: 52,
    stats: { str: 1, agi: 51, vit: 22, int: 132, dex: 99, luk: 15 },
    atk: [8000, 15000], range: 1, size: 'Medium', race: 'Demi-Human', element: 'Earth', elementLevel: 3,
    drops: [['Poring Coin', 5], ['Unripe Acorn', 100], ['Acorn', 100], ['Dark Piece', 25], ['Veteran Hammer [2]', 5]],
  },
  {
    id: 1995, name: 'Pinguicula', sprite: 'PINGUICULA', mvp: false,
    level: 80, hp: 13680, baseExp: 34200, jobExp: 17100, hit: 166, flee: 103, def: 25, mdef: 5,
    stats: { str: 102, agi: 23, vit: 30, int: 10, dex: 86, luk: 2 },
    atk: [600, 720], range: 1, size: 'Medium', race: 'Plant', element: 'Earth', elementLevel: 3,
    drops: [['Poring Coin', 5], ['Expanded Token Fragment', 3], ['Pinguicula Corsage [1]', 0.05], ['Whip of Balance [3]', 0.5], ['Romantic Leaf', 0.5], ['Sharp Leaf', 100], ['Huge Leaf', 100], ['Brown Root', 100], ['Flower', 50]],
  },
  {
    id: 2015, name: 'Dark Pinguicula', sprite: 'PINGUICULA_D', mvp: false,
    level: 83, hp: 8780, baseExp: 38700, jobExp: 26000, hit: 172, flee: 106, def: 15, mdef: 5,
    stats: { str: 1, agi: 23, vit: 22, int: 12, dex: 89, luk: 2 },
    atk: [600, 1450], range: 1, size: 'Medium', race: 'Plant', element: 'Poison', elementLevel: 2,
    drops: [['Poring Coin', 5], ['Expanded Token Fragment', 3], ['Sharp Leaf', 100], ['Huge Leaf', 100], ['Brown Root', 100], ['Karvodailnirol', 0.5], ['Withered Flower', 50]],
  },
  {
    id: 2013, name: 'Draco', sprite: 'DRACO', mvp: false,
    level: 82, hp: 18300, baseExp: 30500, jobExp: 20500, hit: 144, flee: 105, def: 10, mdef: 5,
    stats: { str: 1, agi: 23, vit: 30, int: 34, dex: 62, luk: 2 },
    atk: [410, 710], range: 1, size: 'Medium', race: 'Dragon', element: 'Earth', elementLevel: 1,
    drops: [['Poring Coin', 5], ['Expanded Token Fragment', 3], ["Dragon's Mane", 100], ['Dragon Skin', 5], ['Dragon Canine', 5], ['Dragon Tail', 50], ['Dragon Scale', 50], ['Honey', 25], ['Draco Card', 0.05]],
  },
  {
    id: 2014, name: 'Draco Egg', sprite: 'DRACO_EGG', mvp: false,
    level: 67, hp: 9822, baseExp: 6000, jobExp: 8000, hit: 68, flee: 68, def: 56, mdef: 40,
    stats: { str: 1, agi: 1, vit: 56, int: 34, dex: 1, luk: 63 },
    atk: [1, 2], range: 0, size: 'Medium', race: 'Dragon', element: 'Earth', elementLevel: 4,
    drops: [['Poring Coin', 5], ['Piece of Egg Shell', 100], ['Egg Shell', 1]],
  },
  {
    id: 1988, name: 'Nepenthes', sprite: 'NEPENTHES', mvp: false,
    level: 76, hp: 10350, baseExp: 25875, jobExp: 12935, hit: 141, flee: 96, def: 25, mdef: 10,
    stats: { str: 75, agi: 20, vit: 30, int: 5, dex: 65, luk: 5 },
    atk: [415, 565], range: 7, size: 'Medium', race: 'Plant', element: 'Poison', elementLevel: 2,
    drops: [['Poring Coin', 5], ['Expanded Token Fragment', 3], ['Mandragora Cap [1]', 0.05], ['Stem of Nepenthes [2]', 0.05], ['Harp of Nepenthes [2]', 0.05], ['Nepenthes Bow [2]', 0.05], ['Strong Vine', 100], ['Green Live', 2.5], ['Stem', 100]],
  },
  {
    id: 2092, name: 'Dolomedes', sprite: 'DOLOMEDES', mvp: false,
    level: 104, hp: 72253, baseExp: 132620, jobExp: 84270, hit: 228, flee: 141, def: 44, mdef: 17,
    stats: { str: 12, agi: 37, vit: 56, int: 55, dex: 124, luk: 46 },
    atk: [3604, 6563], range: 3, size: 'Large', race: 'Insect', element: 'Water', elementLevel: 3,
    drops: [['Poring Coin', 5], ['Small Bradium', 75], ['White Spider Limb', 25], ['Expanded Token Fragment', 3], ['Refined Bradium', 12.5], ['Bradium', 12.5], ['Dolomedes Card', 0.05]],
  },
  {
    id: 2018, name: 'Duneyrr', sprite: 'DUNEYRR', mvp: false,
    level: 107, hp: 265100, baseExp: 415150, jobExp: 260000, hit: 212, flee: 167, def: 39, mdef: 35,
    stats: { str: 1, agi: 60, vit: 45, int: 89, dex: 105, luk: 15 },
    atk: [16000, 19000], range: 1, size: 'Medium', race: 'Demi-Human', element: 'Earth', elementLevel: 3,
    drops: [['Poring Coin', 5], ['Carrot', 100], ['Fur', 100], ['Dark Piece', 25], ['Eye Stone Ring [1]', 0.05], ['Veteran Sword [1]', 0.5], ['Veteran Axe [2]', 5]],
  },
  {
    id: 2016, name: 'Aqua Elemental', sprite: 'AQUA_ELEMENTAL', mvp: false,
    level: 83, hp: 33220, baseExp: 27150, jobExp: 76500, hit: 160, flee: 106, def: 8, mdef: 12,
    stats: { str: 1, agi: 23, vit: 19, int: 87, dex: 77, luk: 2 },
    atk: [400, 1600], range: 1, size: 'Large', race: 'Formless', element: 'Water', elementLevel: 4,
    drops: [['Poring Coin', 5], ['Expanded Token Fragment', 3], ['Crystalized Teardrop', 50], ['Fluorescent Liquid', 100], ['Small Water Bottle', 5], ['Aqua Elemental Card', 0.05]],
  },
  {
    id: 2089, name: 'Two-Horned Scaraba Egg', sprite: 'HORN_SCARABA2_EGG', mvp: false,
    level: 98, hp: 11113, baseExp: 13000, jobExp: 14130, hit: 99, flee: 99, def: 36, mdef: 27,
    stats: { str: 1, agi: 1, vit: 54, int: 17, dex: 1, luk: 51 },
    atk: [1, 1], range: 0, size: 'Small', race: 'Insect', element: 'Neutral', elementLevel: 1,
    drops: [['Poring Coin', 5], ['Piece of Egg Shell', 50], ['Honey', 2.5], ['Elunium', 0.25]],
  },
  {
    id: 2088, name: 'One-Horned Scaraba Egg', sprite: 'HORN_SCARABA_EGG', mvp: false,
    level: 97, hp: 56432, baseExp: 13000, jobExp: 11450, hit: 98, flee: 98, def: 33, mdef: 24,
    stats: { str: 1, agi: 1, vit: 54, int: 12, dex: 1, luk: 51 },
    atk: [1, 1], range: 0, size: 'Small', race: 'Insect', element: 'Neutral', elementLevel: 1,
    drops: [['Poring Coin', 5], ['Piece of Egg Shell', 50], ['Honey', 2.5], ['Elunium', 0.25]],
  },
  {
    id: 2091, name: 'Rake Scaraba Egg', sprite: 'RAKE_SCARABA_EGG', mvp: false,
    level: 100, hp: 7072, baseExp: 13000, jobExp: 15995, hit: 101, flee: 101, def: 42, mdef: 19,
    stats: { str: 1, agi: 1, vit: 54, int: 14, dex: 1, luk: 51 },
    atk: [1, 1], range: 0, size: 'Small', race: 'Insect', element: 'Neutral', elementLevel: 1,
    drops: [['Poring Coin', 5], ['Piece of Egg Shell', 50], ['Honey', 2.5], ['Elunium', 0.25], ['Imperial Guard [1]', 0.05]],
  },
  {
    id: 2090, name: 'Antler Scaraba Egg', sprite: 'ANTLER_SCARABA_EGG', mvp: false,
    level: 99, hp: 69000, baseExp: 13000, jobExp: 9590, hit: 100, flee: 100, def: 34, mdef: 42,
    stats: { str: 1, agi: 1, vit: 79, int: 30, dex: 1, luk: 51 },
    atk: [1, 1], range: 0, size: 'Small', race: 'Insect', element: 'Neutral', elementLevel: 1,
    drops: [['Poring Coin', 5], ['Piece of Egg Shell', 50], ['Honey', 2.5], ['Elunium', 0.25]],
  },
  {
    id: 1994, name: 'Luciola Vespa', sprite: 'LUCIOLA_VESPA', mvp: false,
    level: 104, hp: 32600, baseExp: 81500, jobExp: 57050, hit: 220, flee: 160, def: 29, mdef: 5,
    stats: { str: 104, agi: 56, vit: 30, int: 20, dex: 116, luk: 4 },
    atk: [9000, 9900], range: 1, size: 'Medium', race: 'Insect', element: 'Wind', elementLevel: 1,
    drops: [['Poring Coin', 5], ['Expanded Token Fragment', 3], ['Sprint Ring', 0.1], ['Worm Peeling', 100], ['Bee Sting', 100], ['Honey', 15], ['Wind of Verdure', 8], ['Royal Jelly', 10], ['Solid Shell', 100], ['Luciola Vespa Card', 0.05]],
  },
];
