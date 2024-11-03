from flask import Flask, render_template

app = Flask(__name__)

# Define the Google Maps API key as a variable
API_KEY = "Put_your_API_here"  # Replace with your actual API key

@app.route('/')
def index():
    return render_template('index.html', api_key=API_KEY)

if __name__ == '__main__':
    app.run(debug=True)
