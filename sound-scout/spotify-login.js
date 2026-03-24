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

//inactivity timer
let inactivityTimer = null;
const IDLE_TIMOUT_MS = 30 * 60 * 1000; //30 minutes

function stopTimer(){
    if (inactivityTimer) {
        clearTimeout(inactivityTimer);
        inactivityTimer = null;
    }
}

function startTimer(){
    stopTimer();

    inactivityTimer = setTimeout(() => {
        //logout user on inactivity
        window.location.href = "/api/logout";
    }, IDLE_TIMOUT_MS); 
}

function resetTimer(){
    const loggedInSection = document.getElementById('spotify-logged-in');

    //only run timer if user is logged in
    if (loggedInSection && loggedInSection.style.display === "flex") {
        startTimer();
    }
} 

function allUserActivityEvents() {
    ['click', 'mousemove', 'keydown', 'scroll', 'touchstart'].forEach(event => {
        document.addEventListener(event, resetTimer);
    });
}

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

            startTimer();
            
        } else {
            if (loginSection) loginSection.style.display = "flex";
            if (loggedInSection) loggedInSection.style.display = "none";

            stopTimer();
        } 
    } catch (err) {
        console.error("Error checking login:", err);
        if (loginSection) loginSection.style.display = "flex";
        if (loggedInSection) loggedInSection.style.display = "none";

        stopTimer();
    }
}

allUserActivityEvents();
window.addEventListener("load", checkLogin);



