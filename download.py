# ==============================================================================
# Grand Line Chronicles - NLTK Resource Downloader
#
# IMPORTANT: Run this script as a mandatory build/deployment step before
# starting the application for the first time or in a new environment.
# It downloads all necessary tokenizers, lemmatizers, and stopwords lists.
# ==============================================================================
import nltk

print("Downloading required NLTK resources...")
nltk.download("punkt")
nltk.download("punkt_tab")
nltk.download("wordnet")
nltk.download("stopwords")

print("NLTK resources successfully downloaded")