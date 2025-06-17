import React, { useEffect, useState } from "react";
import useDashboard from "../contexts/DashboardContext";
import axiosInstance from "../services/axios";

interface DashboardProps {
  onLogout: () => void;
}

interface ExpenseSummary {
  categoryId: number;
  categoryName: string;
  total: number;
}

interface ExpenseDetail {
  id: number;
  description: string;
  amount: number;
  date: string;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const { categories, loading: loadingCategories, error: errorCategories } = useDashboard();
  const [summary, setSummary] = useState<ExpenseSummary[]>([]);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [errorSummary, setErrorSummary] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [details, setDetails] = useState<ExpenseDetail[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  // Get current year and month
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // JS months are 0-based

  // Fetch summary on mount
  useEffect(() => {
    async function fetchSummary() {
      setLoadingSummary(true);
      setErrorSummary(null);
      try {
        const res = await axiosInstance.get(`/expenses_summary?year=${year}&month=${month}`);
        // Expecting array of { categoryId, categoryName, total }
        setSummary(res.data.data || []);
      } catch (err: any) {
        setErrorSummary(err.response?.data?.message || err.message || "Failed to fetch summary");
      } finally {
        setLoadingSummary(false);
      }
    }
    fetchSummary();
  }, [year, month]);

  // Fetch details when a category is selected
  useEffect(() => {
    if (selectedCategory == null) return;
    async function fetchDetails() {
      setLoadingDetails(true);
      setErrorDetails(null);
      try {
        const res = await axiosInstance.get(
          `/expenses/detail?year=${year}&month=${month}&categoryId=${selectedCategory}`
        );
        setDetails(res.data.data || []);
      } catch (err: any) {
        setErrorDetails(err.response?.data?.message || err.message || "Failed to fetch details");
      } finally {
        setLoadingDetails(false);
      }
    }
    fetchDetails();
  }, [selectedCategory, year, month]);

  // Helper to get category name by id
  const getCategoryName = (id: number) => {
    return categories.find((cat) => cat.id === id)?.name || `Categoría ${id}`;
  };

  return (
    <div className="space-y-6">
      {/* Header with logout button */}
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-md mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Expense Dashboard</h2>
        <button
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors duration-200"
          onClick={onLogout}
        >
          Logout
        </button>
      </div>

      {/* Monthly Summary */}
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Monthly Summary</h2>
        {loadingSummary || loadingCategories ? (
          <div className="text-center py-4">
            <p className="text-gray-600">Loading summary...</p>
          </div>
        ) : errorSummary || errorCategories ? (
          <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">Error: {errorSummary || errorCategories}</div>
        ) : summary.length === 0 ? (
          <p className="text-center text-gray-600">No summary data found.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {summary.map((item) => (
              <div
                key={item.categoryId}
                className={`bg-blue-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer border-2 border-blue-100 hover:border-blue-300 ${selectedCategory === item.categoryId ? "border-blue-500" : ""}`}
                onClick={() => setSelectedCategory(item.categoryId)}
              >
                <h3 className="font-medium text-blue-800">{getCategoryName(item.categoryId)}</h3>
                <div className="mt-2 text-lg font-bold text-gray-700">S/ {item.total.toFixed(2)}</div>
                <div className="mt-2 text-xs text-gray-500">Click to view details</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Details for selected category */}
      {selectedCategory && (
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
            Details for {getCategoryName(selectedCategory)}
          </h2>
          {loadingDetails ? (
            <div className="text-center py-4">
              <p className="text-gray-600">Loading details...</p>
            </div>
          ) : errorDetails ? (
            <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">Error: {errorDetails}</div>
          ) : details.length === 0 ? (
            <p className="text-center text-gray-600">No expenses found for this category.</p>
          ) : (
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr>
                  <th className="py-2 px-4">Description</th>
                  <th className="py-2 px-4">Amount</th>
                  <th className="py-2 px-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {details.map((expense) => (
                  <tr key={expense.id}>
                    <td className="py-2 px-4">{expense.description}</td>
                    <td className="py-2 px-4">S/ {expense.amount?.toFixed ? expense.amount.toFixed(2) : expense.amount}</td>
                    <td className="py-2 px-4">{expense.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <div className="mt-4 text-center">
            <button
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400"
              onClick={() => setSelectedCategory(null)}
            >
              Back to summary
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
