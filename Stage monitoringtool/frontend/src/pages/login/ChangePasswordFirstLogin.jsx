// ChangePasswordFirstLogin.jsx
// - Doel: Verwerkt eerste-login flow waarbij gebruiker verplicht wachtwoord moet wijzigen
// - Belangrijk: na succesvolle wijziging doorsturen naar rol-dashboard
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { getDashboardRedirect } from '../dashboardRedirect';

export default function ChangePasswordFirstLogin() {
  // formulierstate
  const [huidigWachtwoord, setHuidigWachtwoord] = useState('');
  const [nieuwWachtwoord, setNieuwWachtwoord] = useState('');
  const [bevestigNieuwWachtwoord, setBevestigNieuwWachtwoord] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, setUser, logout } = useAuth();

  // helper: redirect naar dashboard op basis van rol
  const goToRoleDashboard = (rol) => {
    navigate(getDashboardRedirect(rol), { replace: true });
  };

  // Handler: verzenden van wachtwoord-wijzigingsverzoek naar API
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/change-password-first-login', {
        huidigWachtwoord,
        nieuwWachtwoord,
        bevestigNieuwWachtwoord
      });

      // zet nieuwe user in context en navigeer naar rol-dashboard
      setUser(response.data.user);
      goToRoleDashboard(response.data.user.rol);
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Wachtwoord wijzigen is mislukt');
    } finally {
      setLoading(false);
    }
  };

  // Render: formulier met basisvalidatie (min length) en logout-knop
  return (
    <div className="container mt-5" style={{ maxWidth: '520px' }}>
      <div className="card shadow-sm border-0">
        <div className="card-body p-4">
          <h2 className="mb-2">Nieuw wachtwoord verplicht</h2>
          <p className="text-secondary mb-4">
            {user?.naam ? `${user.naam},` : 'Je'} eerste login vereist dat je je wachtwoord wijzigt voordat je verder kunt.
          </p>

          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit} className="d-grid gap-3">
            <div>
              <label className="form-label">Huidig wachtwoord</label>
              <input
                type="password"
                className="form-control"
                value={huidigWachtwoord}
                onChange={(event) => setHuidigWachtwoord(event.target.value)}
                required
              />
            </div>

            <div>
              <label className="form-label">Nieuw wachtwoord</label>
              <input
                type="password"
                className="form-control"
                value={nieuwWachtwoord}
                onChange={(event) => setNieuwWachtwoord(event.target.value)}
                minLength={10}
                required
              />
              <div className="form-text">Gebruik minstens 10 tekens.</div>
            </div>

            <div>
              <label className="form-label">Bevestig nieuw wachtwoord</label>
              <input
                type="password"
                className="form-control"
                value={bevestigNieuwWachtwoord}
                onChange={(event) => setBevestigNieuwWachtwoord(event.target.value)}
                minLength={10}
                required
              />
            </div>

            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? 'Opslaan...' : 'Wachtwoord wijzigen'}
            </button>

            <button className="btn btn-outline-secondary" type="button" onClick={logout}>
              Uitloggen
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}