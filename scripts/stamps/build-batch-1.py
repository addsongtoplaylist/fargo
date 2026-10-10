"""Builds scripts/stamps/batch-1.json and docs/STAMPS-BATCH1.md (review table) — STAMPS.md v2.

    python3 scripts/stamps/build-batch-1.py

Rules (owner, 2026-10-11):
- Shapes rotate within each country so neighbours differ.
- Lettering: city stamps alternate "city + country" / "city only"; country stamps show the country.
- Placement follows the shape (curved on round shapes, header bar on squares, vertical on tall
  rectangles, big letters on wide ovals, ribbon on the rest); a hanging tag on ~1 in 10.
- No sun, no moon, no date.
"""
import json
from pathlib import Path

root = Path(__file__).resolve().parents[2]

# Friendly shapes only (owner, 2026-10-11): no shield (looks odd), no triangles either way (hazard sign /
# awkward pennant), no octagon (stop sign); ticket, scallop, cloud and pill were considered and declined.
DOME = "dome (flat bottom edge, semicircular top)"
POSTAGE = "square with a perforated postage-stamp edge"
SHAPES = ["circle", "rounded square", "tall arch", "hexagon", "wide horizontal oval", "tall rectangle", DOME, POSTAGE]
# Round A (approved 2026-10-11) keeps its shapes; Ipoh, Johor Bahru and Malaysia 1 moved off dropped shapes.
PINNED = {
    "MY-kuala-lumpur": "circle", "MY-penang": "rounded square", "MY-langkawi": "tall arch",
    "MY-melaka": "hexagon", "MY-sabah": "wide horizontal oval", "MY-sarawak": "tall rectangle",
    "MY-ipoh": "rounded square", "MY-johor-bahru": DOME, "MY-country-1": "tall arch",
    "MY-country-2": POSTAGE, "SG-country-1": "circle", "SG-country-2": "rounded square",
}

PLACEMENT = {
    "circle": "curved around the circle between two concentric border lines, like a classic round passport stamp (top arc, and the bottom arc if there is a second line)",
    "wide horizontal oval": "as very large bold block letters across the middle like a vintage 'greetings from' postcard, the scene visible behind and inside the letters (any second line small underneath)",
    "tall arch": "curved along the inside of the arch top, following its curve",
    "tall rectangle": "set vertically down the left edge, one upright letter under another, inside a narrow vertical strip of the border (any second line small at the bottom)",
    "rounded square": "in a solid straight header bar across the top, the letters reversed out (paper colour) inside the inked bar",
    "square with a perforated postage-stamp edge": "in a solid straight header bar across the bottom, the letters reversed out (paper colour) inside the inked bar",
    "hexagon": "in a ribbon banner across the top edge (any second line in a ribbon across the bottom edge)",
    DOME: "curved along the inside of the dome's round top (any second line in a straight band along the flat bottom edge)",
}
ONE_LINE = {
    "circle": "curved along the top arc of the circle between two concentric border lines, like a classic round passport stamp; the bottom of the border has no lettering",
    "wide horizontal oval": "as very large bold block letters across the middle like a vintage 'greetings from' postcard, the scene visible behind and inside the letters",
    "tall rectangle": "set vertically down the left edge, one upright letter under another, inside a narrow vertical strip of the border",
    "hexagon": "in one ribbon banner across the top edge; no other ribbons or banners",
    DOME: "curved along the inside of the dome's round top; the flat bottom edge has no lettering",
}
TAG = "on a large luggage tag — about a quarter of the stamp's width — hanging from the lower right corner of the border by a loop of string, the lettering big and easy to read on the tag"

