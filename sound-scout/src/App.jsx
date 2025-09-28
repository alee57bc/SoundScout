import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'


function App() {
  const [count, setCount] = useState(0);
  const [array, setArray] = useState([]);

  const fetchAPI = async() => {
    const response = await axios.get("http://localhost:8080/api/users");
    setArray(response.data.users);
  };
  
  useEffect(() => {
    fetchAPI()

  },[]);

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
        </a>
        <a href="https://react.dev" target="_blank">
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>

          {array.map((user, index) => (
            <div key={index}>
              <span>{user}</span>
              <br></br>
            </div>
            ))}

      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
