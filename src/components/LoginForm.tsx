import { useState } from "react";
import useToken from "../contexts/TokenContext";
import axiosInstance, { BACKEND_URL } from "../services/axios";

type LoginFormProps = {
  switchToRegister: () => void;
  registrationSuccess: boolean;
};

function LoginForm({ switchToRegister, registrationSuccess }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { saveToken } = useToken();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const response = await axiosInstance.post(`/authentication/login`, {
        email: email,
        passwd: password,
      });

      // Log the response structure to debug
      console.log("Login response:", response.data);
      
      // The token is at response.data.result.token (or fallback to data.data.token for compatibility)
      const token = response.data?.result?.token || response.data?.data?.token;
      if (token) {
        saveToken(token);
        setEmail("");
        setPassword("");
      } else {
        throw new Error("Token not found in response");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      // Try to show backend error message if available
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError("Invalid credentials. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg w-96">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Login
      </h2>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">
          {error}
        </div>
      )}

      {registrationSuccess && (
        <div className="bg-green-100 text-green-700 p-3 rounded-md mb-4">
          Registration successful! You can now login.
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <input
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <input
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className={`w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition-colors duration-200 font-semibold ${
            loading ? "opacity-70 cursor-not-allowed" : ""
          }`}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Log in"}
        </button>
      </form>

      <div className="mt-4 text-center">
        <p className="text-gray-600">
          Don't have an account?{" "}
          <button
            onClick={switchToRegister}
            className="text-blue-600 hover:underline focus:outline-none"
          >
            Register
          </button>
        </p>
      </div>
    </div>
  );
}

export default LoginForm;