# country code, country name, [(id, name, subject, composition)], [(country subject, composition) x2]
COUNTRIES = [
    ("MY", "Malaysia", [
        ("kuala-lumpur", "Kuala Lumpur", "the Sultan Abdul Samad Building clock tower and its domes facing Merdeka Square", "the clock tower tall on the left, the domed arcade stretching to the right, the square in front"),
        ("penang", "Penang", "a Penang trishaw and the clan jetty wooden stilt houses over the sea", "the trishaw large in the foreground on the left, the stilt houses small behind on the right"),
        ("langkawi", "Langkawi", "the Langkawi Sky Bridge curving over jungle-covered peaks, with a sea eagle", "the curved bridge sweeping across the middle, peaks below, the eagle above"),
        ("melaka", "Melaka", "the red Christ Church and Stadthuys of Melaka with a decorated trishaw", "the church front-on in the middle, the trishaw parked in the lower right"),
        ("sabah", "Sabah", "Mount Kinabalu's jagged granite peaks above rainforest, with an orangutan on a branch", "the orangutan close up on a branch in the foreground, the mountain behind"),
        ("sarawak", "Sarawak", "a rhinoceros hornbill and a traditional longhouse on stilts by a river", "a close-up of the hornbill's head and casque in the upper half, the longhouse small below"),
        ("ipoh", "Ipoh", "the colonial Ipoh railway station with limestone hills behind", "a wide view of the long station facade, the limestone hills rising behind"),
        ("johor-bahru", "Johor Bahru", "the Sultan Abu Bakar State Mosque on its hill above the Straits of Johor, with the Causeway", "the mosque on the hill on the right, the water and the long Causeway across the bottom"),
    ], [
        ("the Petronas Twin Towers with the KL Tower and city skyline behind, clouds, hibiscus flowers and palm fronds", "layered depth: hibiscus and palm fronds in the foreground corners, the twin towers in the middle, skyline and clouds behind"),
        ("a traditional Malay kampung house on stilts with coconut palms and a wau kite flying above", "the house on the right, palms on the left, the kite high in the sky"),
    ]),
    ("SG", "Singapore", [], [
        ("the Merlion fountain with Marina Bay Sands and the Supertrees behind", "the Merlion on the left spouting water, the skyline across the back"),
        ("the Supertrees of Gardens by the Bay with the Singapore Flyer wheel", "looking up at the Supertrees from below, the Flyer behind on the right"),
    ]),
    ("TH", "Thailand", [
        ("bangkok", "Bangkok", "a Thai long-tail boat on the Chao Phraya river and the spires of Wat Arun", "the boat big in the foreground, the temple small in the distance"),
        ("phuket", "Phuket", "Phuket Old Town's pastel Sino-Portuguese shophouses with a tuk-tuk", "a street in perspective, the tuk-tuk in front"),
        ("chiang-mai", "Chiang Mai", "the golden chedi of Wat Phra That Doi Suthep with floating paper lanterns", "the chedi centred low, lanterns drifting up around it"),
        ("krabi", "Krabi", "Railay's limestone cliffs over a beach with a rock climber", "a tall cliff on one side, the climber small on its face, the beach below"),
        ("pattaya", "Pattaya", "the carved wooden Sanctuary of Truth on the seafront", "the temple from a low angle, waves in the foreground"),
        ("koh-samui", "Koh Samui", "the Big Buddha temple of Koh Samui with coconut palms and the sea", "palm trunks framing the view, the Big Buddha in the middle distance"),
    ], [
        ("an ornate Thai temple roof with a tuk-tuk in front", "the roof's layered gables filling the top, the tuk-tuk at the bottom"),
        ("a Thai elephant beside a floating market boat piled with fruit", "the elephant on the left, the boat on the right"),
    ]),
    ("ID", "Indonesia", [
        ("bali", "Bali", "Balinese rice terraces with a split temple gate and palm trees", "a sweeping panorama of curving terraces, the gate small on one side"),
        ("jakarta", "Jakarta", "the National Monument (Monas) with its flame top", "the monument tall in the centre, a park path leading to it"),
        ("yogyakarta", "Yogyakarta", "the Prambanan temple spires", "the cluster of spires from a low angle, a lone figure at the base for scale"),
        ("bandung", "Bandung", "tea plantation rows rolling toward the Tangkuban Perahu volcano", "tea rows curving in the foreground, the volcano behind"),
        ("lombok", "Lombok", "a white beach with outrigger boats and Mount Rinjani behind", "the boats pulled up on the sand in front, the mountain across the back"),
        ("komodo", "Komodo", "a Komodo dragon on a beach with island hills behind", "the dragon big and low across the foreground"),
    ], [
        ("the stupas of Borobudur temple", "rows of bell-shaped stupas in perspective, the main stupa at the top"),
        ("a wayang kulit shadow puppet with frangipani flowers", "the puppet tall in the middle, flowers in the corners"),
    ]),
    ("VN", "Vietnam", [
        ("ho-chi-minh-city", "Ho Chi Minh City", "the Saigon Central Post Office facade with motorbikes", "the arched facade across the back, motorbikes passing in front"),
        ("hanoi", "Hanoi", "the red Huc Bridge over Hoan Kiem Lake with the Turtle Tower", "the arched bridge across the foreground, the tower on its islet behind"),
        ("da-nang", "Da Nang", "the Golden Bridge held up by two giant stone hands in the mountains", "the hands large in the foreground, the bridge curving across"),
        ("hoi-an", "Hoi An", "the Japanese Covered Bridge with silk lanterns and a river boat", "lanterns hanging across the top, the bridge in the middle, the boat below"),
        ("nha-trang", "Nha Trang", "the Po Nagar Cham towers above round basket boats", "the towers on a hill, basket boats on the water in front"),
        ("ha-long-bay", "Ha Long Bay", "limestone islands rising from the water with a traditional junk boat", "islands layered into the distance, the junk sailing in front"),
    ], [
        ("a woman in a conical hat carrying baskets on a bamboo pole through rice fields", "the figure on the right, the rice field stretching left"),
        ("a Vietnamese phin coffee filter dripping into a glass, with lotus flowers", "the filter and glass large in the middle, lotus around the base"),
    ]),
    ("PH", "Philippines", [
        ("manila", "Manila", "the stone gate of Fort Santiago in Intramuros with a kalesa horse carriage", "looking through the gate, the carriage passing"),
        ("cebu", "Cebu", "the pavilion of Magellan's Cross with a painted ceiling", "the octagonal pavilion centred, people small at its base"),
        ("boracay", "Boracay", "White Beach with paraw sailboats and palm trees", "sailboats on the water in front, palms along the shore"),
        ("palawan", "Palawan", "a hidden lagoon among limestone cliffs with a kayak", "cliffs on both sides, the kayak small in the middle"),
        ("bohol", "Bohol", "the Chocolate Hills with a tarsier on a branch", "the tarsier close up in the foreground, the round hills behind"),
        ("siargao", "Siargao", "a surfer riding a wave beside a palm-lined boardwalk", "the wave curling across, the boardwalk at the side"),
    ], [
        ("a decorated jeepney", "the jeepney in three-quarter view filling the frame"),
        ("a bangka outrigger boat with the cone of Mayon Volcano behind", "the boat in front, the perfect cone behind"),
    ]),
    ("KH", "Cambodia", [
        ("siem-reap", "Siem Reap", "the towers of Angkor Wat reflected in the moat", "towers across the middle, their reflection below"),
        ("phnom-penh", "Phnom Penh", "the Royal Palace throne hall roof with a cyclo", "the roof filling the top, the cyclo in front"),
    ], [
        ("an Apsara dancer with lotus flowers", "the dancer centred, lotus at her feet"),
        ("sugar palm trees over rice paddies with a wooden ox cart", "palms on the horizon, the cart in front"),
    ]),
    ("JP", "Japan", [
        ("tokyo", "Tokyo", "a narrow Tokyo lane lined with paper lanterns, with Tokyo Tower", "looking up the lane in steep perspective, the tower peeking out at the top right"),
        ("osaka", "Osaka", "Osaka Castle on its stone walls with cherry trees", "the castle on the right, cherry branches framing the left"),
        ("kyoto", "Kyoto", "a tunnel of Fushimi Inari torii gates on a stone path", "the gates receding in strong perspective toward the centre"),
        ("hokkaido", "Hokkaido", "snow-capped mountains above rolling lavender fields with a farmhouse", "mountains at the top, lavender rows running up from the base"),
        ("fukuoka", "Fukuoka", "yatai food stalls by the river at night with a bridge", "a row of stalls along the bank, the bridge behind"),
        ("okinawa", "Okinawa", "a shisa lion statue on a red-tile roof by the sea", "the shisa close up on the roof edge, the sea behind"),
    ], [
        ("Mount Fuji, a five-storey pagoda and a cherry blossom branch", "Fuji large behind, the pagoda at the right edge, a cherry branch across the top"),
        ("a Shinkansen bullet train passing a red torii gate", "the train sweeping diagonally, the gate in front"),
    ]),
    ("KR", "South Korea", [
        ("seoul", "Seoul", "the roof of Gyeongbokgung palace gate with Namsan Seoul Tower behind", "the curved roof across the bottom, the tower behind on the left"),
        ("busan", "Busan", "Gamcheon Culture Village houses stepping down a hillside to the sea", "houses climbing diagonally, the sea at the bottom"),
        ("jeju", "Jeju", "a dol hareubang stone statue with Seongsan Ilchulbong crater behind", "the statue close up on the left, the crater on the horizon"),
        ("gyeongju", "Gyeongju", "the Cheomseongdae stone observatory with royal tomb mounds", "the observatory centred, grassy mounds behind"),
        ("incheon", "Incheon", "the ornate Chinatown gate with the long Incheon Bridge behind", "looking through the gate toward the bridge"),
        ("gangneung", "Gangneung", "the Gyeongpodae pavilion by a lake with pine trees", "pine trees framing the pavilion, the lake in front"),
    ], [
        ("a hanok house courtyard with a persimmon tree", "the curved roofs at the back, the tree leaning in from the side"),
        ("a dancer in hanbok with fans in a traditional fan dance", "the dancer centred, fans spread wide"),
    ]),
    ("TW", "Taiwan", [
        ("taipei", "Taipei", "Taipei 101 above a night-market street of round lanterns", "the tower tall on the right, the lantern street lower left"),
        ("taichung", "Taichung", "the curving National Taichung Theater building with a park in front", "the flowing facade across the frame, trees in front"),
        ("tainan", "Tainan", "the Chihkan Tower pavilions with stone turtle steles", "the pavilions behind, a turtle stele in front"),
        ("kaohsiung", "Kaohsiung", "the Dragon and Tiger Pagodas on Lotus Pond with a zigzag bridge", "the two pagodas side by side, the bridge leading in"),
        ("hualien", "Hualien", "Taroko Gorge's marble cliffs with the Eternal Spring Shrine and waterfall", "steep cliffs on both sides, the shrine and waterfall in the middle"),
        ("jiufen", "Jiufen", "Jiufen's teahouses with red lanterns on a stepped lane", "steps climbing in perspective, lanterns along the eaves"),
    ], [
        ("sky lanterns rising over a mountain village at Pingxi", "lanterns floating up through the frame, the village below"),
        ("a bubble tea cup in front of an ornate temple roof", "the cup large in front, the temple roof behind"),
    ]),
    ("HK", "Hong Kong", [], [
        ("Victoria Harbour skyline with a red-sail junk boat", "the junk in front, the skyline across the back"),
        ("a double-decker tram on a busy street with blank signboards", "the tram large in front, buildings either side"),
    ]),
    ("CN", "China", [
        ("beijing", "Beijing", "the round Temple of Heaven hall on its marble terraces", "the hall centred above the stepped terraces"),
        ("shanghai", "Shanghai", "the Oriental Pearl Tower and the Bund across the Huangpu River", "the river across the middle, the tower on the far bank"),
        ("chengdu", "Chengdu", "a giant panda eating bamboo", "the panda close up, bamboo framing the sides"),
        ("chongqing", "Chongqing", "the stilted buildings of Hongyadong stacked on a cliff over the river", "buildings stacked up the frame, the river at the bottom"),
        ("xian", "Xi'an", "rows of Terracotta Warriors", "warriors in rows receding in perspective, one large in front"),
        ("guilin", "Guilin", "karst peaks along the Li River with a cormorant fisherman on a bamboo raft", "the raft in front, peaks layered behind"),
    ], [
        ("the Great Wall of China with watchtowers over mountain ridges", "the wall zig-zagging diagonally across the frame"),
        ("a dragon dance under hanging red lanterns", "the dragon's body curving through the frame, lanterns at the top"),
    ]),
    ("IN", "India", [
        ("delhi", "Delhi", "India Gate with its lawns and a cycle rickshaw", "the arch centred, the rickshaw small in front"),
        ("mumbai", "Mumbai", "the Gateway of India with boats in the harbour", "the gateway on the right, boats on the left"),
        ("jaipur", "Jaipur", "the honeycomb facade of the Hawa Mahal", "the facade filling the frame front-on"),
        ("agra", "Agra", "the Taj Mahal", "the Taj Mahal seen through a carved Mughal archway in the foreground"),
        ("goa", "Goa", "a whitewashed Portuguese church above a beach with fishing boats", "the church on the hill, boats on the sand"),
        ("kerala", "Kerala", "a houseboat on the backwaters with coconut palms", "the houseboat across the middle, palms leaning over"),
    ], [
        ("a decorated Indian elephant with lotus flowers", "the elephant in profile, lotus at the bottom"),
        ("an auto-rickshaw draped with marigold garlands", "the rickshaw in three-quarter view filling the frame"),
    ]),
]

