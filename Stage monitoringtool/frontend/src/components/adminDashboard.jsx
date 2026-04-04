// Admin heeft toegang tot alles dus ook gebruikersbeheer en competentiebeheer

function adminDashboard({ data }) {
    return (
        <div className="container mt-4">
            <h2 className="mb-4">Admin Dashboard</h2>

            <div className="card mb-4">
                <div className="card-header bg-danger text-white">
                    Gebruikersbeheer
                </div>
                <div className="card-body">
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th>Naam</th>
                                <th>Email</th>
                                <th>Rol</th>
                            </tr>
                    </thead>
                        <tbody>
                            {data.gebruikers.map(gebruiker => (
                                <tr key={gebruiker.id}>
                                    <td>{gebruiker.naam}</td>
                                    <td>{gebruiker.email}</td>
                                    <td>
                                        <span className="badge bg-danger">
                                            {gebruiker.rol}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
            </div>
            </div>

            <div className="card mb-4">
                <div className="card-header bg-dark text-white">
                    Competentiebeheer
                </div>
                <div className="card-body">
                    {data.competenties.length === 0 ? (
                        <p>Geen competenties aangemaakt.</p>
                    ) : (
                        <ul className="list-group">
                            {data.competenties.map(competentie => (
                                <li key={competentie.id}
                                    className="list-group-item d-flex justify-content-between">
                                     <span>{competentie.naam}</span>
                                   <span className="badge bg-dark">
                                        Gewicht: {competentie.gewicht}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            <div className="card mb-4">
                <div className="card-header bg-primary text-white">
                    Alle Stages
                </div>
                <div className="card-body">
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th>Bedrijf</th>
                                <th>Status</th>
                                <th>Periode</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.stages.map(stage => (
                                <tr key={stage.id}>
                                    <td>{stage.bedrijf_naam}</td>
                                    <td>
                                        <span className="badge bg-primary">
                                            {stage.status}
                                        </span>
                                    </td>
                                    <td>{stage.start_datum} - {stage.eind_datum}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default adminDashboard;