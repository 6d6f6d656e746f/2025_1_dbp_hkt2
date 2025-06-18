import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = "http://198.211.105.95:8080";

interface Category {
  id: number;
  name: string;
}

interface DashboardProps {
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Try different possible token keys
        let token = localStorage.getItem('token') || 
                    localStorage.getItem('authToken') || 
                    localStorage.getItem('accessToken') ||
                    localStorage.getItem('jwt');
        
        console.log("Auth token found:", token ? "Yes" : "No");
        
        // Configure headers
        const headers: Record<string, string> = {};
        if (token) {
          headers.Authorization = `Bearer ${token}`;
          console.log("Using Authorization header:", headers.Authorization);
        } else {
          console.warn("No authentication token found in localStorage");
        }
        
        console.log("Making request to:", `${API_URL}/expenses_category`);
        
        const response = await axios.get(`${API_URL}/expenses_category`, { 
          headers,
          // Add timeout to prevent hanging requests
          timeout: 10000
        });
        
        console.log("Categories Response:", response);
        console.log("Response Data:", response.data);
        console.log("Response Status:", response.status);
        
        if (response.status === 200) {
          setCategories(response.data);
        } else {
          setError("Failed to fetch categories");
        }
      } catch (error: any) {
        console.error("Error fetching categories:", error);
        console.error("Error details:", {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        });
        
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          if (error.response.status === 401) {
            setError(`Unauthorized: Please login again (Status: ${error.response.status})`);
          } else if (error.response.status === 403) {
            setError(`Forbidden: You don't have permission to access this resource (Status: ${error.response.status})`);
          } else {
            setError(`Server error: ${error.response.status} ${error.response.statusText}`);
          }
        } else if (error.request) {
          // The request was made but no response was received
          setError("No response received from the server. Please check your internet connection.");
        } else {
          // Something happened in setting up the request that triggered an Error
          setError(`Request configuration error: ${error.message}`);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleDeleteCategory = async () => {
    if (!selectedCategory) {
      alert("Please select a category to delete");
      return;
    }

    // Placeholder for delete functionality
    try {
      // Get token for authentication
      const token = localStorage.getItem('token') || 
                    localStorage.getItem('authToken') || 
                    localStorage.getItem('accessToken') ||
                    localStorage.getItem('jwt');
      
      if (!token) {
        setError("Authentication token not found. Please log in again.");
        return;
      }

      // This would be the actual delete API call
      console.log(`Would delete category with ID: ${selectedCategory.id}`);
      alert(`Delete functionality is a placeholder. Would delete: ${selectedCategory.name}`);
      
      // Reset selection after delete
      setSelectedCategory(null);
    } catch (error) {
      console.error("Error deleting category:", error);
      setError("Failed to delete category");
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCategoryName.trim()) {
      alert("Category name cannot be empty");
      return;
    }

    // Placeholder for add functionality
    try {
      // Get token for authentication
      const token = localStorage.getItem('token') || 
                    localStorage.getItem('authToken') || 
                    localStorage.getItem('accessToken') ||
                    localStorage.getItem('jwt');
      
      if (!token) {
        setError("Authentication token not found. Please log in again.");
        return;
      }

      // This would be the actual add API call
      console.log(`Would add category with name: ${newCategoryName}`);
      alert(`Add functionality is a placeholder. Would add: ${newCategoryName}`);
      
      // Reset form
      setNewCategoryName('');
      setShowAddForm(false);
    } catch (error) {
      console.error("Error adding category:", error);
      setError("Failed to add category");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-md mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
        <button
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors duration-200"
          onClick={onLogout}
        >
          Logout
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">Expense Categories</h3>
          <div className="space-x-2">
            <button
              className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition-colors duration-200 disabled:bg-gray-400"
              onClick={handleDeleteCategory}
              disabled={!selectedCategory}
            >
              Delete
            </button>
            <button
              className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 transition-colors duration-200"
              onClick={() => setShowAddForm(!showAddForm)}
            >
              Add
            </button>
          </div>
        </div>

        {showAddForm && (
          <div className="mb-4 p-4 border border-gray-200 rounded-md bg-gray-50">
            <form onSubmit={handleAddCategory} className="flex items-center gap-2">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Category name"
                className="flex-grow p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors duration-200"
              >
                Save
              </button>
              <button
                type="button"
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors duration-200"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </button>
            </form>
          </div>
        )}
        
        {isLoading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}
        
        {error && (
          <div className="p-4 mb-4 rounded-md bg-red-100 text-red-700">
            {error}
          </div>
        )}
        
        {!isLoading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {categories.map((category) => (
              <div 
                key={category.id} 
                className={`p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors cursor-pointer ${
                  selectedCategory?.id === category.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                <p className="font-medium text-indigo-900">{category.name}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;