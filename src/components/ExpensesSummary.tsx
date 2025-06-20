import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = "http://198.211.105.95:8080";

interface ExpenseSummary {
  id: number;
  expenseCategory: {
    id: number;
    name: string;
  };
  year: number;
  month: number;
  amount: number;
}

interface ExpensesSummaryProps {
  onBackClick: () => void;
}

const ExpensesSummary: React.FC<ExpensesSummaryProps> = ({ onBackClick }) => {
  const [expensesSummary, setExpensesSummary] = useState<ExpenseSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Month names for display
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  useEffect(() => {
    const fetchExpensesSummary = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const token = localStorage.getItem('token') || 
                      localStorage.getItem('authToken') || 
                      localStorage.getItem('accessToken') ||
                      localStorage.getItem('jwt');
        
        if (!token) {
          setError("Authentication token not found. Please log in again.");
          setIsLoading(false);
          return;
        }

        const headers = {
          Authorization: `Bearer ${token}`
        };
        
        const response = await axios.get(
          `${API_URL}/expenses_summary`, 
          { headers, timeout: 100000 }
        );
        
        if (response.status === 200) {
          setExpensesSummary(response.data);
        } else {
          setError("Failed to fetch expenses summary");
        }
      } catch (error: any) {
        console.error("Error fetching expenses summary:", error);
        
        if (error.response) {
          if (error.response.status === 401) {
            setError(`Unauthorized: Please login again (Status: ${error.response.status})`);
          } else {
            setError(`Server error: ${error.response.status} ${error.response.statusText}`);
          }
        } else if (error.request) {
          setError("No response received from the server. Please check your internet connection.");
        } else {
          setError(`Request configuration error: ${error.message}`);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchExpensesSummary();
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <div>
          <button 
            className="bg-gray-300 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-400 transition-colors duration-200 mr-2"
            onClick={onBackClick}
          >
            Back
          </button>
          <h3 className="text-xl font-bold text-gray-800 inline-block ml-2">
            Todos los gastos
          </h3>
        </div>
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
      
      {!isLoading && !error && expensesSummary.length > 0 && (
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {expensesSummary.map((expense) => (
                <tr key={expense.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {expense.expenseCategory.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {expense.year}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {monthNames[expense.month - 1]}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    S/. {expense.amount.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {!isLoading && !error && expensesSummary.length === 0 && (
        <div className="p-4 text-center text-gray-500">
          No expense summary data available
        </div>
      )}
    </div>
  );
};

export default ExpensesSummary;
