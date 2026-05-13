import { useState } from 'react';
import { useNavigate, Link} from 'react-router-dom';
import api from '../api';

function Register() {
    const [formData, setFormData] = useState({ username: '', email: '', password: ''});
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try{
            await api.post('api/auth/register', formData);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Eroare la inregistrare');
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', textAlign: 'center' }}>
            <h2>Creeaza un cont nou</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input type="text" placeholder="Nume utilizator" required
                onChange={(e) => setFormData({...formData, username: e.target.value})} />
                <input type="email" placeholder="Email" required
                onChange={(e) => setFormData({...formData, email: e.target.value})} />
                <input type="password" placeholder="Parola" required
                onChange={(e) => setFormData({...formData, password: e.target.value})} />
                <button type="submit" style={{ padding: '10px', cursor: 'pointer' }}>Inregistrare</button>
            </form>
            <p>Ai deja cont? <Link to="/login">Logheaza-te aici</Link></p>
        </div>
    );

}

export default Register;