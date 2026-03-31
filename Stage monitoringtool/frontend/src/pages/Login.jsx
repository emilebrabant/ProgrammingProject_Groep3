import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [wachtwoord, setWachtwoord] = useState('');
  const [fout, setFout] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFout('');

    try {
      const res = await axios.post(
        'http://localhost:3000/api/auth/login',
        { email, wachtwoord },
        { withCredentials: true }
      );

      // Doorsturen op basis van rol
      const rol = res.data.user.rol;
      if (rol === 'student')    navigate('/student/dashboard');
      if (rol === 'admin')      navigate('/admin/dashboard');
      if (rol === 'docent')     navigate('/docent/dashboard');
      if (rol === 'commissie')  navigate('/commissie/dashboard');
      if (rol === 'mentor')     navigate('/mentor/dashboard');

    } catch (err) {
      setFout(err.response?.data?.error || 'Er ging iets mis');
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: '400px' }}>
      <h2 className="mb-4">Inloggen</h2>

      {fout && (
        <div className="alert alert-danger">{fout}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">E-mailadres</label>
          <input
            type="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Wachtwoord</label>
          <input
            type="password"
            className="form-control"
            value={wachtwoord}
            onChange={(e) => setWachtwoord(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary w-100">
          Inloggen
        </button>
      </form>
    </div>
  );
}