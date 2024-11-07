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
app = Flask(__name__)
CORS(app, origins="*", supports_credentials=True)

@app.route('/api/home', methods=['POST', 'GET'])
def index():
    if request.method == 'POST':
        prompt = request.form['prompt']
        try:
            response = genai.GenerativeModel('gemini-pro').generate_content(prompt)
            return response.text if response.text else "Sorry, I don't have an answer."
        except Exception:
            return "Error: Gemini is unavailable."
    try:
        print("hello")
        return render_template('index.html', api_key=MAP_API_KEY)
    except Exception as e:  
        return str(e), 500

if __name__ == '__main__':
    app.run(host="127.0.0.1", port=5000, debug=True)
