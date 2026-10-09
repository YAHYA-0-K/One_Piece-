import pickle
import os
import nltk
from chatbot import preprocess_text

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")

vectorizer = pickle.load(open(os.path.join(MODELS_DIR, "vectorizer.pkl"), "rb"))
model = pickle.load(open(os.path.join(MODELS_DIR, "model.pkl"), "rb"))
encoder = pickle.load(open(os.path.join(MODELS_DIR, "encoder.pkl"), "rb"))

query = "Who is Luffy?"
processed = preprocess_text(query)
vec = vectorizer.transform([processed])
probs = model.predict_proba(vec)[0]
max_idx = probs.argmax()

print(f"Processed Query: '{processed}'")
print(f"Word in vocabulary? {'luffy' in vectorizer.vocabulary_}")
print(f"Predicted Tag: {encoder.inverse_transform([model.classes_[max_idx]])[0]}")
print(f"Confidence: {probs[max_idx]:.4f}")
print(f"Total Trained Classes: {len(encoder.classes_)}")