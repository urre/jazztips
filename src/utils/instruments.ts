// Credits are free text in mixed English/Swedish ("Tenorsaxofon", "Sax (Tenor)",
// "Guest Artist, Piano"...). Map them onto a small set of instrument families.
// Order matters: specific patterns are matched and removed before generic ones,
// so "Bass Clarinet" becomes Woodwinds and not Bass.
const rules: Array<[family: string, pattern: RegExp]> = [
  ["Production", /vocal engineer|producer|producent|engineer|master|mixing|remix|design|photo|artwork|layout|art direction|management|reissue|restoration|editing|research|production|audio/g],
  ["Woodwinds", /bass ?clarinet|basklarinett|clarinet|klarinett|flutes?|flöjt|oboe|bass?oon|woodwinds|reeds/g],
  ["Trombone", /bass ?trombone|bastrombon|ventiltrombon|trombone/g],
  ["Saxophone", /sax\w*/g],
  ["Trumpet", /t?trumpet|flugelhorn|flygelhorn|flygehorn|cornet|kornett/g],
  ["Horns & tuba", /tuba|valthorn|french,? horn|althorn/g],
  // "flygel" on its own is Swedish for grand piano
  ["Piano & keys", /piano|flygel|keyboards?|keys|klaviatur\w*|rhodes|wurlitzer|organ|\w*orgel|hammond|clavinet|celesta|mellotron|philicorda/g],
  ["Synths & electronics", /synth\w*|electronics?|elektronik|eletronik|moog|programming|turntables|skivspelare|sampler|mpc|vocoder|\bdj\b|pads/g],
  ["Bass", /double bass|kontrabas|\bbass\b/g],
  ["Drums", /drums?|trumm\w*|cymbals/g],
  ["Percussion", /percussion|congas|tablas|tambourine|\bdaf\b/g],
  ["Guitar", /\w*guitars?|gitarr\w*|lap steel|pedal steel|\boud\b|ngoni|buzuq/g],
  ["Vibes & mallets", /vibra\w*|marimba|glockenspiel/g],
  ["Strings", /violin|viola|cello|fiol|harpa?|strings|stråkar|zither/g],
  ["Vocals", /vocals?|voice|röst|vokal|spoken word|narration|berättare|whistling/g],
  ["Composer & arranger", /compos\w*|arrang\w*|conductor|director|ledning|concertmaster|bandleader/g],
];

export const OTHER = "Other";

export function instrumentFamilies(instrument: string): string[] {
  let rest = instrument.toLowerCase();
  const families: string[] = [];
  for (const [family, pattern] of rules) {
    if (rest.match(pattern)) {
      families.push(family);
      rest = rest.replace(pattern, " ");
    }
  }
  return families.length ? families : [OTHER];
}

export function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}