entries, n = [], 0
for cc, country, cities, symbols in COUNTRIES:
    stamps = [("city", *c) for c in cities] + [("country", f"country-{i + 1}", country, s, comp) for i, (s, comp) in enumerate(symbols)]
    for j, (kind, slug, name, subject, comp) in enumerate(stamps):
        rot = len(entries) - len(PINNED) if f"{cc}-{slug}" not in PINNED else 0
        shape = PINNED.get(f"{cc}-{slug}") or SHAPES[(rot + 2) % len(SHAPES)]  # rotation continues after round A
        if kind == "city":
            text = [name.upper(), country.upper()] if j % 2 == 0 else [name.upper()]
        else:
            text = [country.upper()]
        n += 1
        tag = n % 11 == 7  # about 1 in 10, staggered so tags land on different shapes
        entries.append({
            "id": f"{cc}-{slug}", "kind": "place" if kind == "city" else "country",
            "name": name, "country": country, "subject": subject, "shape": shape,
            "composition": comp, "text": text,
            "placement": TAG if tag else (ONE_LINE.get(shape, PLACEMENT[shape]) if len(text) == 1 else PLACEMENT[shape]),
        })

def placement_label(e):
    p = e["placement"]
    if p == TAG: return "Hanging tag"
    if p.startswith("curved"): return "Curved"
    if p.startswith("as very large"): return "Big letters"
    if p.startswith("set vertically"): return "Vertical"
    if "header bar" in p: return "Header bar"
    if p.startswith("in a straight band"): return "Band"
    return "Ribbon"

