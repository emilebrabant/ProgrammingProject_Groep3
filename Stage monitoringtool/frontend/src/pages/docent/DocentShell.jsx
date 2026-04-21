import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function DocentShell({ title, subtitle, activeTab, children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const tabClass = (tabName) => `btn ${activeTab === tabName ? 'btn-dark' : 'btn-outline-dark'}`;

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #f6fbff 0%, #e8f4ff 100%)' }}>
      <div className="container py-5">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div>
            <p className="text-uppercase text-info mb-1 small">Docent shell</p>
            <h1 className="mb-1">{title}</h1>
            <p className="text-secondary mb-0">{subtitle}</p>
          </div>
          <div className="d-flex align-items-center gap-3">
            <div className="text-end">
              <div className="fw-semibold">{user?.naam || 'Docent'}</div>
              <div className="text-secondary small">{user?.email}</div>
            </div>
            <button type="button" className="btn btn-outline-secondary" onClick={() => window.location.reload()}>
              Refresh
            </button>
            <button type="button" className="btn btn-outline-dark" onClick={handleLogout}>
              Uitloggen
            </button>
          </div>
        </div>

        <div className="d-flex flex-wrap gap-2 mb-4">
          <Link className={tabClass('studenten')} to="/docent/studenten">
            Studenten
          </Link>
          <Link className={tabClass('logboeken')} to="/docent/logboeken">
            Logboeken
          </Link>
        </div>

        {children}
      </div>
    </div>
  );
}

export default DocentShell;