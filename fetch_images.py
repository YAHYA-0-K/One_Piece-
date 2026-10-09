#!/usr/bin/env python3
"""
fetch_images.py - Automated Image Scraper & Injector for One Piece Knowledge Base

Scans all tags across `data/*.json`, queries verified image URLs from the
One Piece Fandom MediaWiki API and local CDN configurations, verifies image
accessibility, and automatically injects the `"image"` field into the JSON intents.

Usage:
    python fetch_images.py                  # Scan and inject images into all data/*.json
    python fetch_images.py --dry-run        # Preview changes without modifying files
    python fetch_images.py --category ships # Process only a specific category
    python fetch_images.py --force          # Overwrite existing image fields
    python fetch_images.py --verify         # Strictly verify HTTP 200 for all images
"""

import os
import sys
import glob
import json
import time
import argparse
import logging
import urllib.request
import urllib.parse
from typing import Dict, List, Optional, Tuple

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)
logger = logging.getLogger("fetch_images")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
CONFIG_PATH = os.path.join(BASE_DIR, "static", "image_config.json")

# User agent for MediaWiki API requests
USER_AGENT = "OnePieceBotImageScraper/1.0 (Educational Assistant; contact@onepiecebot.local)"

# Canonical search titles for One Piece tags to maximize exact API hits
TAG_SEARCH_TITLES: Dict[str, str] = {
    # Characters
    "luffy": "Monkey D. Luffy",
    "zoro": "Roronoa Zoro",
    "nami": "Nami",
    "usopp": "Usopp",
    "sanji": "Sanji",
    "chopper": "Tony Tony Chopper",
    "robin": "Nico Robin",
    "franky": "Franky",
    "brook": "Brook",
    "jinbe": "Jinbe",
    "shanks": "Shanks",
    "blackbeard": "Marshall D. Teach",
    "mihawk": "Dracule Mihawk",
    "law": "Trafalgar D. Water Law",
    "kid": "Eustass Kid",
    "ace": "Portgas D. Ace",
    "sabo": "Sabo",
    "dragon": "Monkey D. Dragon",
    "roger": "Gol D. Roger",
    "whitebeard": "Edward Newgate",
    "garp": "Monkey D. Garp",
    "sengoku": "Sengoku",
    "akainu": "Sakazuki",
    "aokiji": "Kuzan",
    "kizaru": "Borsalino",
    "fujitora": "Issho",
    "ryokugyu": "Aramaki",
    "kaido": "Kaidou",
    "big_mom": "Charlotte Linlin",
    "katakuri": "Charlotte Katakuri",
    "crocodile": "Crocodile",
    "doflamingo": "Donquixote Doflamingo",
    # Ships
    "going_merry": "Going Merry",
    "thousand_sunny": "Thousand Sunny",
    "oro_jackson": "Oro Jackson",
    "polar_tang": "Polar Tang",
    "red_force": "Red Force",
    # Locations
    "grand_line": "Grand Line",
    "laugh_tale": "Laugh Tale",
    "wano_country": "Wano Country",
    "wano": "Wano Country",
    "dressrosa": "Dressrosa",
    "whole_cake_island": "Whole Cake Island",
    "egghead_island": "Egghead",
    "egghead": "Egghead",
    "marineford": "Marineford",
    "skypiea": "Skypiea",
    "water_7_enies_lobby": "Water 7",
    "sabaody": "Sabaody Archipelago",
    "alabasta": "Arabasta Kingdom",
    "east_blue": "East Blue",
    "thriller_bark": "Thriller Bark",
    "impel_down": "Impel Down",
    "fishman_island": "Fish-Man Island",
    "punk_hazard": "Punk Hazard",
    "zou": "Zou",
    "government_strongholds": "Enies Lobby",
    # Arcs
    "arcs_overview": "One Piece",
    # Devil Fruits & Powers
    "devil_fruits_overview": "Devil Fruit",
    "paramecia": "Paramecia",
    "zoan": "Zoan",
    "logia": "Logia",
    "mythical_zoan": "Mythical Zoan",
    "devil_fruit_awakening": "Awakening",
    "luffy_devil_fruit": "Hito Hito no Mi, Model: Nika",
    "blackbeard_devil_fruits": "Yami Yami no Mi",
    "law_devil_fruit": "Ope Ope no Mi",
    "sun_god_nika": "Nika",
    # Haki
    "haki_overview": "Haki",
    "observation_haki": "Kenbunshoku Haki",
    "armament_haki": "Busoshoku Haki",
    "conquerors_haki": "Haoshoku Haki",
    # Crews & Organizations
    "straw_hat_crew": "Straw Hat Pirates",
    "straw_hat_joining_order": "Straw Hat Pirates",
    "straw_hat_dreams": "Straw Hat Pirates",
    "straw_hat_grand_fleet": "Straw Hat Grand Fleet",
    "red_hair_pirates": "Red Hair Pirates",
    "blackbeard_pirates": "Blackbeard Pirates",
    "whitebeard_pirates": "Whitebeard Pirates",
    "roger_pirates": "Roger Pirates",
    "rocks_pirates": "Rocks Pirates",
    "beast_pirates": "Beasts Pirates",
    "big_mom_pirates": "Big Mom Pirates",
    "marines_overview": "Marines",
    "marine_admirals": "Admiral",
    "seraphim_pacifistas": "Seraphim",
    "revolutionary_army_org": "Revolutionary Army",
    "cross_guild": "Cross Guild",
    "cipher_pol": "CP0",
    "baroque_works": "Baroque Works",
    # Lore & Mysteries
    "void_century": "Void Century",
    "joy_boy": "Joy Boy",
    "ancient_kingdom": "Great Kingdom",
    "world_government": "World Government",
    "celestial_dragons": "World Noble",
    "poneglyphs": "Poneglyph",
    "will_of_d": "Will of D.",
    "ancient_weapons": "Ancient Weapons",
    "pluton": "Pluton",
    "poseidon": "Poseidon",
    "uranus": "Uranus",
    "imu": "Nerona Imu",
    "gorosei": "Five Elders",
    # Episodes & Events
    "gear_2_debut": "Gear 2",
    "gear_3_debut": "Gear 3",
    "gear_4_debut": "Gear 4",
    "gear_5_debut": "Gear 5",
    "summit_war": "Summit War of Marineford",
    "reverie": "Levely",
    "raid_on_onigashima": "Raid on Onigashima"
}

