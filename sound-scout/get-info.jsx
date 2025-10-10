import { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [userName, setUserName] = useState("Spotify User");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/user");
        setUserName(response.data.name);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, []);

  return <h1>Welcome, {userName}!</h1>;
}

export default App;