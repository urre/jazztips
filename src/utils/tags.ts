// Tags are free text in mixed English/Swedish and mixed spelling ("Hard Bop",
// "hard-bop", "hardbop"). Variants share a key so they can be shown and
// browsed as one tag, and each key is sorted into a broad group for the index.

// Swedish and English spellings of the same thing share a key
const synonyms: Record<string, string> = {
  kvartett: "quartet",
  kvarett: "quartet",
  kvintett: "quintet",
  sextett: "sextet",
  septett: "septet",
  storband: "bigband",
  orkester: "orchestra",
  vibrafon: "vibraphone",
  vokal: "vocals",
  vocal: "vocals",
  flöjt: "flute",
  fiol: "violin",
  tenorsax: "tenorsaxophone",
  frijazz: "freejazz",
  friform: "freejazz",
  avantgardejazz: "avantgarde",
  smooth: "smoothjazz",
  improvisationer: "improvisation",
  elektroniskt: "electronic",
  electronica: "electronic",
  västkust: "westcoast",
  westcoastjazz: "westcoast",
  nyc: "newyork",
  brasilien: "brazil",
  brazilian: "brazil",
  filmmusik: "soundtrack",
  film: "soundtrack",
  standard: "standards",
};

// Display names for keys whose most used spelling is Swedish or oddly cased
const displayNames: Record<string, string> = {
  quartet: "Quartet",
  quintet: "Quintet",
  sextet: "Sextet",
  septet: "Septet",
  bigband: "Big Band",
  orchestra: "Orchestra",
  vibraphone: "Vibraphone",
  vocals: "Vocals",
  flute: "Flute",
  violin: "Violin",
  orgel: "Organ",
  elgitarr: "Electric Guitar",
  barytonsax: "Baritone Saxophone",
  ventiltrombon: "Valve Trombone",
  tenorsaxophone: "Tenor Saxophone",
  altosaxophone: "Alto Saxophone",
  freejazz: "Free Jazz",
  hardbop: "Hard Bop",
  postbop: "Post-Bop",
  avantgarde: "Avant-Garde",
  smoothjazz: "Smooth Jazz",
  electronic: "Electronic",
  folkmusik: "Folk Music",
  världsmusik: "World Music",
  milder: "Mellow",
  pianolös: "Pianoless",
  ministorband: "Small Big Band",
  soundtrack: "Soundtrack",
  westcoast: "West Coast",
  newyork: "New York",
  neworleans: "New Orleans",
  losangeles: "Los Angeles",
  norge: "Norway",
  svenskt: "Swedish",
  nordiskt: "Nordic",
  brazil: "Brazil",
  kuba: "Cuba",
  afrikanskt: "African",
  göteborg: "Gothenburg",
  "60tal": "1960s",
  villagevanguard: "Village Vanguard",
  bluenote: "Blue Note",
  ecm: "ECM",
  act: "ACT",
  cti: "CTI",
  grp: "GRP",
  rb: "R&B",
  instrumentalrb: "Instrumental R&B",
  dj: "DJ",
  hiphop: "Hip-Hop",
};

export function tagKey(tag: string): string {
  const key = tag.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
  return synonyms[key] ?? key;
}

const capitalise = (tag: string) => tag.charAt(0).toLocaleUpperCase("sv") + tag.slice(1);

