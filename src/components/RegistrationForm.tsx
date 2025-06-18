import { useState } from "react";
import axios from "axios";
import LoginForm from "./LoginForm";

const API_URL = "http://198.211.105.95:8080";

function RegistrationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    passwd: ""
  });

  // If we should show the login form, render it instead
  if (showLoginForm) {
    return <LoginForm />;
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
    
    if (formData.passwd.length < 12) {
      setMessage("Password must be at least 12 characters long");
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
      const response = await axios.post(
        `${API_URL}/authentication/register`, 
        formData
      );

      // Log the complete response to the terminal
      console.log("Registration Response:", response);
      console.log("Response Data:", response.data);
      console.log("Response Status:", response.status);
      
      // Check the HTTP status code instead of response.data.status
      if (response.status === 200) {
        setMessage("Registration successful! You can now login.");
        setFormData({
          email: "",
          passwd: ""
        });
        console.log("User registered successfully");
      } else {
        setMessage("Unexpected response format from server");
        console.log("Unexpected response structure:", response.data);
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      console.error("Error response data:", error.response?.data);
      console.error("Error status:", error.response?.status);
      setMessage(
        error.response?.data?.message || 
        "Error during registration. Email might already exist."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Register for Ahorrista</h2>
      
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
            Password (min 12 characters)
          </label>
          <input
            type="password"
            name="passwd"
            value={formData.passwd}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
            required
            minLength={12}
          />
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition-colors duration-200 font-semibold ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isSubmitting ? 'Registering...' : 'Register'}
        </button>
      </form>
      
      {/* Add login toggle link */}
      <div className="mt-4 text-center text-gray-600">
        <p>
          Already have an account?{" "}
          <button
            onClick={() => setShowLoginForm(true)}
            className="text-green-600 hover:underline"
          >
            Login here
          </button>
        </p>
      </div>
    </div>
  );
}

export default RegistrationForm;
