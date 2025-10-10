from google import genai
import os
from dotenv import load_dotenv

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

songs_json = {
  "songs": [
      {"title": "leading me on but i'm not mad about it", "artist": "remy"},
      {"title": "Wonderland", "artist": "iri"},
      {"title": "Tek It", "artist": "Cafune"},
      {"title": "Tokyo Flash", "artist": "Vaundy"},
      {"title": "Girls & Boys", "artist": "Jesse"},
      {"title": "R.I.P OFF", "artist": "Jesse"},
      {"title": "Devil's Advocate", "artist": "The Neighborhood"},
      {"title": "Wurli", "artist": "Dominic Fike"},
      {"title": "Hell N Back", "artist": "Bakar"},
      {"title": "Making Faces", "artist": "Dream, Ivory"},
      {"title": "so bitter", "artist": "Stxlkin"},
      {"title": "Pop Star", "artist": "Coco & Clair Clair"},
      {"title": "fairy of shampoo", "artist": "dosii"},
      {"title": "Lucky Me", "artist": "Nolie"},
      {"title": "The Kiss of Venus", "artist": "Dominic Fike"},
      {"title": "Second Life", "artist": "SEVENTEEN"},  
      {"title": "i wanna slam by head against the wall", "artist": "glaive"},
      {"title": "Shut up My Moms Calling", "artist": "Hotel Ugly"},
      {"title": "xoxosos", "artist": "keshi"},
      {"title": "Lost in Translation", "artist": "The Neighborhood"},
      {"title": "Silver Lining", "artist": "the Neighborhood"},
      {"title": "Partner in Crime", "artist": "Lucy Dacus"},
      {"title": "Shadow", "artist": "SEVENTEEN"},
      {"title": "Spite", "artist": "Omar Apollo"},
      {"title": "Neon Guts", "artist": "Lil Uzi Vert"},
      {"title": "War With Heaven", "artist": "keshi"},
      {"title": "FAMJAM4000", "artist": "Jordan Ward"},
      {"title": "Soft Spot", "artist": "keshi"},
      {"title": "Someone To Call My Lover", "artist": "Janet Jackson"},
      {"title": "See you in hell", "artist": "Yves"},
      {"title": "RIDE AGAIN", "artist": "Jasper Typical"},
      {"title": "CONCUBANIA!", "artist": "Isaia Huron"},
      {"title": "HOW TO LOVE", "artist": "JEY"},
      {"title": "Chemical", "artist": "Post Malone"}
    ]
}

vibe = "chill, upbeat, indie"

genre = "R&B"

bpm = 120

similar = "Malcom Todd"

personal = client.models.generate_content(
  model="gemini-2.5-flash",
  contents=f"""Here is a JSON list of songs: {songs_json}
    Based on the songs provided, recomend 10 new songs that match the overall vibe.
    Please return your recommendations as plain text with each song on its own line, formatted as "Song Title by Artist Name".
    Give me 2 sentence explanation as to why you chose each song.
  """
)

vibe = client.models.generate_content(
  model="gemini-2.5-flash",
  contents=f"""Please recomend 3 songs that match this vibe: {vibe}.
    Please return your recommendations as plain text in a JSON list, formatted as "Song Title by Artist Name".
  """
)

genre = client.models.generate_content(
  model="gemini-2.5-flash",
  contents=f"""Here are generes: {genre}. Here is a BPM: {bpm}. Return 3 songs that match either this genere, bpm, or both.
    Please return your recommendations as plain text in a JSON list, formatted as "Song Title by Artist Name".
  """
)

similarity = client.models.generate_content(
  model="gemini-2.5-flash",
  contents=f"""Given this song or artist {similar}, please recomend 3 songs that are similar to it.
    Please return your recommendations as plain text in a JSON list, formatted as "Song Title by Artist Name".
  """
)

random = client.models.generate_content(
  model="gemini-2.5-flash",
  contents=f"""Give me one random song recomendation.
    Please return your recommendations as plain text in a JSON list, formatted as "Song Title by Artist Name".
  """
)


print(personal.text)
#print(vibe.text)
#print(genre.text)
#print(similarity.text)
#print(random.text)
