import { useNavigate } from 'react-router-dom';
import AdminShell from './AdminShell';

function AdminDashboard({ data }) {
  const navigate = useNavigate();

  return (
    <AdminShell
      title="Admin Dashboard"
      subtitle="Overzicht van gebruikers, competenties en stagevoorstellen."
      activeTab="dashboard"
    >
      <div className="card mb-4">
        <div className="card-header bg-danger text-white">
          Gebruikersbeheer
        </div>
        <div className="card-body">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Naam</th>
                <th>Email</th>
                <th>Rol</th>
              </tr>
            </thead>
            <tbody>
              {data.gebruikers.map((gebruiker) => (
                <tr key={gebruiker.id}>
                  <td>{gebruiker.naam}</td>
                  <td>{gebruiker.email}</td>
                  <td>
                    <span className="badge bg-danger">
                      {gebruiker.rol}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header bg-dark text-white">
          Competentiebeheer
        </div>
        <div className="card-body">
          {data.competenties.length === 0 ? (
            <p>Geen competenties aangemaakt.</p>
          ) : (
            <ul className="list-group">
              {data.competenties.map((competentie) => (
                <li
                  key={competentie.id}
                  className="list-group-item d-flex justify-content-between"
                >
                  <span>{competentie.naam}</span>
                  <span className="badge bg-dark">
                    Gewicht: {competentie.gewicht}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center gap-2">
          <span>Alle Stages</span>
          <button
            type="button"
            className="btn btn-light btn-sm"
            onClick={() => navigate('/commissie/stages')}
          >
            Open stagehistoriek
          </button>
        </div>
        <div className="card-body">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Bedrijf</th>
                <th>Status</th>
                <th>Periode</th>
              </tr>
            </thead>
            <tbody>
              {data.stages.map((stage) => (
                <tr
                  key={stage.id}
                  role="button"
                  tabIndex={0}
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/commissie/stages/${stage.id}`)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      navigate(`/commissie/stages/${stage.id}`);
                    }
                  }}
                >
                  <td>{stage.bedrijf_naam}</td>
                  <td>
                    <span className="badge bg-primary">
                      {stage.status}
                    </span>
                  </td>
                  <td>{stage.start_datum} - {stage.eind_datum}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}

export default AdminDashboard;