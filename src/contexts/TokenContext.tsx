import { createContext, useContext, useState, type ReactNode } from "react";

type TokenContextType = {
  token: string | null;
  saveToken: (userToken: string) => void;
  removeToken: () => void;
};

const TokenContext = createContext<TokenContextType | undefined>(undefined);

type TokenProviderProps = {
  children: ReactNode;
};

export function TokenProvider({ children }: TokenProviderProps) {
  const getToken = () => {
    return localStorage.getItem("token");
  };

  const [token, setToken] = useState<string | null>(getToken());

  const saveToken = (userToken: string) => {
    localStorage.setItem("token", userToken);
    setToken(userToken);
  };

  const removeToken = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  const value = {
    token,
    saveToken,
    removeToken,
  };

  return (
    <TokenContext.Provider value={value}>{children}</TokenContext.Provider>
  );
}

export const useToken = () => {
  const context = useContext(TokenContext);
  if (context === undefined) {
    throw new Error("useToken must be used within a TokenProvider");
  }
  return context;
};

export default useToken;
