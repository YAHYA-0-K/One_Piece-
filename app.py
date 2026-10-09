from flask import Flask, render_template, request, jsonify
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from chatbot import chatbot_response
import os
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s',
    handlers=[
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Configurable rate limiter storage for graceful multi-worker scalability
RATELIMIT_STORAGE_URI = os.getenv("RATELIMIT_STORAGE_URI") or os.getenv("REDIS_URL") or "memory://"

try:
    limiter = Limiter(
        key_func=get_remote_address,
        app=app,
        default_limits=["200 per day", "50 per hour"],
        storage_uri=RATELIMIT_STORAGE_URI
    )
    logger.info(f"Rate limiter successfully initialized with storage: {RATELIMIT_STORAGE_URI}")
except Exception as e:
    logger.warning(
        f"Failed to initialize rate limiter with storage '{RATELIMIT_STORAGE_URI}': {e}. "
        "Falling back safely to in-memory storage."
    )
    limiter = Limiter(
        key_func=get_remote_address,
        app=app,
        default_limits=["200 per day", "50 per hour"],
        storage_uri="memory://"
    )

@app.errorhandler(429)
def ratelimit_handler(e):
    return jsonify({
        "response": "Easy there, nakama! You are sending messages too fast. Let's take a breather.",
        "intent": "rate_limit",
        "confidence": 0.0,
        "image": None
    }), 429

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
@limiter.limit("30 per minute")
def chat():
    try:
        data = request.get_json()
        if not data or 'message' not in data:
            return jsonify({
                "response": "I didn't receive any message, nakama.",
                "intent": "none",
                "confidence": 0.0,
                "image": None
            }), 400
        
        user_message = data['message'].strip()
        if not user_message:
            return jsonify({
                "response": "It seems your message is empty. Ask me anything about One Piece!",
                "intent": "none",
                "confidence": 0.0,
                "image": None
            })
        
        # Validate message length
        if len(user_message) > 500:
            return jsonify({
                "response": "Your message is too long, nakama. Please keep it under 500 characters.",
                "intent": "none",
                "confidence": 0.0,
                "image": None
            }), 400
        
        response, intent_tag, confidence, image_url = chatbot_response(user_message)
        
        return jsonify({
            "response": response,
            "intent": intent_tag,
            "confidence": confidence,
            "image": image_url
        })
    except Exception as e:
        logger.exception("Error handling chat request")
        return jsonify({
            "response": "Forgive me, nakama, but my gears seem to have jammed! An internal error occurred.",
            "intent": "error",
            "confidence": 0.0,
            "image": None
        }), 500

if __name__ == '__main__':
    # Run the server
    app.run(host='127.0.0.1', port=5000, debug=False)
