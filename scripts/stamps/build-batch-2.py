"""Builds scripts/stamps/batch-2.json and docs/STAMPS-BATCH2.md — STAMPS.md v2, batch 2.

    python3 scripts/stamps/build-batch-2.py

Batch 2 (owner, 2026-10-11): popular countries beyond batch 1, **2 country stamps each, no city
stamps**. Same rules as batch 1: 8 friendly shapes rotating, lettering = country name, placement
follows the shape, a big hanging tag on about 1 in 10, no sun, no date.
Dropped by the owner: Kazakhstan, Uzbekistan, Saudi Arabia, UAE, Nepal, Jordan (and India in batch 1).
"""
import json
from pathlib import Path

root = Path(__file__).resolve().parents[2]

DOME = "dome (flat bottom edge, semicircular top)"
POSTAGE = "square with a perforated postage-stamp edge"
SHAPES = ["circle", "rounded square", "tall arch", "hexagon", "wide horizontal oval", "tall rectangle", DOME, POSTAGE]

# One line of lettering (the country name) — never mention a second line, or the model invents one.
PLACEMENT = {
    "circle": "curved along the top arc of the circle between two concentric border lines, like a classic round passport stamp; the bottom of the border has no lettering",
    "rounded square": "in a solid straight header bar across the top, the letters reversed out (paper colour) inside the inked bar",
    "tall arch": "curved along the inside of the arch top, following its curve",
    "hexagon": "in one ribbon banner across the top edge; no other ribbons or banners",
    "wide horizontal oval": "as very large bold block letters across the middle like a vintage 'greetings from' postcard, the scene visible behind and inside the letters",
    "tall rectangle": "set vertically down the left edge, one upright letter under another, inside a narrow vertical strip of the border",
    DOME: "curved along the inside of the dome's round top; the flat bottom edge has no lettering",
    POSTAGE: "in a solid straight header bar across the bottom, the letters reversed out (paper colour) inside the inked bar",
}
TAG = ("on a BIG luggage tag, about one third of the stamp's width and clearly a major element of the design, hanging from "
       "the lower right corner of the border by a short loop of string and overlapping the corner, with the lettering in "
       "large bold capitals that fill the tag")

