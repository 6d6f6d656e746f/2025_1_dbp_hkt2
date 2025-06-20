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
  const [selectedSummary, setSelectedSummary] = useState<ExpenseSummary | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newExpenseAmount, setNewExpenseAmount] = useState('');
  const [newCategoryId, setNewCategoryId] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [categories, setCategories] = useState<{id: number, name: string}[]>([]);
  
  // Month names for display
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

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
        { headers, timeout: 10000 }
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

  // Fetch categories for add form
  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token') || 
                    localStorage.getItem('authToken') || 
                    localStorage.getItem('accessToken') ||
                    localStorage.getItem('jwt');
      
      if (!token) {
        console.error("Authentication token not found");
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`
      };
      
      const response = await axios.get(
        `${API_URL}/expenses_category`, 
        { headers }
      );
      
      if (response.status === 200) {
        setCategories(response.data);
        // Set default category if available
        if (response.data.length > 0) {
          setNewCategoryId(response.data[0].id.toString());
        }
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    fetchExpensesSummary();
    fetchCategories();
  }, []);

  const handleDeleteExpense = async () => {
    if (!selectedSummary) {
      alert("Please select an expense summary to delete");
      return;
    }

    setIsDeleting(true);

    try {
      const token = localStorage.getItem('token') || 
                    localStorage.getItem('authToken') || 
                    localStorage.getItem('accessToken') ||
                    localStorage.getItem('jwt');
      
      if (!token) {
        setError("Authentication token not found. Please log in again.");
        setIsDeleting(false);
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`
      };

      // Make the delete API call
      const response = await axios.delete(
        `${API_URL}/expenses/${selectedSummary.id}`, 
        { headers }
      );

      if (response.status === 200 || response.status === 204) {
        alert("Expense deleted successfully!");
        setSelectedSummary(null);
        
        // Refresh expense summary list
        fetchExpensesSummary();
      } else {
        setError("Failed to delete expense summary");
      }
    } catch (error: any) {
      console.error("Error deleting expense summary:", error);
      setError(`Failed to delete expense summary: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(newExpenseAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid positive number");
      return;
    }

    if (!newCategoryId) {
      alert("Please select a category");
      return;
    }

    setIsDeleting(true); // Reusing state for add operation

    try {
      const token = localStorage.getItem('token') || 
                    localStorage.getItem('authToken') || 
                    localStorage.getItem('accessToken') ||
                    localStorage.getItem('jwt');
      
      if (!token) {
        setError("Authentication token not found. Please log in again.");
        setIsDeleting(false);
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`
      };

      // Create expense DTO
      const expenseData = {
        amount: amount,
        category: {
          id: parseInt(newCategoryId, 10)
        },
        date: expenseDate
      };

      // Make the API call
      const response = await axios.post(
        `${API_URL}/expenses`,
        expenseData,
        { headers }
      );

      if (response.status === 200 || response.status === 201) {
        alert("Expense added successfully!");
        // Reset form
        setNewExpenseAmount('');
        setExpenseDate(new Date().toISOString().split('T')[0]);
        setShowAddForm(false);
        
        // Refresh expense summary list
        fetchExpensesSummary();
      } else {
        setError("Failed to add expense. Please try again.");
      }
    } catch (error: any) {
      console.error("Error adding expense:", error);
      setError(`Failed to add expense: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <div>
          <button 
            className="bg-gray-300 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-400 transition-colors duration-200 mr-2"
            onClick={onBackClick}
            disabled={isDeleting}
          >
            Back
          </button>
          <h3 className="text-xl font-bold text-gray-800 inline-block ml-2">
            Todos los gastos
          </h3>
        </div>
        <div className="space-x-2">
          <button
            className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition-colors duration-200 disabled:bg-gray-400"
            onClick={handleDeleteExpense}
            disabled={!selectedSummary || isDeleting}
          >
            {isDeleting ? 'Processing...' : 'Delete'}
          </button>
          <button
            className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 transition-colors duration-200 disabled:bg-gray-400"
            onClick={() => setShowAddForm(!showAddForm)}
            disabled={isDeleting}
          >
            Add
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="mb-4 p-4 border border-gray-200 rounded-md bg-gray-50">
          <form onSubmit={handleAddExpense} className="space-y-3">
            <div className="flex flex-col">
              <label htmlFor="category" className="text-sm text-gray-600 mb-1">Category</label>
              <select
                id="category"
                value={newCategoryId}
                onChange={(e) => setNewCategoryId(e.target.value)}
                className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                required
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id} className="text-gray-800">
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex flex-col">
              <label htmlFor="amount" className="text-sm text-gray-600 mb-1">Amount</label>
              <input
                id="amount"
                type="number"
                value={newExpenseAmount}
                onChange={(e) => setNewExpenseAmount(e.target.value)}
                placeholder="Amount"
                step="0.01"
                className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                required
              />
            </div>
            
            <div className="flex flex-col">
              <label htmlFor="date" className="text-sm text-gray-600 mb-1">Date</label>
              <input
                id="date"
                type="date"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                required
              />
            </div>
            
            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors duration-200 disabled:bg-gray-400"
                disabled={isDeleting}
              >
                {isDeleting ? 'Saving...' : 'Save'}
              </button>
              <button
                type="button"
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors duration-200"
                onClick={() => setShowAddForm(false)}
                disabled={isDeleting}
              >
                Cancel
              </button>
            </div>
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
      
      {!isLoading && !error && expensesSummary.length > 0 && (
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {expensesSummary.map((expense) => (
                <tr 
                  key={expense.id}
                  onClick={() => setSelectedSummary(expense)}
                  className={`hover:bg-gray-50 cursor-pointer ${selectedSummary?.id === expense.id ? 'bg-blue-50' : ''}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {expense.id}
                  </td>
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
