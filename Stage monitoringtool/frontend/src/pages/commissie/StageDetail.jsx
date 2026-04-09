// Detailpagina van een stagevoorstel voor commissie

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getStageById } from '../../api/stages.js';

//gekleurde badge per status
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

export default function StageDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [stage, setStage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

//Laad de details van dit voorstel
    useEffect(() => {
        getStageById(id)
            .then((data) => setStage(data.stage))
            .catch(() => setError('Kon voorstel niet laden'))
            .finally(() => setLoading(false));
}, [id]);

    if (loading) return <div className="container mt-4">Laden...</div>;
    if (error) return <div className="container mt-4"><div className="alert alert-danger">{error}</div></div>;
    if (!stage) return <div className="container mt-4"><div className="alert alert-warning">Voorstel niet gevonden.</div></div>;

    return (
        <div className="container mt-4">

            {/* terug knop */}
            <button className="btn btn-secondary mb-3" onClick={() => navigate('/commissie/stages')}>
                ← Terug naar overzicht
            </button>

       <h2>Stagevoorstel details</h2>

            {/* Status badge */}
            <p><StatusBadge status={stage.status} /></p>

            {/* Bedrijfsgeg */}
            <div className="card mb-3">
                <div className="card-header bg-light">Bedrijfsgegevens</div>
                <div className="card-body">
                    <p><strong>Bedrijfsnaam:</strong> {stage.bedrijf_naam}</p>
                    <p><strong>Adres:</strong> {stage.bedrijf_adres}</p>
                    <p><strong>Contactpersoon:</strong> {stage.contactpersoon}</p>
                </div>
     </div>

            {/* Stagegeg */}
            <div className="card mb-3">
                <div className="card-header bg-light">Stagegegevens</div>
                <div className="card-body">
                    <p><strong>Student:</strong> {stage.student_naam}</p>
                    <p><strong>Docent:</strong> {stage.docent_naam}</p>
                    <p><strong>Startdatum:</strong> {new Date(stage.start_datum).toLocaleDateString('nl-BE')}</p>
                    <p><strong>Einddatum:</strong> {new Date(stage.eind_datum).toLocaleDateString('nl-BE')}</p>
                    <p><strong>Ingediend op:</strong> {new Date(stage.aangemaakt_op).toLocaleDateString('nl-BE')}</p>
                </div>
             </div>

            {/* Opdrachtsomschrijving */}
            <div className="card mb-3">
                <div className="card-header bg-light">Opdrachtsomschrijving</div>
                <div className="card-body">
                    <p>{stage.opdracht}</p>
                </div>
            </div>

        </div>
);
}