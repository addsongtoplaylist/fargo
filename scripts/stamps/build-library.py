"""Builds app/src/lib/stamp-library-data.ts from the stamp files + the areas below (STAMPS.md v2.1).

    python3 scripts/stamps/build-library.py

Every place stamp lists the area it covers as one or more circles (lat, lng, radius km): states and
long islands use several circles so a stamp never reaches into a neighbouring place (Sarawak never
covers Sabah). Aliases are used only when a trip has no Base city coordinates.
"""
import json
from pathlib import Path

root = Path(__file__).resolve().parents[2]
stamps_dir = root / "app/public/stamp-art"

# id: (name, [(lat, lng, km), ...], aliases)
PLACES = {
    "MY-kuala-lumpur": ("Kuala Lumpur", [(3.1478, 101.6953, 35)], ["kl", "petaling jaya", "putrajaya", "shah alam", "subang jaya", "cyberjaya"]),
    "MY-penang": ("Penang", [(5.38, 100.30, 25)], ["george town", "georgetown", "pulau pinang", "batu ferringhi", "butterworth", "bayan lepas"]),
    "MY-langkawi": ("Langkawi", [(6.35, 99.80, 30)], ["kuah", "pantai cenang"]),
    "MY-melaka": ("Melaka", [(2.20, 102.25, 35)], ["malacca"]),
    "MY-sabah": ("Sabah", [(5.98, 116.07, 120), (5.84, 118.11, 100), (4.40, 118.30, 110)], ["kota kinabalu", "kk", "sandakan", "semporna", "tawau", "kundasang", "kudat"]),
    "MY-sarawak": ("Sarawak", [(1.55, 110.35, 120), (2.29, 111.83, 100), (3.17, 113.04, 90), (4.40, 114.01, 60), (4.75, 115.00, 35), (4.85, 115.41, 25)], ["kuching", "miri", "sibu", "bintulu", "limbang", "lawas", "mulu"]),
    "MY-ipoh": ("Ipoh", [(4.597, 101.090, 30)], []),
    "MY-johor-bahru": ("Johor Bahru", [(1.4927, 103.7414, 35)], ["jb", "iskandar puteri", "nusajaya"]),
    "TH-bangkok": ("Bangkok", [(13.7563, 100.5018, 50)], ["krung thep"]),
    "TH-phuket": ("Phuket", [(7.95, 98.34, 35)], ["patong", "karon", "kata"]),
    "TH-chiang-mai": ("Chiang Mai", [(18.7883, 98.9853, 40)], []),
    "TH-krabi": ("Krabi", [(8.05, 98.90, 40)], ["ao nang", "railay", "phi phi", "koh phi phi"]),
    "TH-pattaya": ("Pattaya", [(12.9236, 100.8825, 30)], ["jomtien"]),
    "TH-koh-samui": ("Koh Samui", [(9.50, 100.00, 25)], ["samui", "ko samui"]),
    "ID-bali": ("Bali", [(-8.40, 115.19, 85)], ["ubud", "seminyak", "kuta", "denpasar", "uluwatu", "canggu", "nusa dua", "nusa penida"]),
    "ID-jakarta": ("Jakarta", [(-6.2088, 106.8456, 45)], []),
    "ID-yogyakarta": ("Yogyakarta", [(-7.7956, 110.3695, 45)], ["jogja", "jogjakarta", "borobudur"]),
    "ID-bandung": ("Bandung", [(-6.9175, 107.6191, 40)], ["lembang"]),
    "ID-lombok": ("Lombok", [(-8.65, 116.32, 60)], ["gili", "gili trawangan", "mataram", "senggigi"]),
    "ID-komodo": ("Komodo", [(-8.55, 119.60, 70)], ["labuan bajo", "flores"]),
    "VN-ho-chi-minh-city": ("Ho Chi Minh City", [(10.7769, 106.7009, 40)], ["saigon", "hcmc", "sai gon"]),
    "VN-hanoi": ("Hanoi", [(21.0285, 105.8542, 40)], ["ha noi"]),
    "VN-da-nang": ("Da Nang", [(16.0544, 108.2022, 20)], ["danang"]),
    "VN-hoi-an": ("Hoi An", [(15.8801, 108.3380, 12)], []),
    "VN-nha-trang": ("Nha Trang", [(12.2388, 109.1967, 30)], []),
    "VN-ha-long-bay": ("Ha Long Bay", [(20.91, 107.18, 50)], ["ha long", "halong"]),
    "PH-manila": ("Manila", [(14.5995, 120.9842, 40)], ["makati", "bgc", "taguig", "quezon city", "pasay"]),
    "PH-cebu": ("Cebu", [(10.3157, 123.8854, 45)], ["mactan", "lapu-lapu"]),
    "PH-boracay": ("Boracay", [(11.967, 121.924, 15)], []),
    "PH-palawan": ("Palawan", [(9.74, 118.74, 70), (11.19, 119.40, 60), (12.00, 120.20, 50)], ["el nido", "coron", "puerto princesa"]),
    "PH-bohol": ("Bohol", [(9.85, 124.14, 60)], ["tagbilaran", "panglao"]),
    "PH-siargao": ("Siargao", [(9.86, 126.05, 30)], ["general luna"]),
    "KH-siem-reap": ("Siem Reap", [(13.3633, 103.8564, 40)], ["angkor"]),
    "KH-phnom-penh": ("Phnom Penh", [(11.5564, 104.9282, 40)], []),
    "JP-tokyo": ("Tokyo", [(35.6762, 139.6503, 55)], []),
    "JP-osaka": ("Osaka", [(34.6937, 135.5023, 22)], []),  # city only: Nara (27 km) must not get Osaka
    "JP-kyoto": ("Kyoto", [(35.0116, 135.7681, 30)], []),
    "JP-hokkaido": ("Hokkaido", [(43.06, 141.35, 120), (43.50, 142.40, 90), (41.77, 140.73, 60)], ["sapporo", "otaru", "niseko", "furano", "biei", "hakodate", "asahikawa"]),
    "JP-fukuoka": ("Fukuoka", [(33.5904, 130.4017, 35)], ["hakata"]),
    "JP-okinawa": ("Okinawa", [(26.33, 127.80, 90)], ["naha"]),
    "KR-seoul": ("Seoul", [(37.5665, 126.9780, 30)], []),
    "KR-busan": ("Busan", [(35.1796, 129.0756, 35)], ["pusan"]),
    "KR-jeju": ("Jeju", [(33.38, 126.55, 50)], ["jeju island", "seogwipo"]),
    "KR-gyeongju": ("Gyeongju", [(35.8562, 129.2247, 25)], []),
    "KR-incheon": ("Incheon", [(37.4563, 126.7052, 20)], []),
    "KR-gangneung": ("Gangneung", [(37.7519, 128.8761, 30)], []),
    "TW-taipei": ("Taipei", [(25.0330, 121.5654, 22)], []),
    "TW-taichung": ("Taichung", [(24.1477, 120.6736, 35)], []),
    "TW-tainan": ("Tainan", [(22.9999, 120.2270, 30)], []),
    "TW-kaohsiung": ("Kaohsiung", [(22.6273, 120.3014, 30)], []),
    "TW-hualien": ("Hualien", [(24.00, 121.55, 45)], ["taroko"]),
    "TW-jiufen": ("Jiufen", [(25.1097, 121.8445, 8)], []),
    "CN-beijing": ("Beijing", [(39.9042, 116.4074, 70)], ["peking"]),
    "CN-shanghai": ("Shanghai", [(31.2304, 121.4737, 60)], []),
    "CN-chengdu": ("Chengdu", [(30.5728, 104.0668, 50)], []),
    "CN-chongqing": ("Chongqing", [(29.5630, 106.5516, 60)], []),
    "CN-xian": ("Xi'an", [(34.3416, 108.9398, 50)], ["xian"]),
    "CN-guilin": ("Guilin", [(25.2342, 110.1800, 80)], ["yangshuo"]),
    "TR-istanbul": ("Istanbul", [(41.0082, 28.9784, 50)], []),
    "TR-cappadocia": ("Cappadocia", [(38.64, 34.83, 50)], ["goreme", "urgup", "nevsehir"]),
}

