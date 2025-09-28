import axios from "axios";

export async function getUser() {
  try {
    const response = await axios.get("http://localhost:8080/api/user", {
      withCredentials: true   // sends session cookie
    });
    return response.data.display_name;  // backend returns { display_name: ... }
  } catch (err) {
    console.error("Error fetching user:", err);
    return "User";  // default fallback
  }
}


