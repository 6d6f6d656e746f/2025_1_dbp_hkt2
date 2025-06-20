import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = "http://198.211.105.95:8080";

interface ExpenseDetail {
  id: number;
  date: string;
  category: {
    id: number;
    name: string;
  };
  amount: number;
}

interface CategoryDetailsProps {
  categoryId: number;
  categoryName: string;
  onBackClick: () => void;
}

const CategoryDetails: React.FC<CategoryDetailsProps> = ({ 
  categoryId, 
  categoryName, 
  onBackClick 
}) => {
  const [expenses, setExpenses] = useState<ExpenseDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newExpenseAmount, setNewExpenseAmount] = useState('');
  const [selectedExpense, setSelectedExpense] = useState<ExpenseDetail | null>(null);

  // Get current year and month for the query
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1; // JavaScript months are 0-indexed

  useEffect(() => {
    const fetchExpenseDetails = async () => {
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
          `${API_URL}/expenses/detail?year=${year}&month=${month}&categoryId=${categoryId}`, 
          { headers, timeout: 10000 }
        );
        
        if (response.status === 200) {
          setExpenses(response.data);
        } else {
          setError("Failed to fetch expense details");
        }
      } catch (error: any) {
        console.error("Error fetching expense details:", error);
        
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

    fetchExpenseDetails();
  }, [categoryId]);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(newExpenseAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid positive number");
      return;
    }

    try {
      const token = localStorage.getItem('token') || 
                    localStorage.getItem('authToken') || 
                    localStorage.getItem('accessToken') ||
                    localStorage.getItem('jwt');
      
      if (!token) {
        setError("Authentication token not found. Please log in again.");
        return;
      }

      // This would be the actual add API call
      console.log(`Would add expense: ${amount} to category ${categoryName}`);
      alert(`Add expense functionality is a placeholder. Would add: ${amount} to ${categoryName}`);
      
      setNewExpenseAmount('');
      setShowAddForm(false);
    } catch (error) {
      console.error("Error adding expense:", error);
      setError("Failed to add expense");
    }
  };

  const handleDeleteExpense = async () => {
    if (!selectedExpense) {
      alert("Please select an expense to delete");
      return;
    }

    try {
      const token = localStorage.getItem('token') || 
                    localStorage.getItem('authToken') || 
                    localStorage.getItem('accessToken') ||
                    localStorage.getItem('jwt');
      
      if (!token) {
        setError("Authentication token not found. Please log in again.");
        return;
      }

      // This would be the actual delete API call to DELETE /expenses/:id
      console.log(`Would delete expense with ID: ${selectedExpense.id}`);
      alert(`Delete functionality is a placeholder. Would delete expense ID: ${selectedExpense.id}`);
      
      setSelectedExpense(null);
    } catch (error) {
      console.error("Error deleting expense:", error);
      setError("Failed to delete expense");
    }
  };

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
            {categoryName} Details
          </h3>
        </div>
        <div className="space-x-2">
          <button
            className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition-colors duration-200 disabled:bg-gray-400"
            onClick={handleDeleteExpense}
            disabled={!selectedExpense}
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
          <form onSubmit={handleAddExpense} className="flex items-center gap-2">
            <input
              type="number"
              value={newExpenseAmount}
              onChange={(e) => setNewExpenseAmount(e.target.value)}
              placeholder="Amount"
              step="0.01"
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
        <div className="mt-4">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {expenses.map((expense) => (
                <tr 
                  key={expense.id} 
                  onClick={() => setSelectedExpense(expense)}
                  className={`hover:bg-gray-50 cursor-pointer ${selectedExpense?.id === expense.id ? 'bg-blue-50' : ''}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{expense.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{expense.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">S/. {expense.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CategoryDetails;
