import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

function Login({ onLoginSuccess }) {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/api/auth/login', formData);
      onLoginSuccess(res.data.user);
      navigate('/'); 
    } catch (err) {
      setError(err.response?.data?.error || 'Eroare la autentificare');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', textAlign: 'center' }}>
      <h2>Autentificare</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input type="email" placeholder="Email" required
          onChange={(e) => setFormData({...formData, email: e.target.value})} />
        <input type="password" placeholder="Parola" required
          onChange={(e) => setFormData({...formData, password: e.target.value})} />
        <button type="submit" style={{ padding: '10px', cursor: 'pointer' }}>Intra in cont</button>
      </form>
      <p>Nu ai cont? <Link to="/register">Inregistreaza-te aici</Link></p>
    </div>
  );
}

export default Login;