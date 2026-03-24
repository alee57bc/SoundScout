//click spotify button to redirect user to login page
document.getElementById("spotify-button").addEventListener("click", () => {
    //redirect to Spotify login via Flask backend
    window.location.href = "/api/login";
});

//click logout button to logout user and update UI
document.getElementById("logout-button").addEventListener("click", async () => {
    //redirect to Spotify lougout via Flask backend
    window.location.href = "/api/logout";
});

async function checkLogin() {
    const loginSection = document.getElementById('spotify-login');
    const loggedInSection = document.getElementById('spotify-logged-in');
    const welcomeText = document.getElementById("welcome-text");
    
    try {
        const userRes = await fetch("/api/user", {
            credentials: "include"
        });

        const user = await userRes.json();

        if (userRes.ok && !user.error) {
            if (loginSection) loginSection.style.display = "none";
            if (loggedInSection) loggedInSection.style.display = "flex";
            if (welcomeText) {
                welcomeText.textContent = `Welcome, ${user.name}!`;
            }
        } else {
            if (loginSection) loginSection.style.display = "flex";
            if (loggedInSection) loggedInSection.style.display = "none";
        } 
    } catch (err) {
        console.error("Error checking login:", err);
        if (loginSection) loginSection.style.display = "flex";
        if (loggedInSection) loggedInSection.style.display = "none";
    }
}

window.addEventListener("load", checkLogin);



