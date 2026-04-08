import { useNavigate } from 'react-router-dom'

function StudentDashboard({ data }) {
  const navigate = useNavigate();
  const stages = data?.stages ?? [];
  const logboeken = data?.logboeken ?? [];
  const evaluaties = data?.evaluaties ?? [];

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Mijn Stage</h2>

      <div className="card mb-4">
        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center" >
          Mijn Stagevoorstel
          <button className="btn btn-light btn-sm" onClick={() => navigate('/student/stages')}>
            Bekijk details
          </button>
        </div>
        <div className="card-body">
          {stages.length === 0 ? (
            <p>Nog geen stage ingediend.</p>
          ) : (
            stages.map((stage) => (
              <div key={stage.id}>
                <p><strong>Bedrijf:</strong> {stage.bedrijf_naam}</p>
                <p><strong>Status:</strong> {stage.status}</p>
                <p><strong>Periode:</strong> {stage.start_datum} - {stage.eind_datum}</p>
              </div>
            ))
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