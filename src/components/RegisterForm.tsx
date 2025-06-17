import { useState } from "react";
import axiosInstance from "../services/axios";

type RegisterFormProps = {
  onSuccess: () => void;
  switchToLogin: () => void;
};

function RegisterForm({ onSuccess, switchToLogin }: RegisterFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Password validation state
  const [passwordError, setPasswordError] = useState("");
  
  const validatePassword = (pass: string) => {
    if (pass.length < 12) {
      setPasswordError("Password must be at least 12 characters long");
      return false;
    }
    setPasswordError("");
    return true;
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    validatePassword(newPassword);
  };

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    
    // Validate before submitting
    if (!validatePassword(password)) {
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setError("");
    setLoading(true);
    
    try {
      await axiosInstance.post(`/authentication/register`, {
        email: email,
        passwd: password,
      });
      
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      onSuccess();
    } catch (err: any) {
      console.error("Registration error:", err);
      if (err.response?.status === 400) {
        setError("Email already exists. Please use a different email.");
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg w-96">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Register
      </h2>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleRegister} className="space-y-4">
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
            onChange={handlePasswordChange}
            required
          />
          {passwordError && (
            <p className="text-red-500 text-sm mt-1">{passwordError}</p>
          )}
        </div>
        
        <div>
          <input
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
            placeholder="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        
        <button
          type="submit"
          className={`w-full bg-green-600 text-white py-3 rounded-md hover:bg-green-700 transition-colors duration-200 font-semibold ${
            loading ? "opacity-70 cursor-not-allowed" : ""
          }`}
          disabled={loading}
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
      
      <div className="mt-4 text-center">
        <p className="text-gray-600">
          Already have an account?{" "}
          <button 
            onClick={switchToLogin}
            className="text-blue-600 hover:underline focus:outline-none"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
}

export default RegisterForm;
