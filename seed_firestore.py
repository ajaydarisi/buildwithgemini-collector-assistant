"""Seed Firestore with sample collectible items."""
from google.cloud import firestore

PROJECT_ID = "qwiklabs-gcp-04-1a63b44d06d9"

SAMPLE_ITEMS = [
    {
        "id": "card-charizard-1999",
        "name": "1999 Pokémon Base Set 1st Edition Shadowless Charizard Holo #4",
        "category": "Trading Cards",
        "condition": "PSA 8.5 NM-MT+",
        "price": 8500.0,
        "market_trend": "rising",
        "description": "Iconic holy grail Pokémon card. Clean holo foil, sharp corners, flawless centering.",
        "status": "available",
    },
    {
        "id": "card-black-lotus-alpha",
        "name": "Magic: The Gathering Alpha Black Lotus",
        "category": "Trading Cards",
        "condition": "BGS 8.0 Excellent",
        "price": 45000.0,
        "market_trend": "rising",
        "description": "From the original 1993 Alpha printing. The pinnacle of collectible card game history.",
        "status": "reserved",
    },
    {
        "id": "snkr-jordan-1-chicago-85",
        "name": "Nike Air Jordan 1 High OG Chicago (1985)",
        "category": "Sneakers",
        "condition": "Deadstock with OG Box",
        "price": 14500.0,
        "market_trend": "stable",
        "description": "Original 1985 release in size 10.5. Supple leather, intact collars, OG laces and hangtag.",
        "status": "available",
    },
    {
        "id": "wtch-omega-speedmaster-edwhite",
        "name": "Omega Speedmaster 'Ed White' Ref. 105.003-65",
        "category": "Watches",
        "condition": "Vintage Excellent / Unpolished",
        "price": 12800.0,
        "market_trend": "rising",
        "description": "Pre-moon straight-lug chronograph powered by legendary Calibre 321 with pumpkin patina lume.",
        "status": "available",
    },
    {
        "id": "game-super-mario-64-sealed",
        "name": "Super Mario 64 (N64, 1996) Sealed",
        "category": "Retro Gaming",
        "condition": "Wata 9.6 A++ Sealed",
        "price": 6200.0,
        "market_trend": "stable",
        "description": "First print Mario 64 with crisp corners and pristine factory H-seam intact.",
        "status": "available",
    },
    {
        "id": "vnl-miles-davis-kind-of-blue",
        "name": "Miles Davis - Kind of Blue (1959 Columbia 6-Eye Mono First Press)",
        "category": "Vinyl Records",
        "condition": "Vinyl: NM / Cover: VG+",
        "price": 1400.0,
        "market_trend": "rising",
        "description": "First mono pressing CL 1355 with deep groove labels and 'Adderly' misspelling on back.",
        "status": "available",
    },
]


def seed():
    db = firestore.Client(project=PROJECT_ID)
    collection = db.collection("collectibles")
    print(f"Seeding Firestore collection 'collectibles' in project {PROJECT_ID}...")
    for item in SAMPLE_ITEMS:
        item_id = item["id"]
        collection.document(item_id).set(item)
        print(f"  ✓ Added: {item['name']} (${item['price']:,.2f})")
    print("Seeding complete!")


if __name__ == "__main__":
    seed()
