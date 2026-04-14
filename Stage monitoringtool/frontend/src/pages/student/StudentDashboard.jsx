import { useNavigate } from 'react-router-dom'

function StudentDashboard({ data }) {
  const navigate = useNavigate();
  const stages = data?.stages ?? [];
  const logboeken = data?.logboeken ?? [];
  const evaluaties = data?.evaluaties ?? [];

  const formatDate = (dateValue) => {
    if (!dateValue) return '-';
    return new Date(dateValue).toLocaleDateString('nl-BE');
  };

  const statusClass = (status) => {
    const normalized = status?.toLowerCase();
    if (normalized === 'goedgekeurd') return 'bg-success';
    if (normalized === 'afgekeurd') return 'bg-danger';
    if (normalized === 'aanpassing_vereist' || normalized === 'aanpassing vereist') return 'bg-warning text-dark';
    return 'bg-primary';
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Mijn Stage</h2>

      <div className="card mb-4 shadow-sm">
        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          Mijn Stagevoorstel
          <button className="btn btn-light btn-sm" onClick={() => navigate('/student/stages')}>
            Bekijk details
          </button>
        </div>
        <div className="card-body">
          {stages.length === 0 ? (
            <div className="alert alert-info mb-0">Nog geen stage ingediend.</div>
          ) : (
            <div className="row g-3">
              {stages.map((stage) => (
                <div key={stage.id} className="col-12 col-lg-6">
                  <div className="border rounded-3 p-3 h-100 bg-light">
                    <div className="d-flex justify-content-between align-items-start gap-3 mb-2">
                      <div>
                        <div className="text-uppercase text-muted small">Stagevoorstel</div>
                        <h5 className="mb-0">{stage.bedrijf_naam}</h5>
                      </div>
                      <span className={`badge ${statusClass(stage.status)}`}>{stage.status}</span>
                    </div>

                    <div className="d-grid gap-1 small">
                      <div><strong>Periode:</strong> {formatDate(stage.start_datum)} - {formatDate(stage.eind_datum)}</div>
                      {stage.laatste_feedback && (
                        <div className="mt-2 p-2 bg-white border rounded">
                          <div className="fw-semibold text-muted mb-1">Laatste commissiefeedback</div>
                          <div style={{ whiteSpace: 'pre-wrap' }}>{stage.laatste_feedback}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header bg-secondary text-white">
          Mijn Logboeken
        </div>
        <div className="card-body">
          {logboeken.length === 0 ? (
            <p>Nog geen logboeken.</p>
          ) : (
            <ul className="list-group">
              {logboeken.map((log) => (
                <li key={log.id} className="list-group-item">
                  <strong>Week {log.weeknummer}:</strong> {log.taken}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header bg-success text-white">
          Mijn Evaluatie
        </div>
        <div className="card-body">
          {evaluaties.length === 0 ? (
            <p>Nog geen evaluatie beschikbaar.</p>
          ) : (
            evaluaties.map((evaluatie) => (
              <div key={evaluatie.id}>
                <p><strong>Score:</strong> {evaluatie.score}</p>
                <p><strong>Feedback:</strong> {evaluatie.feedback}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;