# Non-entity conversational tags that shouldn't have entity avatars
EXCLUDED_TAGS = {
    "greeting", "goodbye", "thanks", "help", "about", "unknown", "error", "none"
}

def load_local_config_images() -> Dict[str, str]:
    """Loads CDN images defined in static/image_config.json."""
    mapping = {}
    if os.path.exists(CONFIG_PATH):
        try:
            with open(CONFIG_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
            for cat, items in data.items():
                if isinstance(items, dict):
                    for key, urls in items.items():
                        if isinstance(urls, list):
                            for u in urls:
                                if isinstance(u, str) and u.startswith("http"):
                                    mapping[key] = u
                                    break
        except Exception as e:
            logger.warning(f"Error loading {CONFIG_PATH}: {e}")
    return mapping

def verify_image_url(url: str, timeout: float = 3.0) -> bool:
    """Verifies that an image URL returns HTTP 200."""
    try:
        req = urllib.request.Request(
            url,
            headers={"User-Agent": USER_AGENT, "Referer": "https://onepiece.fandom.com/"}
        )
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return resp.status == 200
    except Exception:
        return False

def query_wiki_image(title: str, timeout: float = 3.0) -> Optional[str]:
    """Queries One Piece Fandom MediaWiki API for a clean page image."""
    try:
        url = (
            "https://onepiece.fandom.com/api.php?action=query"
            f"&titles={urllib.parse.quote(title)}"
            "&prop=pageimages&format=json&pithumbsize=500"
        )
        req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            pages = data.get("query", {}).get("pages", {})
            for pid, pdata in pages.items():
                if pid != "-1" and "thumbnail" in pdata:
                    return pdata["thumbnail"]["source"]

        # Fallback to opensearch
        search_url = (
            "https://onepiece.fandom.com/api.php?action=opensearch"
            f"&search={urllib.parse.quote(title)}&limit=1&format=json"
        )
        s_req = urllib.request.Request(search_url, headers={"User-Agent": USER_AGENT})
        with urllib.request.urlopen(s_req, timeout=timeout) as s_resp:
            s_data = json.loads(s_resp.read().decode("utf-8"))
            if s_data and len(s_data) > 1 and s_data[1]:
                matched_title = s_data[1][0]
                fetch_url = (
                    "https://onepiece.fandom.com/api.php?action=query"
                    f"&titles={urllib.parse.quote(matched_title)}"
                    "&prop=pageimages&format=json&pithumbsize=500"
                )
                f_req = urllib.request.Request(fetch_url, headers={"User-Agent": USER_AGENT})
                with urllib.request.urlopen(f_req, timeout=timeout) as f_resp:
                    f_data = json.loads(f_resp.read().decode("utf-8"))
                    for pid, pdata in f_data.get("query", {}).get("pages", {}).items():
                        if pid != "-1" and "thumbnail" in pdata:
                            return pdata["thumbnail"]["source"]
    except Exception as e:
        logger.debug(f"Wiki lookup failed for '{title}': {e}")
    return None

def fetch_image_for_tag(tag: str, local_config: Dict[str, str], verify: bool = True) -> Optional[str]:
    """Finds and verifies the best image URL for a given tag."""
    clean_tag = tag.strip().lower()
    if clean_tag in EXCLUDED_TAGS:
        return None

    # 1. Try local config CDN
    if clean_tag in local_config:
        url = local_config[clean_tag]
        if not verify or verify_image_url(url):
            return url

    # 2. Try One Piece Wiki API
    search_title = TAG_SEARCH_TITLES.get(clean_tag, clean_tag.replace("_", " ").title())
    wiki_img = query_wiki_image(search_title)
    if wiki_img:
        if not verify or verify_image_url(wiki_img):
            return wiki_img

    return None

def process_file(
    filepath: str,
    local_config: Dict[str, str],
    dry_run: bool = False,
    force: bool = False,
    verify: bool = True,
    backup: bool = False
) -> Tuple[int, int, int]:
    """
    Processes a single intent JSON file, fetching and injecting images.
    Returns: (total_intents, updated_intents, skipped_intents)
    """
    filename = os.path.basename(filepath)
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
    except Exception as e:
        logger.error(f"Failed to read {filename}: {e}")
        return 0, 0, 0

    intents = data.get("intents", [])
    if not intents:
        return 0, 0, 0

    updated_count = 0
    skipped_count = 0

    for intent in intents:
        tag = intent.get("tag", "")
        existing_image = intent.get("image")

        # Skip if already populated and not force
        if existing_image and not force:
            skipped_count += 1
            continue

        if tag in EXCLUDED_TAGS:
            if "image" not in intent:
                intent["image"] = None
            continue

        img_url = fetch_image_for_tag(tag, local_config, verify=verify)
        if img_url:
            intent["image"] = img_url
            updated_count += 1
            logger.info(f"[{filename}] Tag '{tag}' -> {img_url}")
            time.sleep(0.1)  # Gentle rate limiting for public endpoints
        else:
            if "image" not in intent:
                intent["image"] = None
            skipped_count += 1

    if updated_count > 0 and not dry_run:
        if backup:
            bak_path = filepath + ".bak"
            with open(bak_path, "w", encoding="utf-8") as bak_file:
                json.dump(data, bak_file, indent=4, ensure_ascii=False)

        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=4, ensure_ascii=False)
            f.write("\n")
        logger.info(f"Updated {filename} with {updated_count} new image URLs.")

    return len(intents), updated_count, skipped_count

