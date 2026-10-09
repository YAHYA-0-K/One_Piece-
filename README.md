# Grand Line Chronicles - One Piece AI/Knowledge Chatbot

A polished, immersive One Piece Knowledge Assistant web application. It combines a custom Natural Language Processing (NLP) machine learning pipeline with a modern, responsive theme modeled after the Great Pirate Era of One Piece.

---

## 🏴‍☠️ Project Features
- **Dynamic Dataset Scanning**: Add any domain-specific JSON file to `data/` (e.g., `data/manga.json`), and the training script automatically discovers and incorporates its intents.
- **Enhanced Accuracy Pipeline**: Incorporates regular expressions for single-character digits to preserve distinctions like "Gear 2" vs "Gear 5", and set a lower regularization bounds ($C=100.0$) in Logistic Regression to yield crisp prediction confidences.
- **Confidence Threshold**: Implements a configurable threshold (`CONFIDENCE_THRESHOLD = 0.45`). Any out-of-domain question (e.g., "How do I cook pizza?") returns a friendly pirate fallback.
- **Polished Anime Web UI**:
  - Deep ocean dark theme with gold, cream, and glassmorphic elements.
  - Floating 3D skull logo, bouncing typing indicator, and smooth message transitions.
  - Canvas-based particle background animation simulating rising bubbles and ocean currents.
  - Sidebar displaying quick categories and real-time classification metadata (detected intent & confidence).
  - Clear Log and suggested prompts to jump-start the voyage.

---

## 📂 Project Structure

```
ONE_PIECE_CHATBOT/
│
├── app.py                  # Flask web server & chat API
├── chatbot.py              # Chatbot inference & text preprocessing
├── train.py                # Dynamic model training script
├── download.py             # NLTK resource downloader
├── requirements.txt        # Package dependencies list
├── README.md               # User documentation
│
├── data/                   # Modular dataset (17 categories)
│   ├── general.json
│   ├── characters.json
│   ├── crews.json
│   ├── arcs.json
│   ├── episodes.json
│   ├── devil_fruits.json
│   ├── haki.json
│   ├── world_lore.json
│   ├── organizations.json
│   ├── pirates.json
│   ├── marines.json
│   ├── bounties.json
│   ├── ships.json
│   ├── locations.json
│   ├── mysteries.json
│   ├── powers.json
│   └── important_events.json
│
├── models/                 # Serialized model pickles
│   ├── model.pkl
│   ├── vectorizer.pkl
│   └── encoder.pkl
│
├── templates/
│   └── index.html          # Web UI template
│
└── static/
    ├── style.css           # Styling, themes & animations
    └── script.js           # Fetch API & canvas animation logic
```

---

## 🛠️ Setup & Installation

### 1. Install Dependencies
Make sure you have Python 3.8+ installed. Run the following command to install the required libraries:
```bash
pip install -r requirements.txt
```

### 2. Download NLTK Resources
To fetch the required tokenizers, lemmatizers, and stopwords:
```bash
python download.py
```

---

## ⚔️ Training the Chatbot

To train the machine learning classifier, run:
```bash
python train.py
```
This script will scan the `data/` folder, print a list of loaded files, output statistics (total intents and patterns), and save the trained artifacts to the `models/` directory:
- `models/model.pkl`
- `models/vectorizer.pkl`
- `models/encoder.pkl`

---

## 🚀 Running the Web Interface

Start the Flask development server by running:
```bash
python app.py
```
The server will spin up on your local interface. Open your browser and navigate to:
```
http://127.0.0.1:5000/
```

---

## 🗺️ Adding Custom Topics or Intents

### How to add a new topic file:
Simply create a new `.json` file inside the `data/` directory. For example, `data/manga.json`.
Inside the file, use the following schema:
```json
{
    "intents": [
        {
            "category": "manga",
            "tag": "chapters_count",
            "patterns": [
                "How many chapters are in One Piece?",
                "Total manga chapters",
                "Manga chapter count"
            ],
            "responses": [
                "One Piece has over 1,100 chapters and is currently ongoing in Weekly Shonen Jump. Oda has been writing it since July 1997."
            ]
        }
    ]
}
```

Once the file is saved, run `python train.py`. The script will automatically scan and merge your new intents. No modifications to `train.py` or `chatbot.py` are required!

---

## 🧬 Machine Learning Pipeline Details
1. **Preprocessing**: Text is lowercased and tokenized using NLTK. Punctuation is removed, and words are lemmatized. Words matching English stopwords are excluded, while alphanumeric tokens (retaining digits like "2" or "5") are kept.
2. **Feature Extraction**: CountVectorizer converts text patterns into sparse word-count vectors. It uses a custom token pattern `r"(?u)\b\w+\b"` to ensure single characters/numbers are not ignored.
3. **Classification**: A Logistic Regression model (with `C=100.0` to maximize model confidence on correct matches) learns the mapping from word patterns to intent tags.
4. **Encoding**: LabelEncoder maps textual intent tags (like `luffy`) to numerical targets.
