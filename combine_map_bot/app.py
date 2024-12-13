from flask import Flask, render_template, request, jsonify, request
import google.generativeai as genai
from pymongo import MongoClient
from datetime import datetime
from dotenv import load_dotenv
from PIL import Image
import pytesseract
import os
from flask_cors import CORS

# Load environment variables from .env file
load_dotenv()
BOT_API_KEY = os.getenv("BOT_API_KEY")
MAP_API_KEY = os.getenv("MAP_API_KEY")

# MongoDB Atlas Connection String
MONGO_URI = os.getenv("MONGO_URI")

# Configure Google Generative AI
genai.configure(api_key=BOT_API_KEY)
model = genai.GenerativeModel('gemini-pro')

# Configure MongoDB Connection
client = MongoClient(MONGO_URI)  # Connect to MongoDB Atlas
db = client['eco_bot_db']  # Use 'eco_bot_db' database
messages_collection = db['messages']  # Use 'messages' collection

# Initialize Flask app
app = Flask(__name__)
CORS(app, origins="*", supports_credentials=True)
app.config['UPLOAD_FOLDER'] = 'uploads'

# Home Route
@app.route('/', methods=['GET'])
def home():
    try:
        return render_template('index.html', api_key=MAP_API_KEY)
    except Exception as e:
        return str(e), 500

# Chatbot Message Endpoint
# Chatbot Message Endpoint
@app.route('/message', methods=['POST'])
def message():
    try:
        # Extract the user prompt
        prompt = request.form.get('prompt', '').strip()
        
        if not prompt:
            return jsonify({"error": "Prompt is required"}), 400
        
        # Check for image
        if 'image' in request.files:
            file = request.files['image']
            if file.filename == '':
                return "Error: No selected file."

            if file:
                # Save the image file
                file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
                file.save(file_path)

                try:
                    # Process the image using OCR (Optical Character Recognition)
                    with Image.open(file_path) as img:
                        extracted_text = pytesseract.image_to_string(img)

                        # Combine the extracted text with the prompt if both exist
                        if extracted_text.strip():
                            prompt = f"{prompt}\n\nImage content: {extracted_text}" if prompt else f"Image content: {extracted_text}"
                        else:
                            return "No text found in the image."
                except Exception as e:
                    return f"Error processing image: {str(e)}"
        
        # Generate a bot response
        response = genai.GenerativeModel('gemini-pro').generate_content(prompt)
        bot_response = response.text if response.text else "Sorry, I don't have an answer."

        # Log the interaction
        print("Saving to MongoDB:", {"user_message": prompt, "bot_response": bot_response})

        # Save the interaction to MongoDB
        messages_collection.insert_one({
            "user_message": prompt,
            "bot_response": bot_response,
            "timestamp": datetime.utcnow()
        })

        # Return the bot response
        return jsonify({"bot_response": bot_response}), 200
    except Exception as e:
        print(f"Error processing message: {e}")
        return jsonify({"error": "An error occurred while processing the message."}), 500

# Retrieve Chat History Endpoint
@app.route('/get_messages', methods=['GET'])
def get_messages():
    try:
        # Fetch all messages from MongoDB
        messages = list(messages_collection.find({}, {"_id": 0}).sort("timestamp", 1))
        return jsonify({"messages": messages}), 200
    except Exception as e:
        print(f"Error retrieving messages: {e}")
        return jsonify({"error": "An error occurred while retrieving messages."}), 500

# Run the Flask app
if __name__ == '__main__':
    app.run(host="127.0.0.1", port=5000, debug=True)
