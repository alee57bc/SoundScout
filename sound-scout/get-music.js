// Vibe button logic
document.getElementById("vibe-rec-btn").addEventListener("click", async (e) => {
    e.preventDefault();

    const vibe = document.getElementById("vibe-text").value.trim();  
    let num = parseInt(document.getElementById("input-number").value);
    const warningText = document.getElementById("warning-text");
    const checkbox = document.getElementById("check");

    // Validate vibe input
    if (!vibe) {
        document.getElementById("song-output").style.display = "none";
        warningText.textContent = "Please enter a vibe description";
        warningText.style.display = "block";
        return;
    }

    // Validate number input
    if (!isNaN(num) && (num < 1 || num > 10)) {
        document.getElementById("song-output").style.display = "none";
        warningText.textContent = "Please enter a number between 1 and 10";
        warningText.style.display = "block";
        return; 
    }

    // Validate number input if checkbox is checked
    if (checkbox.checked && isNaN(num)) {
        document.getElementById("song-output").style.display = "none";
        warningText.textContent = "Please enter a number between 1 and 10";
        warningText.style.display = "block";
        return;
    }

    // Set number to 1 if checkbox is not checked
    if (!checkbox.checked) {
        num = 1; 
    }

    // Hide warning text if validation passes
    warningText.style.display = "none";
    document.getElementById("song-output").innerHTML = "<h2>Calculating vibes...</h2>";
    document.getElementById("song-output").style.display = "block";
    document.getElementById("song-output").scrollIntoView({ behavior: 'smooth' });
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
            <h2>Here are some songs for the ${vibe} vibe!</h2>
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

// Genre & BPM button logic
document.getElementById("genre-rec-btn").addEventListener("click", async (e) => {
    e.preventDefault();

    const genreDropdown = document.getElementById("genre-dropdown");
    const genreText = document.getElementById("genre-text").value.trim();
    const bpm = document.getElementById("bpm-input").value.trim();
    let num = parseInt(document.getElementById("input-number").value);
    const warningText = document.getElementById("warning-text");
    const checkbox = document.getElementById("check");
    
    // Get genre either from dropdown or text input
    let genre = genreDropdown.value === "other" ? genreText : genreDropdown.value;
    
    // Validate that at least one of genre or BPM is provided
    if (!genre && !bpm) {
        document.getElementById("song-output").style.display = "none";
        warningText.textContent = "Please enter either a genre or BPM";
        warningText.style.display = "block";
        return;
    }

    // If "other" is selected, validate genre text input
    if (genreDropdown.value === "other" && !genreText) {
        document.getElementById("song-output").style.display = "none";
        warningText.textContent = "Please enter a genre description";
        warningText.style.display = "block";
        return;
    }

    // Validate BPM range if provided
    if (bpm && (parseInt(bpm) < 60 || parseInt(bpm) > 200)) {
        document.getElementById("song-output").style.display = "none";
        warningText.textContent = "BPM must be between 60 and 200";
        warningText.style.display = "block";
        return;
    }

    // Validate number input
    if (!isNaN(num) && (num < 1 || num > 10)) {
        document.getElementById("song-output").style.display = "none";
        warningText.textContent = "Please enter a number between 1 and 10";
        warningText.style.display = "block";
        return; 
    }

    // Validate number input if checkbox is checked
    if (checkbox.checked && isNaN(num)) {
        document.getElementById("song-output").style.display = "none";
        warningText.textContent = "Please enter a number between 1 and 10";
        warningText.style.display = "block";
        return;
    }

    // Set number to 1 if checkbox is not checked
    if (!checkbox.checked) {
        num = 1; 
    }

    // Hide warning text if validation passes
    warningText.style.display = "none";
    document.getElementById("song-output").innerHTML = "<h2>Looking for songs...</h2>";
    document.getElementById("song-output").style.display = "block";
    document.getElementById("song-output").scrollIntoView({ behavior: 'smooth' });

    try { 
        const res = await fetch("http://localhost:8080/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                genre: genre || undefined,
                bpm: bpm ? parseInt(bpm) : undefined,
                num: num
            }),
        });

        const data = await res.json();

        if (data.error) {
            document.getElementById("song-output").innerHTML = `<p>${data.error}</p>`;
            return;
        }

        const listItems = data.recommendations
            .split(/\n|\d+\.\s+/)
            .map((item) => item.trim())
            .filter((item) => item.length > 0);

        const listHTML = `
            <h2>Here are some ${genre} songs!</h2>
            <ul>
                ${listItems.map((item) => `<li>${item}</li>`).join("")}
            </ul>
        `;

        document.getElementById("song-output").innerHTML = listHTML;
    } catch (error) {
        console.error("Error fetching recommendations:", error);
        let errorMessage = "⚠️ Something went wrong. Please try again.";
        
        try {
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

// Similarity button logic
document.getElementById("similarity-rec-btn").addEventListener("click", async (e) => {
    e.preventDefault();

    const similarSong = document.getElementById("similar-song").value.trim();
    let num = parseInt(document.getElementById("input-number").value);
    const warningText = document.getElementById("warning-text");
    const checkbox = document.getElementById("check");

    // Validate song/artist input
    if (!similarSong) {
        document.getElementById("song-output").style.display = "none";
        warningText.textContent = "Please enter a song or artist name";
        warningText.style.display = "block";
        return;
    }

    // Validate number input
    if (!isNaN(num) && (num < 1 || num > 10)) {
        document.getElementById("song-output").style.display = "none";
        warningText.textContent = "Please enter a number between 1 and 10";
        warningText.style.display = "block";
        return; 
    }

    // Validate number input if checkbox is checked
    if (checkbox.checked && isNaN(num)) {
        document.getElementById("song-output").style.display = "none";
        warningText.textContent = "Please enter a number between 1 and 10";
        warningText.style.display = "block";
        return;
    }

    // Set number to 1 if checkbox is not checked
    if (!checkbox.checked) {
        num = 1; 
    }

    // Hide warning text if validation passes
    warningText.style.display = "none";
    document.getElementById("song-output").innerHTML = "<h2>Finding Similar Songs...</h2>";
    document.getElementById("song-output").style.display = "block";
    document.getElementById("song-output").scrollIntoView({ behavior: 'smooth' });

    try {
        const res = await fetch("http://localhost:8080/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                similarSong: similarSong,
                num: num
            }),
        });

        const data = await res.json();

        if (data.error) {
            document.getElementById("song-output").innerHTML = `<p>${data.error}</p>`;
            return;
        }

        const listItems = data.recommendations
            .split(/\n|\d+\.\s+/)
            .map((item) => item.trim())
            .filter((item) => item.length > 0);

        const listHTML = `
            <h2>Here are some songs similar to ${similarSong}!</h2>
            <ul>
                ${listItems.map((item) => `<li>${item}</li>`).join("")}
            </ul>
        `;

        document.getElementById("song-output").innerHTML = listHTML;
    } catch (error) {
        console.error("Error fetching recommendations:", error);
        let errorMessage = "⚠️ Something went wrong. Please try again.";
        
        try {
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

// Random button logic
document.getElementById("random-rec-btn").addEventListener("click", async (e) => {
    e.preventDefault();
    
    const warningText = document.getElementById("warning-text");

    // Hide warning text
    warningText.style.display = "none";
    document.getElementById("song-output").innerHTML = "<h2>Generating A Random Recommendation...</h2>";
    document.getElementById("song-output").style.display = "block";
    document.getElementById("song-output").scrollIntoView({ behavior: 'smooth' });

    try {
        const res = await fetch("http://localhost:8080/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                random: true
            }),
        });

        const data = await res.json();

        if (data.error) {
            document.getElementById("song-output").innerHTML = `<p>${data.error}</p>`;
            return;
        }

        const listItems = data.recommendations
            .split(/\n|\d+\.\s+/)
            .map((item) => item.trim())
            .filter((item) => item.length > 0);

        const listHTML = `
            <h2>Your Random Recommendation!</h2>
            <ul>
                ${listItems.map((item) => `<li>${item}</li>`).join("")}
            </ul>
        `;

        document.getElementById("song-output").innerHTML = listHTML;
    } catch (error) {
        console.error("Error fetching recommendations:", error);
        let errorMessage = "⚠️ Something went wrong. Please try again.";
        
        try {
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