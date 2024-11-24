# Bot & Map Services

## Steps to run

1. Create a `.env` file and add [bot API key](https://aistudio.google.com/app/apikey), [map API key](https://mapsplatform.google.com/) & MONGO_URI into it

```terminal
BOT_API_KEY="Put_your_API_here"
MAP_API_KEY="Put_your_API_here"
MONGO_URI="mongodb+srv://<user>:<password>@eco-bot-cluster.vrfg6.mongodb.net/?retryWrites=true&w=majority&appName=Eco-bot-cluster"
```

2. Create a `uploads` folder to contain the uploaded image from the users

3. Create and activate a virtual environment

```terminal
python3 -m venv .venv && source .venv/bin/activate
```

4. Install all requirements

```terminal
pip install -r requirements.txt
```

5. Run the app

```terminal
python app.py
```

6. Open your browser and navigate to:

http://127.0.0.1:5000/
