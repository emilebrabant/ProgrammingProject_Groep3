import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAlleStages } from '../../api/stages';
import { useAuth } from '../../context/AuthContext';
import AdminShell from './AdminShell';

function StatusBadge({ status }) {
  const kleuren = {
    ingediend: 'bg-primary',
    goedgekeurd: 'bg-success',
    afgekeurd: 'bg-danger',
    'aanpassing vereist': 'bg-warning text-dark',
    aanpassing_vereist: 'bg-warning text-dark'
  };
  const kleur = kleuren[status?.toLowerCase()] || 'bg-secondary';
  return <span className={`badge ${kleur}`}>{status}</span>;
}

function OvereenkomstStatusBadge({ status }) {
  const normalized = status?.toLowerCase();
  if (normalized === 'gevalideerd') return <span className="badge bg-success">Gevalideerd</span>;
  if (normalized === 'afgekeurd') return <span className="badge bg-danger">Afgekeurd</span>;
  if (normalized === 'geupload') return <span className="badge bg-warning text-dark">Geüpload, wachtend op validatie</span>;
  return <span className="text-muted">Niet geupload</span>;
}

const statussen = [
  { value: '', label: 'Alle' },
  { value: 'ingediend', label: 'ingediend' },
  { value: 'goedgekeurd', label: 'goedgekeurd' },
  { value: 'afgekeurd', label: 'afgekeurd' },
  { value: 'aanpassing_vereist', label: 'aanpassing vereist' }
];

export default function AdminStageHistoriek() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [stages, setStages] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  useEffect(() => {
    setLoading(true);
    setError('');

    getAlleStages(statusFilter)
      .then((data) => setStages(data.stages || []))
      .catch(() => setError('Kon voorstellen niet laden'))
      .finally(() => setLoading(false));
  }, [statusFilter]);

  return (
    <AdminShell
      user={user}
      onLogout={handleLogout}
      title="Stagehistoriek"
      subtitle="Bekijk alle stagevoorstellen en filter op status."
      activeTab="stages"
    >
      <div className="card shadow-sm border-0">
        <div className="card-body p-4">
          <h2 className="h4 mb-3">Overzicht stagevoorstellen</h2>
          <p className="text-muted">Klik op een rij om het voorstel te bekijken.</p>

          <div className="mb-3 d-flex gap-2 flex-wrap">
            {statussen.map((statusItem) => (
              <button
                key={statusItem.value}
                type="button"
                className={`btn btn-sm ${statusFilter === statusItem.value ? 'btn-dark' : 'btn-outline-secondary'}`}
                onClick={() => setStatusFilter(statusItem.value)}
              >
                {statusItem.label}
              </button>
            ))}
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          {loading ? (
            <p className="mb-0">Laden...</p>
          ) : stages.length === 0 ? (
            <div className="alert alert-info mb-0">Geen voorstellen gevonden.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover table-bordered align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Student</th>
                    <th>Bedrijf</th>
                    <th>Ingediend op</th>
                    <th>Status</th>
                    <th>Overeenkomst</th>
                  </tr>
                </thead>
                <tbody>
                  {stages.map((stage) => (
                    <tr
                      key={stage.id}
                      role="button"
                      tabIndex={0}
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/admin/stages/${stage.id}`)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          navigate(`/admin/stages/${stage.id}`);
                        }
                      }}
                    >
                      <td>{stage.student_naam}</td>
                      <td>{stage.bedrijf_naam}</td>
                      <td>{new Date(stage.aangemaakt_op).toLocaleDateString('nl-BE')}</td>
                      <td><StatusBadge status={stage.status} /></td>
                      <td><OvereenkomstStatusBadge status={stage.overeenkomst_status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
