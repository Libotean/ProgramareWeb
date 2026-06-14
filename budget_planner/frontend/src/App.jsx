import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useState, useEffect } from 'react'
import api from './api'
import Register from './pages/Register';
import Login from './pages/Login';

function Home({ user, status, onLogout }) {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Budget Planner</h1>
      <p>Status: <strong>{status}</strong></p>
      {user ? (
        <div>
          <p>Bine ai venit, {user.username}!</p>
          <button 
           onClick={onLogout}
           style={{ backgroundColor: '#ff4d4d', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer' }}
          >
            Logout
          </button>
        </div>
      ) : (
        <div>
          <p>Nu esti logat</p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <p>Ai cont? <Link to="/login">Autentifica-te!</Link></p>
            <p>Nu ai cont? <Link to="/register">Inregisteaza-te!</Link></p>
          </div>
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

  const handleLogout = async () => {
    try {
      await api.post('/api/auth/logout');
      setUser(null);
    } catch(err) {
      console.error('LOGOUT ERROR:', err);
    }
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
        <Route path="/" element={<Home user={user} status={status} onLogout={handleLogout} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
      </Routes>
    </Router>
  );
}

export default App;