// Student ziet enkel eigen stage,de logboeken en evaluatie

function studentDashboard({ data }) {
    return (
        <div className="container mt-4">
            <h2 className="mb-4">Mijn Stage</h2>

            <div className="card mb-4">
                <div className="card-header bg-primary text-white">
                    Mijn Stagevoorstel
                </div>
                <div className="card-body">
                    {data.stages.length === 0 ? (
                        <p>Nog geen stage ingediend.</p>
                    ) : (
                        data.stages.map(stage => (
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
                    {data.logboeken.length === 0 ? (
                        <p>Nog geen logboeken.</p>
                    ) : (
                        <ul className="list-group">
                            {data.logboeken.map(log => (
                                <li key={log.id} className="list-group-item">
                                    <strong>Week {log.week_nummer}:</strong> {log.taken}
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
                    {data.evaluaties.length === 0 ? (
                        <p>Nog geen evaluatie beschikbaar.</p>
                    ) : (
                        data.evaluaties.map(evaluatie => (
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

export default studentDashboard;