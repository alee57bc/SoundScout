import os
from flask import Flask, session, redirect, request, jsonify, url_for
from spotipy import Spotify
from spotipy.oauth2 import SpotifyOAuth
from spotipy.cache_handler import FlaskSessionCacheHandler
from flask_cors import CORS
from dotenv import load_dotenv

#load env vars
load_dotenv()

app = Flask(__name__)

#secret key
app.config['SECRET_KEY'] = os.getenv("FLASK_SECRET_KEY")

#make it specific which orgins to accept 
cors = CORS(app, origins="*")

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
        sp_oauth.get_access_token(code)
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
    if not sp_oauth.validate_token(cache_handler.get_cached_token()):
        return jsonify({"error": "User not logged in"}), 401

    profile = sp.current_user()
    return jsonify({
        "display_name": profile.get("display_name")
    })

if __name__ == "__main__":
    app.run(debug=True, port=8080)