# round, code, country, [(subject, composition) x2]
COUNTRIES = [
    ("E", "MV", "Maldives", [
        ("overwater villas on stilts above a calm lagoon with a palm tree", "the villas curving out across the water from one side"),
        ("a sea turtle swimming over coral and small fish", "the turtle large and diagonal across the frame"),
    ]),
    ("E", "BN", "Brunei", [
        ("the Sultan Omar Ali Saifuddien Mosque with its golden dome reflected in the lagoon", "the mosque across the middle, its reflection below"),
        ("Kampong Ayer water village houses on stilts with a water taxi", "houses along the back on stilts, the boat in front"),
    ]),
    ("E", "MO", "Macau", [
        ("the stone facade of the Ruins of St. Paul's at the top of its steps", "the facade front-on, the steps leading up from the bottom"),
        ("wavy Portuguese pavement in Senado Square with pastel colonial buildings", "the wave-patterned pavement filling the foreground, the buildings behind"),
    ]),
    ("E", "LK", "Sri Lanka", [
        ("the Sigiriya rock fortress rising above the jungle", "the huge rock in the centre, jungle canopy around its base"),
        ("a blue train crossing the Nine Arch Bridge in green tea hills", "the arched bridge across the frame, the train on top"),
    ]),
    ("E", "AU", "Australia", [
        ("the Sydney Opera House sails with the Harbour Bridge behind", "the Opera House in front, the bridge arching behind"),
        ("a kangaroo in the outback with Uluru on the horizon", "the kangaroo large in the foreground, Uluru low behind"),
    ]),
    ("E", "NZ", "New Zealand", [
        ("Milford Sound's steep mountains rising from the fjord with a small boat", "the peak on one side, the water in front, the boat small"),
        ("a kiwi bird among silver fern fronds", "the kiwi in profile, ferns curling around it"),
    ]),
    ("F", "GB", "United Kingdom", [
        ("Big Ben clock tower with a red double-decker bus", "the tower tall on one side, the bus passing in front"),
        ("Tower Bridge over the River Thames", "the bridge across the frame, the river below"),
    ]),
    ("F", "FR", "France", [
        ("the Eiffel Tower above Parisian rooftops", "the tower tall in the centre, rooftops along the bottom"),
        ("a Parisian café table with a croissant and coffee cup on a cobbled street", "the table close up in front, the café awning behind"),
    ]),
    ("F", "IT", "Italy", [
        ("the Colosseum", "the curved arches across the frame from a low angle"),
        ("a gondola on a Venice canal with a small bridge", "the gondola in front, the bridge and houses behind"),
    ]),
    ("F", "CH", "Switzerland", [
        ("the Matterhorn with a red mountain train", "the peak behind, the train curving through the foreground"),
        ("an alpine chalet with a cow wearing a bell", "the cow close up in front, the chalet behind"),
    ]),
    ("F", "ES", "Spain", [
        ("the spires of the Sagrada Família", "the spires rising tall in the centre"),
        ("a flamenco dancer in a flowing ruffled dress", "the dancer mid-turn, the dress sweeping across the frame"),
    ]),
    ("F", "NL", "Netherlands", [
        ("windmills beside rows of tulip fields", "tulip rows leading toward the windmills"),
        ("Amsterdam canal houses with bicycles on a bridge", "bicycles on the bridge in front, the gabled houses behind"),
    ]),
    ("F", "GR", "Greece", [
        ("Santorini's white houses and blue domes above the sea", "domes and houses stepping down the cliff, the sea below"),
        ("the Parthenon on the Acropolis", "the temple's columns across the frame from a low angle"),
    ]),
    ("F", "DE", "Germany", [
        ("Neuschwanstein Castle on its hill above the forest", "the castle on the right, forest and hills below"),
        ("a carved Black Forest cuckoo clock with a cuckoo popping out", "the clock front-on filling the frame"),
    ]),
    ("F", "IS", "Iceland", [
        ("the northern lights over a waterfall", "the waterfall in front, the aurora swirling across the sky"),
        ("a puffin standing on a sea cliff", "the puffin large in front, the cliff edge and sea behind"),
    ]),
    ("F", "US", "United States", [
        ("the Statue of Liberty", "the statue from a low angle, her torch raised to the top"),
        ("the Golden Gate Bridge over the bay", "a tower close on one side, the bridge spanning away"),
    ]),
    ("F", "CA", "Canada", [
        ("a moose by a mountain lake", "the moose large in front, the lake and mountains behind"),
        ("a canoe on a lake framed by maple leaves", "maple leaves around the edges, the canoe in the middle"),
    ]),
    ("F", "EG", "Egypt", [
        ("the pyramids of Giza with a camel and rider", "the camel in front, the pyramids behind"),
        ("the golden mask of Tutankhamun", "the mask front-on, filling the frame"),
    ]),
    ("F", "MA", "Morocco", [
        ("hanging Moroccan lanterns over a zellige tiled wall", "lanterns hanging from the top, tile patterns behind"),
        ("a desert kasbah with palm trees", "the kasbah on the right, palms on the left, dunes in front"),
    ]),
]

entries = []
for rnd, cc, country, symbols in COUNTRIES:
    for i, (subject, comp) in enumerate(symbols, 1):
        n = len(entries)
        shape = SHAPES[(n + 3) % len(SHAPES)]  # start away from batch 1's last shapes
        tag = n % 11 == 5  # about 1 in 10
        entries.append({
            "id": f"{cc}-country-{i}", "kind": "country", "round": rnd,
            "name": country, "country": country, "subject": subject, "shape": shape,
            "composition": comp, "text": [country.upper()],
            "placement": TAG if tag else PLACEMENT[shape],
            "placementName": "Hanging tag" if tag else {"circle": "Curved", "tall arch": "Curved", DOME: "Curved",
                "wide horizontal oval": "Big letters", "tall rectangle": "Vertical", "hexagon": "Ribbon"}.get(shape, "Header bar"),
        })

(root / "scripts/stamps/batch-2.json").write_text(json.dumps(entries, indent=2, ensure_ascii=False) + "\n")

short = lambda s: s.replace("square with a perforated postage-stamp edge", "postage stamp").split(" (")[0].replace("wide horizontal ", "wide ")
lines = ["# Stamp library — batch 2 (2 country stamps each) for review", "",
         f"> Generated from `scripts/stamps/build-batch-2.py` → `scripts/stamps/batch-2.json`. **{len(entries)} stamps**, "
         f"{len(COUNTRIES)} countries, 2 country stamps each (no city stamps). Round E = Asia + Oceania, round F = Europe, Americas, Africa. Rules: `STAMPS.md` v2.", "",
         "| Round | Stamp | Shape | Placement | Picture |", "|---|---|---|---|---|"]
for e in entries:
    lines.append(f"| {e['round']} | {e['name']} {e['id'][-1]} | {short(e['shape'])} | {e['placementName']} | {e['subject']} — {e['composition']} |")
(root / "docs/STAMPS-BATCH2.md").write_text("\n".join(lines) + "\n")
print(len(entries), "stamps;", sum(e["placementName"] == "Hanging tag" for e in entries), "hanging tags")
