import os
import glob
import json
import pickle
import random
import logging
import queue
import threading
import sqlite3
from datetime import datetime
import numpy as np
import nltk
from nltk.stem import WordNetLemmatizer
from nltk.corpus import stopwords

# Base path computation for absolute resolution
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")
DATA_DIR = os.path.join(BASE_DIR, "data")
DB_PATH = os.path.join(BASE_DIR, "unanswered_queries.db")

# Confidence Threshold
CONFIDENCE_THRESHOLD = 0.45

logger = logging.getLogger(__name__)

# Initialize lemmatizer and stopwords
lemmatizer = WordNetLemmatizer()
stop_words = set(stopwords.words('english'))

# Preprocessing function
def preprocess_text(text):
    words = nltk.word_tokenize(text.lower())
    words = [
        lemmatizer.lemmatize(word)
        for word in words
        if word.isalnum() and word not in stop_words
    ]
    return " ".join(words)

# Helper to dynamically load all intents
def load_all_intents():
    intents = []
    json_files = glob.glob(os.path.join(DATA_DIR, "*.json"))
    for filepath in sorted(json_files):
        try:
            with open(filepath, "r", encoding="utf-8") as file:
                data = json.load(file)
                if "intents" in data:
                    for intent in data["intents"]:
                        # Extract and preserve optional 'image' attribute
                        if "image" not in intent:
                            intent["image"] = None
                        intents.append(intent)
        except Exception as e:
            logger.warning(f"Failed to load {filepath}: {e}")
    return intents

# ---------------------------------------------------------------------------
# Entity Image Lookup & Fallback Engine
# ---------------------------------------------------------------------------
_ENTITY_IMAGE_CACHE = {}

