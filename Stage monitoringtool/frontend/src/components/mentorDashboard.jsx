// Mentor ziet enkel de student van zijn bedrijf

function mentorDashboard({ data }) {
    return (
        <div className="container mt-4">
            <h2 className="mb-4">Studenten van mijn Bedrijf</h2>

            <div className="card">
                <div className="card-header bg-secondary text-white">
                    Mijn Studenten
                </div>
                <div className="card-body">
                   {data.studenten.length === 0 ? (
                        <p>Geen studenten gekoppeld aan uw bedrijf.</p>
                    ) : (
                        <table className="table table-striped">
                            <thead>
                                <tr>
                                <th>Naam</th>
                                    <th>Email</th>
                                    <th>Status</th>
                                    <th>Omschrijving</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.studenten.map(student => (
                                    <tr key={student.id}>
                                        <td>{student.naam}</td>
                                        <td>{student.email}</td>
                                        <td>
                                            <span className="badge bg-secondary">
                                                {student.status}
                                            </span>
                                        </td>
                                    <td>{student.omschrijving}</td>
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

export default mentorDashboard;