def main():
    parser = argparse.ArgumentParser(description="Automated Image Scraper & Injector for One Piece Chatbot")
    parser.add_argument("--dry-run", action="store_true", help="Preview image injections without modifying files")
    parser.add_argument("--force", action="store_true", help="Re-fetch and overwrite existing image fields")
    parser.add_argument("--no-verify", action="store_true", help="Skip HTTP verification of image URLs for faster scanning")
    parser.add_argument("--category", type=str, default=None, help="Process only a specific category JSON file (e.g., characters, ships)")
    parser.add_argument("--backup", action="store_true", help="Create .bak backup files before editing")

    args = parser.parse_args()

    print("=" * 65)
    print("  GRAND LINE CHRONICLES - AUTOMATED IMAGE INJECTOR")
    print("=" * 65)
    print(f"Mode: {'DRY RUN (Preview Only)' if args.dry_run else 'LIVE INJECTION'}")
    print(f"Force Overwrite: {args.force}")
    print(f"Verify URLs: {not args.no_verify}")
    print(f"Data Directory: {DATA_DIR}")
    print("-" * 65)

    local_config = load_local_config_images()
    logger.info(f"Loaded {len(local_config)} fallback CDN entries from image_config.json")

    pattern = os.path.join(DATA_DIR, f"{args.category}.json" if args.category else "*.json")
    json_files = sorted(glob.glob(pattern))

    if not json_files:
        print(f"No JSON files found matching: {pattern}")
        sys.exit(1)

    total_scanned = 0
    total_injected = 0
    total_skipped = 0

    for filepath in json_files:
        fn = os.path.basename(filepath)
        print(f"\nProcessing {fn}...")
        scanned, injected, skipped = process_file(
            filepath,
            local_config=local_config,
            dry_run=args.dry_run,
            force=args.force,
            verify=not args.no_verify,
            backup=args.backup
        )
        total_scanned += scanned
        total_injected += injected
        total_skipped += skipped

    print("\n" + "=" * 65)
    print("  SUMMARY REPORT")
    print("=" * 65)
    print(f"Files Processed:      {len(json_files)}")
    print(f"Total Intents:        {total_scanned}")
    print(f"Images Injected:      {total_injected}")
    print(f"Existing / Skipped:   {total_skipped}")
    if args.dry_run:
        print("\n[!] Note: Run without --dry-run to write image fields into data/*.json.")
    else:
        print("\n[OK] All intents successfully processed and updated!")
    print("=" * 65)

if __name__ == "__main__":
    main()
