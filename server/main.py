import os
from flask import Flask, session, redirect, request, jsonify, url_for
from spotipy import Spotify
from spotipy.oauth2 import SpotifyOAuth
from spotipy.cache_handler import FlaskSessionCacheHandler
from flask_cors import CORS
from dotenv import load_dotenv
from google import genai

load_dotenv()

# Initialize Gemini client
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
gemini_client = genai.GenerativeModel('gemini-pro')

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv("FLASK_SECRET_KEY")

#make cookies
app.config.update(
    SESSION_COOKIE_SAMESITE="None",   # allow cross-origin
    SESSION_COOKIE_SECURE=False       # True if using HTTPS; False is okay for localhost
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
    if code:
        token_info = sp_oauth.get_cached_token()
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
    user = sp.current_user()  
    return jsonify({"name": user["display_name"]})

    #token_info = session.get('token_info')

    #if not token_info or not sp_oauth.validate_token(token_info):
    #    return jsonify({"error": "User not logged in"}), 401
    
    #sp1 = Spotify(auth=token_info['access_token'])
    #profile = sp1.current_user()
    #return jsonify({
    #    "display_name": profile.get("display_name")
    #})

#get users current top tracks   
@app.route('/api/top-tracks', methods=['GET'])
def get_top_tracks():
    if not sp_oauth.validate_token(cache_handler.get_cached_token()):
        auth_url = sp_oauth.get_authorize_url()
        return redirect(auth_url)
    
    top_tracks = sp.current_user_top_tracks(limit=10, time_range='short_term')
    return jsonify(top_tracks)

    #track_ids = [track['id'] for track in top_tracks['items']]
    #audio_features = sp.audio_features(track_ids)

    #combined = []
    #for track, features in zip(top_tracks['items'], audio_features):
    #    combined.append({
    #        "name": track['name'],
    #        #"artist": track['artists'][0]['name'],
    #        "features": {
    #            "tempo": features['tempo'],
    #            "danceability": features['danceability'],
    #            "energy": features['energy'],
    #            "loudness": features['loudness'],
    #            "liveness": features['liveness']
    #        }
    #    })

    


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
            prompt = f"""Recommend {num} random great songs across any genre.
                Please return your recommendations as plain text with each song on its own line, formatted as "Song Title by Artist Name".
                For each song, add a brief explanation of why it's worth listening to.
            """
        else:
            return jsonify({'error': 'No valid recommendation criteria provided'}), 400

        response = gemini_client.generate_content(prompt)
        return jsonify({'recommendations': response.text})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=8080)
