import { useState } from "react";
import "./App.css";
import axios from "axios";
import StudentForm from "./components/StudentForm";
import useToken from "./contexts/TokenContext";

const BACKEND_URL = "http://localhost:8080";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { saveToken, token, removeToken } = useToken();

  async function handleLogin() {
    setError("");
    setLoading(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/auth/login`, {
        email: email,
        password: password,
      });

      saveToken(response.data.token);
      setEmail("");
      setPassword("");
    } catch (err) {
      console.error("Login error:", err);
      setError("Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    removeToken();
  }

  return (
    <div className="max-w-4xl mx-auto">
      {!token ? (
        <div className="bg-white p-8 rounded-lg shadow-lg w-96">
          <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
            Login
          </h2>
          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <input
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              className={`w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition-colors duration-200 font-semibold ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? "Logging in..." : "Log in"}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-md mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Welcome! You are logged in
            </h2>
            <button
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors duration-200"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
          <StudentForm />
        </div>
      )}
    </div>
  );
}

export default App;
