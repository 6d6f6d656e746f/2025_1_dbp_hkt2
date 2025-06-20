import { useState } from "react";
import axios from "axios";
import useToken from "../contexts/TokenContext";
import RegistrationForm from "./RegistrationForm";

const API_URL = "http://198.211.105.95:8080";

function LoginForm() {
  const { saveToken } = useToken();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    passwd: ""
  });

  // If we should show registration form, render it instead
  if (showRegistrationForm) {
    return <RegistrationForm />;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const validateForm = () => {
    if (!formData.email || !formData.passwd) {
      setMessage("Please fill all required fields");
      return false;
    }
    return true;
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setMessage(null);
    
    try {
      const response = await axios.post(`${API_URL}/authentication/login`, formData);
      
      // Log the complete response to the terminal
      console.log("Login Response:", response);
      console.log("Response Data:", response.data);
      console.log("Response Status:", response.status);
      
      // Handle the correct response structure
      if (response.data.status === 200 && response.data.result && response.data.result.token) {
        saveToken(response.data.result.token);
        setMessage("Login successful!");
        console.log("Logged in as:", response.data.result.username);
        console.log("Authentication token:", response.data.result.token);
      } else {
        setMessage("Unexpected response format from server");
        console.log("Unexpected response structure:", response.data);
      }
    } catch (error: any) {
      console.error("Login error:", error);
      console.error("Error response data:", error.response?.data);
      console.error("Error status:", error.response?.status);
      setMessage(
        error.response?.data?.message || 
        "Login failed. Please check your credentials."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Login to Ahorrista</h2>
      
      {message && (
        <div className={`p-4 mb-4 rounded-md ${message.includes('successful') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            name="passwd"
            value={formData.passwd}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full bg-green-600 text-white py-3 rounded-md hover:bg-green-700 transition-colors duration-200 font-semibold ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isSubmitting ? 'Logging in...' : 'Login'}
        </button>
      </form>
      
      {/* Add registration toggle link */}
      <div className="mt-4 text-center text-gray-600">
        <p>
          Don't have an account?{" "}
          <button
            onClick={() => setShowRegistrationForm(true)}
            className="text-blue-600 hover:underline"
          >
            Register here
          </button>
        </p>
      </div>
    </div>
  );
}

export default LoginForm;
