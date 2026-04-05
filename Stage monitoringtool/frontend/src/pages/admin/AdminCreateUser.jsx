import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const initialForm = {
  naam: '',
  email: '',
  wachtwoord: '',
  rol: 'student'
};

export default function AdminCreateUser() {
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    try {
      await api.post('/users', form);
      setForm(initialForm);
      setMessage('Gebruiker succesvol aangemaakt');
      navigate('/admin/users');
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Gebruiker kon niet worden aangemaakt');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)' }}>
      <div className="container py-5">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div>
            <p className="text-uppercase text-secondary mb-1 small">Admin dashboard</p>
            <h1 className="mb-1">Gebruiker toevoegen</h1>
            <p className="text-secondary mb-0">Maak een nieuw account aan op basis van de databasevelden.</p>
          </div>
          <div className="d-flex align-items-center gap-3">
            <div className="text-end">
              <div className="fw-semibold">{user?.naam || 'Admin'}</div>
              <div className="text-secondary small">{user?.email}</div>
            </div>
            <button type="button" className="btn btn-outline-dark" onClick={handleLogout}>
              Uitloggen
            </button>
          </div>
        </div>

        <div className="d-flex flex-wrap gap-2 mb-4">
          <Link className="btn btn-outline-dark" to="/admin/users">
            Gebruikersbeheer
          </Link>
          <Link className="btn btn-dark" to="/admin/users/new">
            Gebruiker toevoegen
          </Link>
        </div>

        <div className="row justify-content-center">
          <div className="col-12 col-lg-6">
            <div className="card shadow-sm border-0">
              <div className="card-body p-4">
                <form onSubmit={handleSubmit} className="d-grid gap-3">
                  <div>
                    <label className="form-label">Naam</label>
                    <input
                      type="text"
                      className="form-control"
                      name="naam"
                      value={form.naam}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">E-mailadres</label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Wachtwoord</label>
                    <input
                      type="password"
                      className="form-control"
                      name="wachtwoord"
                      value={form.wachtwoord}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Rol</label>
                    <select className="form-select" name="rol" value={form.rol} onChange={handleChange}>
                      <option value="student">Student</option>
                      <option value="commissie">Commissie</option>
                      <option value="docent">Docent</option>
                      <option value="mentor">Mentor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  {error && <div className="alert alert-danger mb-0">{error}</div>}
                  {message && <div className="alert alert-success mb-0">{message}</div>}

                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Opslaan...' : 'Gebruiker toevoegen'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}