files = {f"{p.parent.name}-{p.stem}": f"/stamp-art/{p.parent.name}/{p.name}" for p in stamps_dir.glob("*/*.png")}
places = [k for k in files if "-country-" not in k]
missing = sorted(set(places) - set(PLACES)) + sorted(set(PLACES) - set(places))
assert not missing, f"places without areas or files: {missing}"

out = ["// GENERATED by scripts/stamps/build-library.py — do not edit by hand (STAMPS.md v2.1).", "",
       'import type { StampEntry } from "./stamp-library";', "",
       "export const STAMPS: StampEntry[] = ["]
for sid in sorted(files):
    cc = sid.split("-")[0]
    if sid in PLACES:
        name, areas, aliases = PLACES[sid]
        out.append("  " + json.dumps({"id": sid, "country": cc, "kind": "place", "name": name,
                                      "areas": [[a, b, c] for a, b, c in areas], "aliases": aliases, "file": files[sid]}, ensure_ascii=False) + ",")
    else:
        out.append("  " + json.dumps({"id": sid, "country": cc, "kind": "country", "file": files[sid]}) + ",")
out.append("];\n")
(root / "app/src/lib/stamp-library-data.ts").write_text("\n".join(out))
print(len(files), "stamps:", len(places), "places +", len(files) - len(places), "country")
