import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config({ path: '../../.env' });

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Check if API key is available
if (!process.env.GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY is not set in environment variables");
  process.exit(1);
}

console.log("✅ GEMINI_API_KEY is loaded");

const ai = new GoogleGenAI(process.env.GEMINI_API_KEY);

app.post("/api/generate", async (req, res) => {
  try {
    console.log("Received request body:", req.body);
    const { personal, vibe, genre, bpm, similarSong, random, num } = req.body;

    let prompt = "";

    if (vibe) {
      prompt = `Recommend ${num || 1} songs that match this vibe: "${vibe}".`;
    } else if (genre || bpm) {
      prompt = `Recommend ${num || 1} songs in the genre "${genre || "any"}"${
        bpm ? ` with a BPM around ${bpm}` : ""
      }.`;
    } else if (similarSong) {
      prompt = `Recommend ${num || 1} songs similar to "${similarSong}".`;
    } else if (random) {
      prompt = `Give me ${num || 1} random great songs across any genre.`;
    } else {
      return res.status(400).json({ error: "No prompt data provided." });
    }

    console.log("Generated prompt:", prompt);

    try {
      console.log("Sending request to Gemini API...");
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
      
      if (!response) {
        throw new Error("No response from Gemini API");
      }

      console.log("Received response from Gemini API");
      const text = response.text;

      if (!text) {
        throw new Error("Empty response from Gemini API");
      }

      console.log("Successfully processed response");
      // Send back JSON with recommendations
      res.json({ recommendations: text });
    } catch (apiError) {
      console.error("Gemini API Error:", apiError);
      throw new Error(`Gemini API Error: ${apiError.message}`);
    }
  } catch (err) {
    console.error("Error generating recommendations:", err);
    res.status(500).json({ 
      error: "Failed to generate recommendations",
      details: err.message || "Unknown error"
    });
  }
});

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});