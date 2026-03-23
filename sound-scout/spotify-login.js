//click spotify button to redirect user to login page
document.getElementById("spotify-button").addEventListener("click", () => {
    //redirect to Spotify login via Flask backend
    window.location.href = "http://localhost:8080/api/login";
});

window.addEventListener("load", async () => {
    const params = new URLSearchParams(window.location.search);

    if (params.get("login") === "success") {
        try {
            const userRes = await fetch("http://localhost:8080/api/user", {
                credentials: "include"
            });
        
            const user = await userRes.json();

            if (!userRes.ok || user.error) {
                console.error("User fetch failed:", user);
                document.getElementById("welcome-text").textContent = "Welcome!";
                return;
            }

        //logic for spotify login button
        const loginSection = document.getElementById('spotify-login');
        const loggedInSection = document.getElementById('spotify-logged-in');

        if (loginSection) loginSection.style.display = 'none';
        if (loggedInSection) loggedInSection.style.display = 'flex';

        document.getElementById("welcome-text").textContent = `Welcome, ${user.name}!`;
        } catch (err) {
            console.error("Error loading user:", err);
            document.getElementById("welcome-text").textContent = "Welcome!";
        }
    }
});


