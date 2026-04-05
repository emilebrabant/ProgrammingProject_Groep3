function DocentDashboard({ data }) {
  return (
    <div className="container mt-4">
      <h2 className="mb-4">Mijn Studenten</h2>

      <div className="card">
        <div className="card-header bg-info text-white">
          Gekoppelde Studenten
        </div>
        <div className="card-body">
          {data.studenten.length === 0 ? (
            <p>Geen studenten gekoppeld.</p>
          ) : (
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Naam</th>
                  <th>Email</th>
                  <th>Bedrijf</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.studenten.map((student) => (
                  <tr key={student.id}>
                    <td>{student.naam}</td>
                    <td>{student.email}</td>
                    <td>{student.bedrijf_naam}</td>
                    <td>
                      <span className="badge bg-info text-dark">
                        {student.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default DocentDashboard;