import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [wachtwoord, setWachtwoord] = useState('');
  const [fout, setFout] = useState('');
  const navigate = useNavigate();
  const { user, loading, setUser } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      if (user.eerste_login) {
        navigate('/change-password-first-login', { replace: true });
        return;
      }
      navigate(`/${user.rol}/dashboard`, { replace: true });
    }
  }, [loading, navigate, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFout('');

    try {
      const res = await api.post(
        '/auth/login',
        { email, wachtwoord },
      );

      setUser(res.data.user);

      // Doorsturen op basis van rol
      if (res.data.user.eerste_login) {
        navigate('/change-password-first-login');
        return;
      }

      const rol = res.data.user.rol;
      if (rol === 'student') navigate('/student/dashboard');
      if (rol === 'admin') navigate('/admin/users');
      if (rol === 'docent') navigate('/docent/dashboard');
      if (rol === 'commissie') navigate('/commissie/dashboard');
      if (rol === 'mentor') navigate('/mentor/dashboard');

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