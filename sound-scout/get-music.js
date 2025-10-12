document.getElementById("vibe-rec-btn").addEventListener("click", async (e) => {
    e.preventDefault();

    const vibe = document.getElementById("vibe-text").value.trim();  
    let num = parseInt(document.getElementById("input-number").value);

    if (!vibe) {
        return;
    }

    if (!isNaN(num) && (num < 1 || num > 10)) {
        return; 
    }

    if (isNaN(num)) {
        num = 1; 
    }

    document.getElementById("song-output").innerHTML = "<p>Generating recommendations...</p>";

    try {
    // Send request to backend
    const res = await fetch("http://localhost:8080/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        vibe: vibe,
        num: num
      }),
    });

    // Parse response
    const data = await res.json();

    // If backend returns an error
    if (data.error) {
      document.getElementById("song-output").innerHTML = `<p>${data.error}</p>`;
      return;
    }

    // Split Gemini's output into list items
    const listItems = data.recommendations
      .split(/\n|\d+\.\s+/) // split on line breaks or numbered lists
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    // Convert to HTML
    const listHTML = `
      <strong>🎶 AI Recommendations:</strong>
      <ul>
        ${listItems.map((item) => `<li>${item}</li>`).join("")}
      </ul>
    `;

    // Display the list in your HTML output section
    document.getElementById("song-output").innerHTML = listHTML;
    } catch (error) {
    console.error("Error fetching recommendations:", error);
    let errorMessage = "⚠️ Something went wrong. Please try again.";
    
    try {
      // Try to get detailed error from response
      const errorData = await error.response?.json();
      if (errorData?.error) {
        errorMessage = `⚠️ Error: ${errorData.error}`;
        if (errorData.details) {
          errorMessage += `<br>Details: ${errorData.details}`;
        }
      }
    } catch (e) {
      // If we can't parse the error response, use the default message
    }
    
    document.getElementById("song-output").innerHTML = `<p>${errorMessage}</p>`;
  }
});
