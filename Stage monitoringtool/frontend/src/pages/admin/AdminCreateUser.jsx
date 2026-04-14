import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import AdminShell from './AdminShell';

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
    <AdminShell
      user={user}
      onLogout={handleLogout}
      title="Gebruiker toevoegen"
      subtitle="Maak een nieuw account aan op basis van de databasevelden."
      activeTab="create"
    >
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
    </AdminShell>
  );
}