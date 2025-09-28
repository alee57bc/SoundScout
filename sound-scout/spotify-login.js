//import { useReducer } from "react";
import { getUser } from "./get-info";

//click spotify button to redirect user to login page
document.getElementById("spotify-button").addEventListener("click", () => {
    //redirect to Spotify login via Flask backend
    window.location.href = "http://localhost:8080/api/login";
});

window.addEventListener("load", async () => {
    const params = new URLSearchParams(window.location.search);

    if (params.get("login") === "success") {
        //logic for spotify login button
        const loginSection = document.getElementById('spotify-login');
        const loggedInSection = document.getElementById('spotify-logged-in');
        const welcomeText = document.getElementById('welcome-text');

        const userName = await getUser();
        console.log(userName);

        if (loginSection) loginSection.style.display = 'none';
        if (loggedInSection) loggedInSection.style.display = 'flex';
        if (welcomeText) welcomeText.textContent = `Welcome, ${userName}!`;
    }
});


