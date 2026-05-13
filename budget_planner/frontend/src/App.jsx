import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react'
import api from './api'
import Register from './pages/Register';
import Login from './pages/Login';

function Home({ user, status }) {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Budget Planner</h1>
      <p>Status: <strong>{status}</strong></p>
      {user ? (
        <h2>Salut, {user.username}!</h2>
      ) : (
        <div>
          <p>Nu esti logat. Ai cont?<a href="/login">Logheaza-te aici!</a></p>
          <p>Nu ai cont? <a href="/register">Inregistreaza-te!</a></p>
        </div>
      )}
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("Se incarca...");

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  useEffect(() => {
    api.get('/')
      .then(res => {
        setUser(res.data.user);
        setStatus("Conectat la Backend!");
      })
      .catch(() => setStatus("Eroare de conexiune"));
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home user={user} status={status} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
      </Routes>
    </Router>
  );
}

export default App;