
// Student ziet zijn eigen stagevoorstel met de status

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMijnStages } from '../../api/stages.js';

// Gekleurde badge per status
function StatusBadge({ status }) {
    const kleuren = {
        'Ingediend': 'bg-primary',
        'Goedgekeurd': 'bg-success',
        'Afgekeurd': 'bg-danger',
        'Aanpassing vereist': 'bg-warning text-dark',
};
    const kleur = kleuren[status] || 'bg-secondary';
    return <span className={`badge ${kleur}`}>{status}</span>;
}

export default function StageOverzicht() {
    const navigate = useNavigate();
    const [stages, setStages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

// Laad eigen stages bij openen v pagina
     useEffect(() => {
            getMijnStages()
                .then((data) => setStages(data.stages))
               .catch(() => setError('Kon stagevoorstellen niet laden'))
               .finally(() => setLoading(false));
    }, []);


// Knop verbergen als student al actief voorstel heeft
    const heeftActiefVoorstel = stages.some((s) => s.status !== 'Afgekeurd');

    if (loading) return <div className="container mt-4">Laden...</div>;

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>Mijn stagevoorstel</h2>
//Knop enkel zichtbaar als student nog geen actief voorstel heeft
                {!heeftActiefVoorstel && (
                    <button
                        className="btn btn-primary"
                        onClick={() => navigate('/student/stages/nieuw')}
                    >
                        + Nieuw voorstel indienen
                    </button>
                )}
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            {stages.length === 0 ? (

                
// Nog geen voorstellen: toon melding met link
                <div className="alert alert-info">
                    Je hebt nog geen stagevoorstel ingediend.{' '}
                    <button className="btn btn-link p-0" onClick={() => navigate('/student/stages/nieuw')}>
                        Klik hier om er één in te dienen.
                    </button>
                </div>
            ) : (
                <table className="table table-bordered">
                    <thead className="table-light">
                        <tr>
                            <th>Bedrijf</th>
                            <th>Docent</th>
                            <th>Startdatum</th>
                            <th>Einddatum</th>
                            <th>Status</th>
                        </tr>
                  </thead>
                    <tbody>
                        {stages.map((stage) => (
                            <tr key={stage.id}>
                                <td>{stage.bedrijf_naam}</td>
                                <td>{stage.docent_naam}</td>
                                <td>{new Date(stage.start_datum).toLocaleDateString('nl-BE')}</td>
                                <td>{new Date(stage.eind_datum).toLocaleDateString('nl-BE')}</td>
                                <td><StatusBadge status={stage.status} /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}