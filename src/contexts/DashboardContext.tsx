import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import axios from "axios";
import { useToken } from "./TokenContext";

const BACKEND_URL = "http://198.211.105.95:8080";

// Define types for expense categories
type ExpenseCategory = {
  id: number;
  name: string;
  // Add any other fields that come from the API
};

type DashboardContextType = {
  categories: ExpenseCategory[];
  loading: boolean;
  error: string | null;
  refreshCategories: () => Promise<void>;
};

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

type DashboardProviderProps = {
  children: ReactNode;
};

export function DashboardProvider({ children }: DashboardProviderProps) {
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const { token } = useToken();

  const fetchCategories = async () => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${BACKEND_URL}/expenses_category`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setCategories(response.data.data || []);
    } catch (err: any) {
      console.error("Error fetching categories:", err);
      setError(err.message || "Failed to fetch expense categories");
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories when token changes
  useEffect(() => {
    if (token) {
      fetchCategories();
    } else {
      setCategories([]);
    }
  }, [token]);

  const refreshCategories = async () => {
    await fetchCategories();
  };

  const value = {
    categories,
    loading,
    error,
    refreshCategories
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
};

export default useDashboard;
