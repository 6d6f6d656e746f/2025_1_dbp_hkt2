import React from "react";
import useDashboard from "../contexts/DashboardContext";

interface DashboardProps {
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const { categories, loading, error } = useDashboard();

  return (
    <div className="space-y-6">
      {/* Header with logout button */}
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-md mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Expense Dashboard
        </h2>
        <button
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors duration-200"
          onClick={onLogout}
        >
          Logout
        </button>
      </div>

      {/* Dashboard content */}
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Expense Categories
        </h2>
        
        {loading && (
          <div className="text-center py-4">
            <p className="text-gray-600">Loading categories...</p>
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">
            Error: {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {categories.length === 0 ? (
              <p className="text-center text-gray-600">No expense categories found.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {categories.map(category => (
                  <div 
                    key={category.id} 
                    className="bg-blue-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer border-2 border-blue-100 hover:border-blue-300"
                  >
                    <h3 className="font-medium text-blue-800">{category.name}</h3>
                    <div className="mt-2 text-xs text-gray-500">Click to view details</div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Additional dashboard sections can be added here */}
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Monthly Summary
        </h2>
        <p className="text-center text-gray-600">
          Monthly expense summary will appear here.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
