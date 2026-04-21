import { useEffect, useState } from 'react';
import MentorShell from './MentorShell';

export default function MentorKoppelingStudenten() {
  const [studenten, setStudenten] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('http://localhost:3000/dashboard/mentor', { credentials: 'include' })
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) {
          throw new Error(body?.fout || 'Kon studenten niet laden');
        }
        return body;
      })
      .then((data) => setStudenten(data.studenten || []))
      .catch((err) => setError(err.message || 'Kon studenten niet laden'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <MentorShell
      title="Koppeling studenten"
      subtitle="Overzicht van studenten die aan je bedrijf gekoppeld zijn."
      activeTab="koppeling-studenten"
    >
      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <p>Laden...</p>
      ) : studenten.length === 0 ? (
        <div className="alert alert-info">Geen studenten gekoppeld aan jouw bedrijf.</div>
      ) : (
        <div className="card">
          <div className="card-header bg-primary text-white">Mijn studenten</div>
          <div className="card-body">
            <table className="table table-striped mb-0">
              <thead>
                <tr>
                  <th>Naam</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Omschrijving</th>
                </tr>
              </thead>
              <tbody>
                {studenten.map((student) => (
                  <tr key={student.id}>
                    <td>{student.naam}</td>
                    <td>{student.email}</td>
                    <td>
                      <span className="badge bg-secondary">{student.status}</span>
                    </td>
                    <td>{student.omschrijving}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </MentorShell>
  );
}