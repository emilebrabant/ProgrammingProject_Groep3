// Commissielid ziet alle ingediende voorstellen + filteren op status

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAlleStages } from '../../api/stages.js';

// Gekleurde badge per status
function StatusBadge({ status }) {
    const kleuren = {
        'ingediend': 'bg-primary',
        'goedgekeurd': 'bg-success',
        'afgekeurd': 'bg-danger',
        'aanpassing vereist': 'bg-warning text-dark',
    };
    const kleur = kleuren[status?.toLowerCase()] || 'bg-secondary';
    return <span className={`badge ${kleur}`}>{status}</span>;
}

// Alle mogelijke statussen voor filterknopppen
const STATUSSEN = ['', 'ingediend', 'goedgekeurd', 'afgekeurd', 'aanpassing vereist'];

export default function CommissieOverzicht() {
    const navigate = useNavigate();
    const [stages, setStages] = useState([]);
    const [statusFilter, setStatusFilter] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

// Haal stages opnieuw op wnr filter verandert
    useEffect(() => {
        setLoading(true);
        getAlleStages(statusFilter)
            .then((data) => setStages(data.stages))
            .catch(() => setError('Kon voorstellen niet laden'))
            .finally(() => setLoading(false));
}, [statusFilter]);

    return (
        <div className="container mt-4">
            <h2>Overzicht stagevoostellen</h2>
            <p className="text-muted">Klik op een rij om het voorstel te bekijken.</p>

            {/* Filterknopppen per status */}
            <div className="mb-3 d-flex gap-2 flex-wrap">
                {STATUSSEN.map((s) => (
                    <button
                        key={s}
                        className={`btn btn-sm ${statusFilter === s ? 'btn-dark' : 'btn-outline-secondary'}`}
                        onClick={() => setStatusFilter(s)}
                    >
                        {s === '' ? 'Alle' : s}
             </button>
                ))}
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            {loading ? (
                <p>Laden...</p>
            ) : stages.length === 0 ? (
                <div className="alert alert-info">Geen voorstellen gevonden.</div>
              ) : (
                <table className="table table-hover table-bordered">
                    <thead className="table-light">
                        <tr>
                            <th>Student</th>
                            <th>Bedrijf</th>
                            <th>Ingediend op</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stages.map((stage) => (
                            
                            <tr
                                key={stage.id}
                                style={{ cursor: 'pointer' }}
                                onClick={() => navigate(`/commissie/stages/${stage.id}`)}
                            >
                                <td>{stage.student_naam}</td>
                                <td>{stage.bedrijf_naam}</td>
                                <td>{new Date(stage.aangemaakt_op).toLocaleDateString('nl-BE')}</td>
                                <td><StatusBadge status={stage.status} /></td>
                            </tr>
                        ))}
                 </tbody>
                </table>
            )}
        </div>
    );
}