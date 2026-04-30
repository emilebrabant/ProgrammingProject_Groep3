import { Link } from 'react-router-dom';

function AdminShell({ user, onLogout, title, subtitle, activeTab, children }) {
  const tabClass = (tabName) => `btn ${activeTab === tabName ? 'btn-dark' : 'btn-outline-dark'}`;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)' }}>
      <div className="container py-5">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div>
            <p className="text-uppercase text-secondary mb-1 small">Admin dashboard</p>
            <h1 className="mb-1">{title}</h1>
            <p className="text-secondary mb-0">{subtitle}</p>
          </div>
          <div className="d-flex align-items-center gap-3">
            <div className="text-end">
              <div className="fw-semibold">{user?.naam || 'Admin'}</div>
              <div className="text-secondary small">{user?.email}</div>
            </div>
            <button type="button" className="btn btn-outline-secondary" onClick={() => window.location.reload()}>
              Refresh
            </button>
            <button type="button" className="btn btn-outline-dark" onClick={onLogout}>
              Uitloggen
            </button>
          </div>
        </div>

        <div className="d-flex flex-wrap gap-2 mb-4">
          <Link className={tabClass('users')} to="/admin/users">
            Gebruikersbeheer
          </Link>
          <Link className={tabClass('create')} to="/admin/users/new">
            Gebruiker toevoegen
          </Link>
          <Link className={activeTab === 'stages' ? 'btn btn-primary' : 'btn btn-outline-primary'} to="/admin/stages">
            Stagehistoriek
          </Link>

          <Link className={tabClass('competenties')} to="/admin/competenties">
            Competenties
          </Link>
        </div>

        {children}
      </div>
    </div>
  );
}

export default AdminShell;