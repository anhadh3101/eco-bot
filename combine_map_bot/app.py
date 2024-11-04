from flask import Flask, render_template, request
import google.generativeai as genai
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()
BOT_API_KEY = os.getenv("BOT_API_KEY")
MAP_API_KEY = os.getenv("MAP_API_KEY")

genai.configure(api_key=BOT_API_KEY)
app = Flask(__name__)

@app.route('/', methods=['POST', 'GET'])
def index():
    if request.method == 'POST':
        prompt = request.form['prompt']
        try:
            response = genai.GenerativeModel('gemini-pro').generate_content(prompt)
            return response.text if response.text else "Sorry, I don't have an answer."
        except Exception:
            return "Error: Gemini is unavailable."
    return render_template('index.html', api_key=MAP_API_KEY)

if __name__ == '__main__':
    app.run(debug=True)
