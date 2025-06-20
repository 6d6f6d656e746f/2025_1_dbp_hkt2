import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CategoryDetails from './CategoryDetails';
import ExpensesSummary from './ExpensesSummary';

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
  const [viewingCategoryDetails, setViewingCategoryDetails] = useState(false);
  const [viewingAllExpenses, setViewingAllExpenses] = useState(false);

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

  const handleAllExpensesClick = () => {
    console.log("All expenses button clicked");
    setViewingAllExpenses(true);
  };

  const handleCategoryClick = (category: Category) => {
    setSelectedCategory(category);
    setViewingCategoryDetails(true);
  };

  const handleBackToDashboard = () => {
    setViewingCategoryDetails(false);
    setViewingAllExpenses(false);
  };

  return (
    <div className="space-y-6">
      {viewingAllExpenses ? (
        <ExpensesSummary onBackClick={handleBackToDashboard} />
      ) : viewingCategoryDetails && selectedCategory ? (
        <CategoryDetails 
          categoryId={selectedCategory.id}
          categoryName={selectedCategory.name}
          onBackClick={handleBackToDashboard}
        />
      ) : (
        <>
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
            </div>
            
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
              <>
                <div className="mb-4">
                  <button
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors duration-200 w-full"
                    onClick={handleAllExpensesClick}
                  >
                    Todos los gastos
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {categories.map((category) => (
                    <div 
                      key={category.id} 
                      className={`p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors cursor-pointer ${
                        selectedCategory?.id === category.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                      }`}
                      onClick={() => handleCategoryClick(category)}
                    >
                      <p className="font-medium text-indigo-900">{category.name}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;