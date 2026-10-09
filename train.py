import os
import glob
import json
import pickle
import nltk
from nltk.stem import WordNetLemmatizer
from nltk.corpus import stopwords
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split

# Base path computation for absolute resolution
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")
DATA_DIR = os.path.join(BASE_DIR, "data")

# Ensure models directory exists
os.makedirs(MODELS_DIR, exist_ok=True)

# Preprocessing utilities
lemmatizer = WordNetLemmatizer()
stop_words = set(stopwords.words('english'))

def preprocess(text):
    words = nltk.word_tokenize(text.lower())
    words = [
        lemmatizer.lemmatize(word)
        for word in words
        if word.isalnum() and word not in stop_words
    ]
    return " ".join(words)

def main():
    print("Scanning for intent files in the 'data/' directory...")
    json_files = glob.glob(os.path.join(DATA_DIR, "*.json"))
    
    if not json_files:
        print("Error: No JSON files found in the 'data/' directory!")
        return

    print("\nLoaded:")
    for filepath in sorted(json_files):
        print(f"- {os.path.basename(filepath)}")

    all_intents = []
    
    # Load all intents from each JSON file
    for filepath in json_files:
        try:
            with open(filepath, "r", encoding="utf-8") as file:
                data = json.load(file)
                if "intents" in data:
                    all_intents.extend(data["intents"])
        except Exception as e:
            print(f"Warning: Failed to load {filepath} - {e}")

    total_intents = len(all_intents)
    if total_intents == 0:
        print("Error: No intents found in the loaded JSON files!")
        return

    sentences = []
    labels = []
    pattern_count = 0

    for intent in all_intents:
        tag = intent["tag"]
        patterns = intent.get("patterns", [])
        pattern_count += len(patterns)
        
        for pattern in patterns:
            sentences.append(preprocess(pattern))
            labels.append(tag)

    print(f"\nTotal intent count: {total_intents}")
    print(f"Total patterns: {pattern_count}")

    if not sentences:
        print("Error: No training sentences extracted!")
        return

    encoder = LabelEncoder()
    y = encoder.fit_transform(labels)

    # 1. 80/20 train/test split for validation reporting
    # Since some intents may have very few examples, stratify=None avoids errors on tiny classes.
    X_train_raw, X_test_raw, y_train, y_test = train_test_split(
        sentences, y, test_size=0.2, random_state=42, stratify=None
    )

    # Configure CountVectorizer with unigrams + bigrams and single-character retention
    val_vectorizer = CountVectorizer(ngram_range=(1, 2), token_pattern=r"(?u)\b\w+\b")
    X_train = val_vectorizer.fit_transform(X_train_raw)
    X_test = val_vectorizer.transform(X_test_raw)

    # Balanced regularization (C=5.0) to prevent overfitting on small pattern sets
    val_model = LogisticRegression(max_iter=1000, C=5.0)
    val_model.fit(X_train, y_train)

    test_accuracy = val_model.score(X_test, y_test)
    print(f"\nHeld-out Test Accuracy: {test_accuracy:.4f} (based on 80/20 train/test split)")

    # Print a few misclassified examples
    predictions = val_model.predict(X_test)
    misclassified_indices = [i for i in range(len(y_test)) if y_test[i] != predictions[i]]

    print("\nMisclassified Examples:")
    if misclassified_indices:
        for idx in misclassified_indices[:5]:
            orig_sentence = X_test_raw[idx]
            true_tag = encoder.inverse_transform([y_test[idx]])[0]
            pred_tag = encoder.inverse_transform([predictions[idx]])[0]
            print(f"- Input: '{orig_sentence}'")
            print(f"  True tag: '{true_tag}' | Predicted tag: '{pred_tag}'")
    else:
        print("None! Perfect classification on the test set.")

    # 2. Fit the final model on the full dataset for deployment
    print("\nFitting final model on the full dataset...")
    vectorizer = CountVectorizer(ngram_range=(1, 2), token_pattern=r"(?u)\b\w+\b")
    x = vectorizer.fit_transform(sentences)
    
    model = LogisticRegression(max_iter=1000, C=5.0)
    model.fit(x, y)

    # Save to models directory and base directory using absolute paths
    for target_dir in [MODELS_DIR, BASE_DIR]:
        pickle.dump(model, open(os.path.join(target_dir, "model.pkl"), "wb"))
        pickle.dump(vectorizer, open(os.path.join(target_dir, "vectorizer.pkl"), "wb"))
        pickle.dump(encoder, open(os.path.join(target_dir, "encoder.pkl"), "wb"))

    print(f"Model trained and saved successfully to '{MODELS_DIR}' and '{BASE_DIR}'.")

if __name__ == "__main__":
    main()
