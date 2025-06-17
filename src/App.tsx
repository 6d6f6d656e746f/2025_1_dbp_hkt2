import { useState } from "react";
import { DashboardProvider } from "./contexts/DashboardContext";
import Dashboard from "./components/Dashboard";
import RegisterForm from "./components/RegisterForm";
import LoginForm from "./components/LoginForm";
import useToken from "./contexts/TokenContext";

function App() {
  const { token, removeToken } = useToken();
  const [showRegister, setShowRegister] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  function handleLogout() {
    removeToken();
  }

  function handleRegistrationSuccess() {
    setShowRegister(false);
    setRegistrationSuccess(true);
  }

  return (
    <DashboardProvider>
      <div className="max-w-4xl mx-auto">
        {!token ? (
          showRegister ? (
            <RegisterForm
              onSuccess={handleRegistrationSuccess}
              switchToLogin={() => setShowRegister(false)}
            />
          ) : (
            <LoginForm
              switchToRegister={() => {
                setShowRegister(true);
                setRegistrationSuccess(false);
              }}
              registrationSuccess={registrationSuccess}
            />
          )
        ) : (
          <Dashboard onLogout={handleLogout} />
        )}
      </div>
    </DashboardProvider>
  );
}

export default App;
