import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStudentOverzicht } from '../../api/student.js';
import { useAuth } from '../../context/AuthContext';
import StudentShell from './StudentShell';

export default function StudentLogboeken() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [logboeken, setLogboeken] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getStudentOverzicht()
      .then((data) => setLogboeken(data.logboeken || []))
      .catch(() => setError('Kon logboeken niet laden'))
      .finally(() => setLoading(false));
  }, []);

  const gesorteerd = useMemo(() => {
    return [...logboeken].sort((a, b) => (b.weeknummer || 0) - (a.weeknummer || 0));
  }, [logboeken]);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <StudentShell
      user={user}
      onLogout={handleLogout}
      title="Mijn logboeken"
      subtitle="Volg je wekelijkse activiteiten en reflecties."
      activeTab="logboeken"
    >
      <div className="card mb-4">
        <div className="card-header bg-danger text-white">Logboekoverzicht</div>
        <div className="card-body">
          {loading && <div>Laden...</div>}
          {!loading && error && <div className="alert alert-danger mb-0">{error}</div>}
          {!loading && !error && gesorteerd.length === 0 && (
            <div className="alert alert-info mb-0">Nog geen logboeken beschikbaar.</div>
          )}

          {!loading && !error && gesorteerd.length > 0 && (
            <ul className="list-group">
              {gesorteerd.map((logboek) => (
                <li key={logboek.id} className="list-group-item">
                  <div className="fw-semibold mb-1">Week {logboek.weeknummer || '-'}</div>
                  <div style={{ whiteSpace: 'pre-wrap' }}>{logboek.taken || '-'}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </StudentShell>
  );
}