# Canonical search titles for One Piece tags
TAG_SEARCH_TITLES = {
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

def _load_static_image_config():
    """Load pre-configured remote CDN fallback URLs from static/image_config.json."""
    cfg_path = os.path.join(BASE_DIR, "static", "image_config.json")
    mapping = {}
    if os.path.exists(cfg_path):
        try:
            with open(cfg_path, "r", encoding="utf-8") as f:
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
            logger.warning(f"Failed to load image_config.json: {e}")
    return mapping

_CONFIG_IMAGE_MAP = _load_static_image_config()

def get_entity_image(tag):
    """
    Fallback helper function that maps tags or queries the free public
    One Piece Fandom MediaWiki API to return a clean character/ship/location avatar URL.
    """
    if not tag or tag in ("unknown", "error", "none", "greeting", "goodbye", "thanks", "help", "about"):
        return None

    clean_tag = tag.strip().lower()

    # 1. Check in-memory cache
    if clean_tag in _ENTITY_IMAGE_CACHE:
        return _ENTITY_IMAGE_CACHE[clean_tag]

    # 2. Check local CDN map from static/image_config.json
    if clean_tag in _CONFIG_IMAGE_MAP:
        url = _CONFIG_IMAGE_MAP[clean_tag]
        _ENTITY_IMAGE_CACHE[clean_tag] = url
        return url

    # 3. Determine search title for One Piece wiki API
    search_title = TAG_SEARCH_TITLES.get(clean_tag)
    if not search_title:
        # Generate friendly title: replace underscores with spaces and capitalize
        search_title = clean_tag.replace("_", " ").title()

    # 4. Query public One Piece Fandom MediaWiki API
    try:
        import urllib.request
        import urllib.parse
        
        api_url = (
            "https://onepiece.fandom.com/api.php?action=query"
            f"&titles={urllib.parse.quote(search_title)}"
            "&prop=pageimages&format=json&pithumbsize=500"
        )
        req = urllib.request.Request(
            api_url,
            headers={"User-Agent": "OnePieceKnowledgeBot/1.0 (Public Educational Assistant)"}
        )
        with urllib.request.urlopen(req, timeout=2.5) as response:
            data = json.loads(response.read().decode("utf-8"))
            pages = data.get("query", {}).get("pages", {})
            for pid, pdata in pages.items():
                if pid != "-1" and "thumbnail" in pdata:
                    img_url = pdata["thumbnail"]["source"]
                    _ENTITY_IMAGE_CACHE[clean_tag] = img_url
                    return img_url

        # Fallback query with opensearch if direct title had no thumbnail
        search_api_url = (
            "https://onepiece.fandom.com/api.php?action=opensearch"
            f"&search={urllib.parse.quote(search_title)}&limit=1&format=json"
        )
        s_req = urllib.request.Request(
            search_api_url,
            headers={"User-Agent": "OnePieceKnowledgeBot/1.0 (Public Educational Assistant)"}
        )
        with urllib.request.urlopen(s_req, timeout=2.0) as s_resp:
            s_data = json.loads(s_resp.read().decode("utf-8"))
            if s_data and len(s_data) > 1 and s_data[1]:
                matched_title = s_data[1][0]
                fetch_url = (
                    "https://onepiece.fandom.com/api.php?action=query"
                    f"&titles={urllib.parse.quote(matched_title)}"
                    "&prop=pageimages&format=json&pithumbsize=500"
                )
                f_req = urllib.request.Request(
                    fetch_url,
                    headers={"User-Agent": "OnePieceKnowledgeBot/1.0 (Public Educational Assistant)"}
                )
                with urllib.request.urlopen(f_req, timeout=2.0) as f_resp:
                    f_data = json.loads(f_resp.read().decode("utf-8"))
                    for pid, pdata in f_data.get("query", {}).get("pages", {}).items():
                        if pid != "-1" and "thumbnail" in pdata:
                            img_url = pdata["thumbnail"]["source"]
                            _ENTITY_IMAGE_CACHE[clean_tag] = img_url
                            return img_url

    except Exception as e:
        logger.debug(f"Wiki image fetch failed for tag '{clean_tag}': {e}")

    # Cache None to avoid repeated failed remote lookups
    _ENTITY_IMAGE_CACHE[clean_tag] = None
    return None

# ---------------------------------------------------------------------------
# Asynchronous Thread-Safe SQLite Logging
# ---------------------------------------------------------------------------
_log_queue = queue.Queue(maxsize=2000)

def _init_sqlite_db():
    """Ensure database schema is created and WAL mode is enabled."""
    try:
        with sqlite3.connect(DB_PATH, timeout=30.0) as conn:
            conn.execute("PRAGMA journal_mode=WAL;")
            conn.execute("PRAGMA busy_timeout = 30000;")
            conn.execute("""
                CREATE TABLE IF NOT EXISTS unanswered_queries (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp TEXT,
                    query TEXT,
                    predicted_tag TEXT,
                    confidence REAL
                )
            """)
    except Exception as e:
        logger.warning(f"Failed to initialize SQLite database: {e}")

def _sqlite_worker():
    """Background worker daemon thread that serializes database writes safely."""
    _init_sqlite_db()
    while True:
        try:
            item = _log_queue.get()
            if item is None:
                break
            timestamp, query, predicted_tag, confidence = item
            try:
                with sqlite3.connect(DB_PATH, timeout=30.0) as conn:
                    conn.execute("PRAGMA busy_timeout = 30000;")
                    cursor = conn.cursor()
                    cursor.execute("""
                        INSERT INTO unanswered_queries (timestamp, query, predicted_tag, confidence)
                        VALUES (?, ?, ?, ?)
                    """, (timestamp, query, predicted_tag, confidence))
                    conn.commit()
            except Exception as e:
                logger.warning(f"Error logging unanswered query to SQLite in background: {e}")
            finally:
                _log_queue.task_done()
        except Exception as e:
            logger.warning(f"Unexpected error in SQLite worker loop: {e}")

# Start background SQLite writer daemon thread
_worker_thread = threading.Thread(target=_sqlite_worker, daemon=True, name="SQLiteAsyncLogger")
_worker_thread.start()

def log_unanswered_query(query, predicted_tag, confidence):
    """Enqueues query logging to background worker thread without blocking Flask request thread."""
    try:
        now_ts = datetime.utcnow().isoformat()
        _log_queue.put_nowait((now_ts, query, predicted_tag, confidence))
    except queue.Full:
        logger.warning("Unanswered queries log queue is full; query dropped from logging.")
    except Exception as e:
        logger.warning(f"Failed to enqueue unanswered query log: {e}")

# ---------------------------------------------------------------------------
# Clean Startup Model & Intent Loading
# ---------------------------------------------------------------------------
model = None
vectorizer = None
encoder = None
all_intents = []
intents_dict = {}

def load_models_and_intents():
    """Load models and intents once at application startup into memory."""
    global model, vectorizer, encoder, all_intents, intents_dict

    # Check MODELS_DIR first, fallback to BASE_DIR
    model_path = os.path.join(MODELS_DIR, "model.pkl") if os.path.exists(os.path.join(MODELS_DIR, "model.pkl")) else os.path.join(BASE_DIR, "model.pkl")
    vec_path = os.path.join(MODELS_DIR, "vectorizer.pkl") if os.path.exists(os.path.join(MODELS_DIR, "vectorizer.pkl")) else os.path.join(BASE_DIR, "vectorizer.pkl")
    enc_path = os.path.join(MODELS_DIR, "encoder.pkl") if os.path.exists(os.path.join(MODELS_DIR, "encoder.pkl")) else os.path.join(BASE_DIR, "encoder.pkl")

    if os.path.exists(model_path) and os.path.exists(vec_path) and os.path.exists(enc_path):
        try:
            with open(model_path, "rb") as f:
                model = pickle.load(f)
            with open(vec_path, "rb") as f:
                vectorizer = pickle.load(f)
            with open(enc_path, "rb") as f:
                encoder = pickle.load(f)
            logger.info("Chatbot models loaded successfully at application startup.")
        except Exception as e:
            logger.error(f"Error loading model files at startup: {e}")
            model, vectorizer, encoder = None, None, None
    else:
        logger.warning("Model files not found at startup. Please run train.py first.")
        model, vectorizer, encoder = None, None, None

    all_intents = load_all_intents()
    intents_dict = {intent["tag"]: intent for intent in all_intents}

# Execute startup loading immediately
load_models_and_intents()

def chatbot_response(text):
    """
    Generates chatbot response using preloaded models without redundant filesystem checks.
    Returns: (response_text, tag_str, confidence_float, image_url)
    """
    if model is None or vectorizer is None or encoder is None:
        return (
            "System Error: Chatbot models are not trained yet. Please ask the administrator to run train.py.",
            "error",
            0.0,
            None
        )

    processed = preprocess_text(text)
    if not processed.strip():
        # Handle queries containing only punctuation or stopwords
        return (
            "I'm not sure about that yet. Try asking me something related to One Piece, its characters, arcs, episodes, Devil Fruits, Haki, or lore.",
            "unknown",
            0.0,
            None
        )

    vector = vectorizer.transform([processed])
    
    # Get prediction probabilities
    probs = model.predict_proba(vector)[0]
    max_idx = np.argmax(probs)
    confidence = probs[max_idx]

    try:
        pred_label = model.classes_[max_idx]
        tag_str = encoder.inverse_transform([pred_label])[0]
    except Exception:
        tag_str = "unknown"

    if confidence >= CONFIDENCE_THRESHOLD:
        if tag_str in intents_dict:
            intent_data = intents_dict[tag_str]
            response = random.choice(intent_data["responses"])
            # Extract image from intent or use entity fallback helper
            image_url = intent_data.get("image") or get_entity_image(tag_str)
            return response, tag_str, float(confidence), image_url
            
        return "I found the intent but couldn't find any response for it.", tag_str, float(confidence), None
    else:
        # Non-blocking asynchronous logging for queries falling below threshold
        log_unanswered_query(text, tag_str, float(confidence))
        
        fallback_msg = "I'm not sure about that yet. Try asking me something related to One Piece, its characters, arcs, episodes, Devil Fruits, Haki, or lore."
        return fallback_msg, "unknown", float(confidence), None

if __name__ == "__main__":
    print("-" * 50)
    print("ONE PIECE KNOWLEDGE CHATBOT - CONSOLE MODE")
    print("Type 'quit' to exit.")
    print("-" * 50)
    
    while True:
        message = input("You: ")
        if message.lower() == "quit":
            print("Bot: Goodbye, nakama!")
            break
        else:
            response, tag, conf, img = chatbot_response(message)
            print(f"Bot: {response} (Tag: {tag}, Confidence: {conf:.2f}, Image: {img})")