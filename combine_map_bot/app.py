from flask import Flask, render_template, request, send_file
import google.generativeai as genai
from dotenv import load_dotenv
import os
from flask_cors import CORS

# Load environment variables
load_dotenv()
BOT_API_KEY = os.getenv("BOT_API_KEY")
MAP_API_KEY = os.getenv("MAP_API_KEY")

genai.configure(api_key=BOT_API_KEY)
model = genai.GenerativeModel('gemini-pro')
app = Flask(__name__)
CORS(app, origins="*", supports_credentials=True)

app = Flask(__name__)

@app.route('/api/home', methods=['POST', 'GET'])
def index():
    try:
        # Implement authentication
        #
        #
        return render_template('index.html', api_key=MAP_API_KEY)
    except Exception as e:  
        return str(e), 500

@app.route('/message', methods=['POST'])
def message():
    try:  
        if request.method == 'POST':
            prompt = request.form['prompt']
            response = model.generate_content(prompt)
            return response.text if response.text else "Sorry, I don't have an answer."
    except Exception:
        print("Error: Gemini is unavailable.")
        return "Error: Gemini is unavailable.", 500
        
if __name__ == '__main__':
    app.run(host="127.0.0.1", port=5000, debug=True)
