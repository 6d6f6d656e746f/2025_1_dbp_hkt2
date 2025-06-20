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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Get current date for default filter values
  const today = new Date();
  // Filter states
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [showFilterOptions, setShowFilterOptions] = useState(false);
  
  // Month options for the dropdown
  const monthOptions = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" }
  ];
  
  // Year options (last 3 years and next year)
  const currentYear = today.getFullYear();
  const yearOptions = [];
  for (let year = currentYear - 2; year <= currentYear + 1; year++) {
    yearOptions.push({ value: year, label: year.toString() });
  }

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
      
      // Use the selected year and month for the API call
      const response = await axios.get(
        `${API_URL}/expenses/detail?year=${selectedYear}&month=${selectedMonth}&categoryId=${categoryId}`, 
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

  useEffect(() => {
    fetchExpenseDetails();
  }, [categoryId, selectedYear, selectedMonth]); // Re-fetch when filters change

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(newExpenseAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid positive number");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('token') || 
                    localStorage.getItem('authToken') || 
                    localStorage.getItem('accessToken') ||
                    localStorage.getItem('jwt');
      
      if (!token) {
        setError("Authentication token not found. Please log in again.");
        setIsSubmitting(false);
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`
      };

      // Create expense DTO
      const expenseData = {
        amount: amount,
        category: {
          id: categoryId
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
        
        // Refresh expense list
        fetchExpenseDetails();
      } else {
        setError("Failed to add expense. Please try again.");
      }
    } catch (error: any) {
      console.error("Error adding expense:", error);
      setError(`Failed to add expense: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteExpense = async () => {
    if (!selectedExpense) {
      alert("Please select an expense to delete");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token') || 
                    localStorage.getItem('authToken') || 
                    localStorage.getItem('accessToken') ||
                    localStorage.getItem('jwt');
      
      if (!token) {
        setError("Authentication token not found. Please log in again.");
        setIsSubmitting(false);
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`
      };

      // Make the DELETE API call
      const response = await axios.delete(
        `${API_URL}/expenses/${selectedExpense.id}`,
        { headers }
      );

      if (response.status === 200 || response.status === 204) {
        alert("Expense deleted successfully!");
        setSelectedExpense(null);
        
        // Refresh expense list
        fetchExpenseDetails();
      } else {
        setError("Failed to delete expense. Please try again.");
      }
    } catch (error: any) {
      console.error("Error deleting expense:", error);
      setError(`Failed to delete expense: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApplyFilters = () => {
    setShowFilterOptions(false);
    fetchExpenseDetails();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <div>
          <button 
            className="bg-gray-300 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-400 transition-colors duration-200 mr-2"
            onClick={onBackClick}
            disabled={isSubmitting}
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
            disabled={!selectedExpense || isSubmitting}
          >
            {isSubmitting ? 'Processing...' : 'Delete'}
          </button>
          <button
            className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 transition-colors duration-200 disabled:bg-gray-400"
            onClick={() => setShowAddForm(!showAddForm)}
            disabled={isSubmitting}
          >
            Add
          </button>
          <button
            className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition-colors duration-200"
            onClick={() => setShowFilterOptions(!showFilterOptions)}
          >
            Filter
          </button>
        </div>
      </div>

      {showFilterOptions && (
        <div className="mb-4 p-4 border border-gray-200 rounded-md bg-gray-50">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex flex-col">
              <label htmlFor="yearFilter" className="text-sm text-gray-600 mb-1">Year</label>
              <select
                id="yearFilter"
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
              >
                {yearOptions.map(year => (
                  <option key={year.value} value={year.value} className="text-gray-800">
                    {year.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex flex-col">
              <label htmlFor="monthFilter" className="text-sm text-gray-600 mb-1">Month</label>
              <select
                id="monthFilter"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
                className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
              >
                {monthOptions.map(month => (
                  <option key={month.value} value={month.value} className="text-gray-800">
                    {month.label}
                  </option>
                ))}
              </select>
            </div>
            
            <button
              onClick={handleApplyFilters}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors duration-200"
            >
              Apply
            </button>
          </div>
        </div>
      )}

      {showAddForm && (
        <div className="mb-4 p-4 border border-gray-200 rounded-md bg-gray-50">
          <form onSubmit={handleAddExpense} className="space-y-3">
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
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save'}
              </button>
              <button
                type="button"
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors duration-200"
                onClick={() => setShowAddForm(false)}
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="mb-4 flex items-center justify-between">
        <div className="text-gray-600">
          <span className="font-medium">Current filter:</span> {monthOptions.find(m => m.value === selectedMonth)?.label} {selectedYear}
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
          
          {expenses.length === 0 && !isLoading && (
            <div className="text-center py-4 text-gray-500">
              No expenses found for this category in {monthOptions.find(m => m.value === selectedMonth)?.label} {selectedYear}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CategoryDetails;