const groups: Array<[group: string, keys: string[]]> = [
  [
    "Styles",
    [
      "jazz", "contemporary", "contemporaryjazz", "modernjazz", "postbop", "hardbop", "bop", "bebop",
      "cool", "cooljazz", "westcoast", "modaljazz", "modalmusic", "frijazz", "freejazz", "friform",
      "avantgarde", "avantgardejazz", "experimental", "experimentaljazz", "improvisation",
      "improvisationer", "freeimprovisation", "spiritualjazz", "spirituals", "chamberjazz",
      "orchestraljazz", "nordicjazz", "swedishjazz", "norwegianjazz", "britishjazz", "neworleansjazz",
      "vocaljazz", "modernvocaljazz", "pianojazz", "organjazz", "souljazz", "soul", "funk", "jazzfunk",
      "fusion", "jazzfusion", "acidjazz", "groove", "blues", "swing", "ballad", "standards", "standard",
      "latin", "latinjazz", "bossa", "smooth", "smoothjazz", "lounge", "electronic", "electronica",
      "elektroniskt", "folk", "folkjazz", "folkmusik", "folklore", "armenianfolk", "world",
      "världsmusik", "filmmusik", "film", "soundtrack", "milder", "suggestiv", "live", "covers", "pop",
      "rb", "instrumentalrb", "neosoul", "hiphop", "indie", "progressiverock", "progmetal", "choral",
      "symfoni", "scat",
    ],
  ],
  [
    "Instruments",
    [
      "piano", "trumpet", "cornet", "flygelhorn", "trombone", "ventiltrombon", "saxophone",
      "tenorsaxophone", "tenorsax", "altosaxophone", "barytonsax", "flute", "flöjt", "jazzflute",
      "guitar", "elgitarr", "bass", "doublebass", "drums", "percussion", "vibrafon", "vibraphone",
      "orgel", "vocals", "vocal", "vokal", "voice", "cello", "fiol", "violin", "strings", "brass",
      "electric", "turntablist", "dj", "jazzinstrument",
    ],
  ],
  [
    "Ensembles",
    [
      "solo", "duo", "trio", "pianotrio", "saxophonetrio", "pianolös", "kvartett", "kvarett", "quartet",
      "kvintett", "quintet", "sextett", "sextet", "septett", "septet", "storband", "bigband",
      "modernbigband", "ministorband", "orchestra", "orkester",
    ],
  ],
  [
    "Places & scenes",
    [
      "sweden", "swedish", "svenskt", "stockholm", "göteborg", "ödeshög", "ruskträsk", "norge",
      "norwegian", "nordiskt", "london", "paris", "belgrade", "italian", "newyork", "neworleans",
      "losangeles", "texas", "canadian", "brasilien", "brazil", "brazilian",
      "kuba", "afrikanskt", "tokyo", "kyoto", "villagevanguard", "carnegie", "newport", "marciac",
      "lighthouse", "60tal",
    ],
  ],
  [
    "Labels",
    [
      "ecm", "act", "bluenote", "prestige", "riverside", "jazzland", "impulse", "capitol", "cti", "grp",
      "nonesuch", "edition", "intone", "caprice", "legacy", "jazzagenturen",
    ],
  ],
];

export const PEOPLE = "Musicians & more";

const groupByKey = new Map(groups.flatMap(([group, keys]) => keys.map((key) => [key, group])));

export const GROUP_ORDER = [...groups.map(([group]) => group), PEOPLE];

export function tagGroup(tag: string): string {
  return groupByKey.get(tagKey(tag)) ?? PEOPLE;
}

export interface MergedTag {
  key: string;
  // The most used spelling, used for the link
  name: string;
  // What the index and tag page show
  label: string;
  variants: string[];
  count: number;
  group: string;
}

export function mergeTags(tagLists: Array<string[] | undefined>): MergedTag[] {
  const byKey = new Map<string, { counts: Map<string, number>; count: number }>();

  for (const tags of tagLists) {
    // A record tagged both "Jazz" and "jazz" only counts once
    const seen = new Set<string>();
    for (const tag of tags ?? []) {
      const key = tagKey(tag);
      if (!key) continue;
      const entry = byKey.get(key) ?? { counts: new Map(), count: 0 };
      entry.counts.set(tag, (entry.counts.get(tag) ?? 0) + 1);
      if (!seen.has(key)) entry.count++;
      seen.add(key);
      byKey.set(key, entry);
    }
  }

  return [...byKey].map(([key, { counts, count }]) => {
    const variants = [...counts.keys()];
    // Most used spelling wins, capitalised spellings break ties ("Jazz" over "jazz")
    const name = [...counts].sort(
      ([a, ca], [b, cb]) => cb - ca || Number(/^\p{Lu}/u.test(b)) - Number(/^\p{Lu}/u.test(a))
    )[0][0];
    return { key, name, label: displayNames[key] ?? capitalise(name), variants, count, group: tagGroup(name) };
  });
}
