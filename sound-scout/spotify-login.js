//click spotify button to redirect user to login page
document.getElementById("spotify-button").addEventListener("click", () => {
    //redirect to Spotify login via Flask backend
    window.location.href = "http://localhost:8080/api/login";
});

async function checkLogin() {
    const loginSection = document.getElementById('spotify-login');
    const loggedInSection = document.getElementById('spotify-logged-in');
    const welcomeText = document.getElementById("welcome-text");
    
    try {
        const userRes = await fetch("http://localhost:8080/api/user", {
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