for e in entries:
    e["placementName"] = placement_label(e)

(root / "scripts/stamps/batch-1.json").write_text(json.dumps(entries, indent=2, ensure_ascii=False) + "\n")

short = lambda s: s.replace("square with a perforated postage-stamp edge", "postage stamp").split(" (")[0].replace("downward-pointing ", "").replace("wide horizontal ", "wide ")
lines = ["# Stamp library — batch 1 (Asia) for review", "",
         f"> Generated from `scripts/stamps/build-batch-1.py` → `scripts/stamps/batch-1.json`. **{len(entries)} stamps** "
         f"({sum(e['kind'] == 'place' for e in entries)} places + {sum(e['kind'] == 'country' for e in entries)} country). "
         "Edit anything here (place, subject, shape, lettering) before generating. Rules: `STAMPS.md` v2.", ""]
for cc, country, *_ in COUNTRIES:
    lines += [f"## {country}", "", "| # | Stamp | Lettering | Shape | Placement | Picture |", "|---|---|---|---|---|---|"]
    for i, e in enumerate([e for e in entries if e["id"].startswith(cc + "-")], 1):
        name = e["name"] + (" *(country)*" if e["kind"] == "country" else "")
        lines.append(f"| {i} | {name} | {' · '.join(e['text'])} | {short(e['shape'])} | {e['placementName']} | {e['subject']} — {e['composition']} |")
    lines.append("")
(root / "docs/STAMPS-BATCH1.md").write_text("\n".join(lines))
print(len(entries), "stamps;", sum(e["placementName"] == "Hanging tag" for e in entries), "hanging tags")
