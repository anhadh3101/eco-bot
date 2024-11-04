# Bot & Map Services

## Steps to run

1. Create a `.env` file and add [bot API key](https://aistudio.google.com/app/apikey) & [map API key](https://mapsplatform.google.com/) into it

```terminal
BOT_API_KEY="Put_your_API_here"
MAP_API_KEY="Put_your_API_here"
```

2. Create and activate a virtual environment

```terminal
python3 -m venv .venv && source .venv/bin/activate
```

3. Install all requirements

```terminal
pip install -r requirements.txt
```

4. Run the app

```terminal
python app.py
```