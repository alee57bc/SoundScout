import os
from flask import Flask, session, redirect, request, jsonify, url_for
from spotipy import Spotify
from spotipy.oauth2 import SpotifyOAuth
from spotipy.cache_handler import FlaskSessionCacheHandler
from flask_cors import CORS
from dotenv import load_dotenv
from google import genai

import google.generativeai as genai

load_dotenv()

# Initialize Gemini client
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
gemini_client = genai.GenerativeModel('gemini-pro')

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv("FLASK_SECRET_KEY")

#make cookies
app.config.update(
    SESSION_COOKIE_SAMESITE="lax",   
    SESSION_COOKIE_SECURE=False
)

#make it specific which orgins to accept 
#cors = CORS(app, origins="*")
cors = CORS(app, supports_credentials=True, origins="http://localhost:5173")

#spotify OAuth setup
cache_handler = FlaskSessionCacheHandler(session)
sp_oauth = SpotifyOAuth(
    client_id=os.getenv("SPOTIPY_CLIENT_ID"),
    client_secret=os.getenv("SPOTIPY_CLIENT_SECRET"),
    redirect_uri=os.getenv("SPOTIPY_REDIRECT_URI"), 
    scope=os.getenv("SPOTIPY_SCOPE"),
    cache_handler=cache_handler,
    show_dialog=True
)

sp = Spotify(auth_manager=sp_oauth)

#token helper function
def get_token():
    token_info = session.get('token_info')
    if not token_info:
        return None

    # refresh if expired
    if sp_oauth.is_token_expired(token_info):
        token_info = sp_oauth.refresh_access_token(token_info['refresh_token'])
        session['token_info'] = token_info

    return token_info['access_token']

def spotify_client():
    access_token = get_token()
    if not access_token:
        return None
    return Spotify(auth=access_token)

#routes
@app.route("/api/login")
def login():
    if not sp_oauth.validate_token(cache_handler.get_cached_token()):
        auth_url = sp_oauth.get_authorize_url()
        return redirect(auth_url)
    return redirect(url_for('frontend'))

#get access token so users dont have to keep logging in
@app.route("/api/callback")
def callback():
    code = request.args.get("code")
    if not code:
        return "Missing code", 400
    
    token_info = sp_oauth.get_access_token(code)
    session['token_info'] = token_info

    # Redirect back to frontend with success flag
    return redirect("http://localhost:5173/?login=success")

#return to frontend
@app.route("/api/frontend")
def frontend():
    return redirect('http://localhost:5173/')

@app.route("/api/logout")
def logout():
    session.clear()
    return redirect(url_for('frontend'))

@app.route("/api/user", methods=['GET'])
def user():
    sp = spotify_client()
    print("SESSION:", dict(session))
    if not sp:
        return jsonify({"error": "Not logged in"}), 401

    me = sp.current_user()
    print("SPOTIFY USER:", me)
    return jsonify({
        "id": me.get("id"),
        "name": me.get("display_name") or me.get("id"),
        "email": me.get("email") 
    })

#get users current top tracks   
@app.route('/api/top-tracks', methods=['GET'])
def get_top_tracks():
    sp = spotify_client()
    if not sp:
        return jsonify({"error": "Not logged in"}), 401

    # short_term ~ last 4 weeks; you can also offer medium_term/long_term
    items = sp.current_user_top_tracks(limit=20, time_range="short_term")["items"]

    return jsonify([{
        "name": t["name"],
        "artist": ", ".join(a["name"] for a in t["artists"]),
        "id": t["id"],
        "uri": t["uri"]
    } for t in items])

#get users top artists
@app.route('/api/top-artists')
def top_artists():
    sp = spotify_client()
    if not sp:
        return jsonify({"error": "Not logged in"}), 401

    items = sp.current_user_top_artists(limit=15, time_range="short_term")["items"]
    return jsonify([{
        "name": a["name"],
        "genres": a.get("genres", [])[:5],
        "id": a["id"],
        "uri": a["uri"]
    } for a in items])

@app.route('/api/generate', methods=['POST'])
def generate_recommendations():
    data = request.json
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    try:
        num = data.get('num', 3)  # Default to 3 recommendations
        
        if data.get('vibe'):
            prompt = f"""Recommend {num} songs that match this vibe: "{data['vibe']}".
                Please return your recommendations as plain text with each song on its own line, formatted as "Song Title by Artist Name".
                For each song, add a brief explanation of why it matches the vibe.
            """
        elif data.get('genre') or data.get('bpm'):
            genre_text = f'in the genre "{data["genre"]}"' if data.get('genre') else ''
            bpm_text = f' with a BPM around {data["bpm"]}' if data.get('bpm') else ''
            prompt = f"""Recommend {num} songs {genre_text}{bpm_text}.
                Please return your recommendations as plain text with each song on its own line, formatted as "Song Title by Artist Name".
                For each song, add a brief explanation of why it matches the criteria.
            """
        elif data.get('similarSong'):
            prompt = f"""Recommend {num} songs similar to "{data['similarSong']}".
                Please return your recommendations as plain text with each song on its own line, formatted as "Song Title by Artist Name".
                For each song, add a brief explanation of why it's similar.
            """
        elif data.get('personal'):
            sp = spotify_client()
            if not sp:
                return jsonify({"error": "Not logged in"}), 401
            top_tracks = sp.current_user_top_tracks(limit=15, time_range="short_term")["items"]
            top_artists = sp.current_user_top_artists(limit=10, time_range="short_term")["items"]

            track_lines = [f'{t["name"]} — {t["artists"][0]["name"]}' for t in top_tracks]
            artist_lines = [a["name"] for a in top_artists]

            prompt = f"""
            You are a music recommendation assistant.
            Recommend {num} songs the user would likely enjoy.

            User's top artists:
            {", ".join(artist_lines)}

            User's top tracks:
            - """ + "\n- ".join(track_lines) + """

            Rules:
            - Include a mix of familiar-adjacent and a few “stretch” recommendations.
            - Return as JSON list: [{"song":"...","artist":"...","why":"..."}]
            """

        else:
            return jsonify({'error': 'No valid recommendation criteria provided'}), 400

        response = gemini_client.generate_content(prompt)
        return jsonify({'recommendations': response.text})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=8080)
