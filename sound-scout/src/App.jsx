import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

// Configure axios defaults
axios.defaults.baseURL = 'http://localhost:8080'
axios.defaults.withCredentials = true


function App() {
  // State for input fields
  const [vibe, setVibe] = useState('');
  const [genre, setGenre] = useState('');
  const [bpm, setBpm] = useState('');
  const [similar, setSimilar] = useState('');
  
  // State for recommendations
  const [recommendations, setRecommendations] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Function to handle generate button clicks
  const handleGenerate = async (type) => {
    setLoading(true);
    setError('');
    try {
      let data = { num: 3 }; // Default number of recommendations
      
      switch (type) {
        case 'vibe':
          data.vibe = vibe;
          break;
        case 'genre':
          data.genre = genre;
          if (bpm) data.bpm = parseInt(bpm);
          break;
        case 'similar':
          data.similarSong = similar;
          break;
        case 'personal':
          data.personal = true;
          break;
      }

      const response = await axios.post('/api/generate', data);
      setRecommendations(response.data.recommendations);
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <h1>SoundScout</h1>
      
      <div className="input-section">
        <div className="input-group">
          <h2>Vibe-based Recommendations</h2>
          <input
            type="text"
            value={vibe}
            onChange={(e) => setVibe(e.target.value)}
            placeholder="Enter vibe (e.g., chill, upbeat, indie)"
          />
          <button onClick={() => handleGenerate('vibe')} disabled={loading || !vibe}>
            Generate Vibe Recommendations
          </button>
        </div>

        <div className="input-group">
          <h2>Genre & BPM Recommendations</h2>
          <input
            type="text"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            placeholder="Enter genre"
          />
          <input
            type="number"
            value={bpm}
            onChange={(e) => setBpm(e.target.value)}
            placeholder="Enter BPM"
          />
          <button onClick={() => handleGenerate('genre')} disabled={loading || (!genre && !bpm)}>
            Generate Genre/BPM Recommendations
          </button>
        </div>

        <div className="input-group">
          <h2>Similar Artist/Song Recommendations</h2>
          <input
            type="text"
            value={similar}
            onChange={(e) => setSimilar(e.target.value)}
            placeholder="Enter artist or song name"
          />
          <button onClick={() => handleGenerate('similar')} disabled={loading || !similar}>
            Generate Similar Recommendations
          </button>
        </div>
      </div>

      {loading && <div className="loading">Generating recommendations...</div>}
      {error && <div className="error">{error}</div>}
      
      {recommendations && (
        <div className="recommendations">
          <h2>Recommendations</h2>
          <pre>{recommendations}</pre>
        </div>
      )}
    </div>
  )
}

export default App
