/**
 * Airport-style codes for the trip pass (v0.5.7). Fargo doesn't store
 * airports, so this is a small built-in list: common destination cities
 * (matched against a trip's Base city) and each country's main airport (for
 * your home country, and trips without a Base city). City codes such as TYO
 * or LON are IATA "metro" codes for cities with several airports.
 */

/** Country → [main airport code, its city] */
const COUNTRY_AIRPORT: Record<string, [string, string]> = {
  MY: ["KUL", "Kuala Lumpur"], SG: ["SIN", "Singapore"], TH: ["BKK", "Bangkok"], VN: ["SGN", "Ho Chi Minh City"],
  ID: ["CGK", "Jakarta"], PH: ["MNL", "Manila"], JP: ["TYO", "Tokyo"], KR: ["SEL", "Seoul"], CN: ["BJS", "Beijing"],
  TW: ["TPE", "Taipei"], HK: ["HKG", "Hong Kong"], IN: ["DEL", "Delhi"], AU: ["SYD", "Sydney"], NZ: ["AKL", "Auckland"],
  GB: ["LON", "London"], US: ["NYC", "New York"], CA: ["YTO", "Toronto"], DE: ["BER", "Berlin"], FR: ["PAR", "Paris"],
  IT: ["ROM", "Rome"], ES: ["MAD", "Madrid"], NL: ["AMS", "Amsterdam"], CH: ["ZRH", "Zurich"], AT: ["VIE", "Vienna"],
  BE: ["BRU", "Brussels"], PT: ["LIS", "Lisbon"], IE: ["DUB", "Dublin"], GR: ["ATH", "Athens"], TR: ["IST", "Istanbul"],
  AE: ["DXB", "Dubai"], SA: ["RUH", "Riyadh"], BR: ["SAO", "São Paulo"], MX: ["MEX", "Mexico City"], FI: ["HEL", "Helsinki"],
  SE: ["STO", "Stockholm"], NO: ["OSL", "Oslo"], DK: ["CPH", "Copenhagen"], MV: ["MLE", "Malé"], LK: ["CMB", "Colombo"],
  MM: ["RGN", "Yangon"], KH: ["PNH", "Phnom Penh"], LA: ["VTE", "Vientiane"], BN: ["BWN", "Bandar Seri Begawan"],
  MO: ["MFM", "Macau"], NP: ["KTM", "Kathmandu"], QA: ["DOH", "Doha"], EG: ["CAI", "Cairo"], ZA: ["JNB", "Johannesburg"],
};

/** Common destination cities → airport code (lower-case names, no accents) */
const CITY_AIRPORT: Record<string, string> = {
  // Malaysia
  "kuala lumpur": "KUL", penang: "PEN", "george town": "PEN", georgetown: "PEN", langkawi: "LGK",
  "kota kinabalu": "BKI", kuching: "KCH", "johor bahru": "JHB", ipoh: "IPH", melaka: "MKZ", malacca: "MKZ",
  "kota bharu": "KBR", "kuala terengganu": "TGG", miri: "MYY", sandakan: "SDK", "cameron highlands": "IPH",
  // South-east Asia
  singapore: "SIN", "ho chi minh city": "SGN", saigon: "SGN", hanoi: "HAN", "da nang": "DAD", "hoi an": "DAD",
  "nha trang": "CXR", "phu quoc": "PQC", "da lat": "DLI", dalat: "DLI", bangkok: "BKK", phuket: "HKT",
  "chiang mai": "CNX", krabi: "KBV", pattaya: "UTP", "koh samui": "USM", bali: "DPS", denpasar: "DPS",
  ubud: "DPS", jakarta: "CGK", yogyakarta: "YIA", lombok: "LOP", bandung: "BDO", manila: "MNL", cebu: "CEB",
  boracay: "MPH", palawan: "PPS", "el nido": "PPS", "siem reap": "SAI", "phnom penh": "PNH",
  "luang prabang": "LPQ", vientiane: "VTE", yangon: "RGN", "bandar seri begawan": "BWN",
  // East Asia
  tokyo: "TYO", osaka: "OSA", kyoto: "OSA", nara: "OSA", sapporo: "CTS", fukuoka: "FUK", okinawa: "OKA",
  naha: "OKA", nagoya: "NGO", hiroshima: "HIJ", seoul: "SEL", busan: "PUS", jeju: "CJU", taipei: "TPE",
  kaohsiung: "KHH", taichung: "RMQ", "hong kong": "HKG", macau: "MFM", shanghai: "SHA", beijing: "BJS",
  shenzhen: "SZX", guangzhou: "CAN", chengdu: "CTU", "xi'an": "XIY", xian: "XIY",
  // South Asia, Middle East
  delhi: "DEL", "new delhi": "DEL", mumbai: "BOM", goa: "GOI", bangalore: "BLR", colombo: "CMB",
  male: "MLE", kathmandu: "KTM", dubai: "DXB", "abu dhabi": "AUH", doha: "DOH", istanbul: "IST",
  // Oceania
  sydney: "SYD", melbourne: "MEL", brisbane: "BNE", perth: "PER", "gold coast": "OOL", auckland: "AKL",
  queenstown: "ZQN", christchurch: "CHC",
  // Europe
  london: "LON", paris: "PAR", rome: "ROM", milan: "MIL", venice: "VCE", florence: "FLR", barcelona: "BCN",
  madrid: "MAD", lisbon: "LIS", porto: "OPO", amsterdam: "AMS", berlin: "BER", munich: "MUC",
  frankfurt: "FRA", zurich: "ZRH", geneva: "GVA", vienna: "VIE", prague: "PRG", budapest: "BUD",
  athens: "ATH", santorini: "JTR", dublin: "DUB", edinburgh: "EDI", copenhagen: "CPH", stockholm: "STO",
  oslo: "OSL", helsinki: "HEL", reykjavik: "REK",
  // Americas
  "new york": "NYC", "los angeles": "LAX", "san francisco": "SFO", "las vegas": "LAS", seattle: "SEA",
  honolulu: "HNL", chicago: "CHI", toronto: "YTO", vancouver: "YVR", "mexico city": "MEX", cancun: "CUN",
};

function norm(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

export type PassEnd = { code: string; label: string };

/** Your side of the pass: your home country's main airport. */
export function homeEnd(homeCountryCode: string | null | undefined, homeCountryName: string): PassEnd {
  const main = homeCountryCode ? COUNTRY_AIRPORT[homeCountryCode] : undefined;
  if (main) return { code: main[0], label: main[1] };
  return { code: homeCountryCode ?? "—", label: homeCountryName };
}

/**
 * The trip's side: the Base city's airport when we know it; a Base city we
 * don't know keeps its name over the country's main airport code; no Base
 * city → the country's main airport code over the country name.
 */
export function destinationEnd(
  baseCity: string | null | undefined,
  countryCode: string | null | undefined,
  countryLabel: string
): PassEnd {
  const city = baseCity?.split(",")[0].trim();
  const main = countryCode ? COUNTRY_AIRPORT[countryCode] : undefined;
  if (city) {
    const code = CITY_AIRPORT[norm(city)];
    if (code) return { code, label: city };
    if (main) return { code: main[0], label: city };
  }
  if (main) return { code: main[0], label: countryLabel };
  return { code: countryCode ?? "—", label: countryLabel };
}
