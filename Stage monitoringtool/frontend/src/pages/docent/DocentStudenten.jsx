import { useEffect, useState } from 'react';
import DocentShell from './DocentShell';

export default function DocentStudenten() {
  const [studenten, setStudenten] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('http://localhost:3000/dashboard/docent', { credentials: 'include' })
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
    <DocentShell
      title="Studenten"
      subtitle="Overzicht van studenten die aan jou gekoppeld zijn."
      activeTab="studenten"
    >
      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <p>Laden...</p>
      ) : studenten.length === 0 ? (
        <div className="alert alert-info">Geen studenten gekoppeld.</div>
      ) : (
        <div className="card">
          <div className="card-header bg-info text-white">Gekoppelde studenten</div>
          <div className="card-body">
            <table className="table table-striped mb-0">
              <thead>
                <tr>
                  <th>Naam</th>
                  <th>Email</th>
                  <th>Bedrijf</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {studenten.map((student) => (
                  <tr key={student.id}>
                    <td>{student.naam}</td>
                    <td>{student.email}</td>
                    <td>{student.bedrijf_naam}</td>
                    <td>
                      <span className="badge bg-info text-dark">{student.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DocentShell>
  );
}