import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStudentOverzicht } from '../../api/student.js';
import { useAuth } from '../../context/AuthContext';
import StudentShell from './StudentShell';

export default function StudentEvaluaties() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [evaluaties, setEvaluaties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getStudentOverzicht()
      .then((data) => setEvaluaties(data.evaluaties || []))
      .catch(() => setError('Kon evaluaties niet laden'))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <StudentShell
      user={user}
      onLogout={handleLogout}
      title="Mijn evaluaties"
      subtitle="Bekijk scores en feedback van je stage-evaluaties."
      activeTab="evaluaties"
    >
      <div className="card mb-4">
        <div className="card-header bg-danger text-white">Evaluatieoverzicht</div>
        <div className="card-body">
          {loading && <div>Laden...</div>}
          {!loading && error && <div className="alert alert-danger mb-0">{error}</div>}
          {!loading && !error && evaluaties.length === 0 && (
            <div className="alert alert-info mb-0">Nog geen evaluaties beschikbaar.</div>
          )}

          {!loading && !error && evaluaties.length > 0 && (
            <div className="row g-3">
              {evaluaties.map((evaluatie) => (
                <div key={evaluatie.id} className="col-12 col-lg-6">
                  <div className="border rounded-3 p-3 h-100 bg-light">
                    <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                      <h5 className="mb-0">Evaluatie #{evaluatie.id}</h5>
                      <span className="badge bg-danger">Score: {evaluatie.score ?? '-'}</span>
                    </div>
                    <div style={{ whiteSpace: 'pre-wrap' }}>{evaluatie.feedback || 'Geen feedback beschikbaar.'}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </StudentShell>
  );
}
