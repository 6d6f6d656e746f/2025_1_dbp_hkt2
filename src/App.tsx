import "./App.css";
import useToken from "./contexts/TokenContext";
import LoginForm from "./components/LoginForm";
import Dashboard from "./components/Dashboard";

function App() {
  const { token, removeToken } = useToken();

  function handleLogout() {
    removeToken();
  }

  return (
    <div className="max-w-4xl mx-auto">
      {!token ? (
        <LoginForm />
      ) : (
        <Dashboard onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
