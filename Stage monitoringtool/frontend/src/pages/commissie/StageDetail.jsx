// Detailpagina van een stagevoorstel voor commissie

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getStageById, verwerkStageBeslissing } from '../../api/stages.js';

//gekleurde badge per status
function StatusBadge({ status }) {
    const kleuren = {
        'ingediend': 'bg-primary',
        'goedgekeurd': 'bg-success',
        'afgekeurd': 'bg-danger',
        'aanpassing vereist': 'bg-warning text-dark',
        'aanpassing_vereist': 'bg-warning text-dark',
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
    const [feedback, setFeedback] = useState('');
    const [actieError, setActieError] = useState('');
    const [actieSuccess, setActieSuccess] = useState('');
    const [savingAction, setSavingAction] = useState('');

    const status = stage?.status?.toLowerCase();
    const isFinalStatus = status === 'goedgekeurd' || status === 'afgekeurd';

//Laad de details van dit voorstel
    useEffect(() => {
        getStageById(id)
            .then((data) => setStage(data.stage))
            .catch(() => setError('Kon voorstel niet laden'))
            .finally(() => setLoading(false));
}, [id]);

    const verwerkActie = async (actie) => {
        if (isFinalStatus) {
            setActieError('Dit voorstel heeft een finale status en kan niet meer gewijzigd worden.');
            return;
        }

        const feedbackVerplicht = actie === 'afkeuren' || actie === 'aanpassing_vereist';
        const feedbackTekst = feedback.trim();

        if (feedbackVerplicht && !feedbackTekst) {
            setActieError('Feedback is verplicht bij afkeuren of aanpassing vereist.');
            return;
        }

        setActieError('');
        setActieSuccess('');
        setSavingAction(actie);

        try {
            const response = await verwerkStageBeslissing(id, {
                actie,
                feedback: feedbackTekst || null,
            });

            setStage(response.stage);
            setActieSuccess('Actie succesvol verwerkt. Je wordt teruggestuurd naar het overzicht.');
            if (actie === 'goedkeuren') {
                setFeedback('');
            }
            setTimeout(() => {
                navigate('/commissie/stages');
            }, 1200);
        } catch (err) {
            const apiError = err?.response?.data?.error;
            setActieError(apiError || 'Beslissing kon niet opgeslagen worden.');
        } finally {
            setSavingAction('');
        }
    };

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

            {stage.laatste_feedback && (
                <div className="card mb-3 border-warning">
                    <div className="card-header bg-warning-subtle">Laatste commissiefeedback</div>
                    <div className="card-body">
                        <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>{stage.laatste_feedback}</p>
                    </div>
                </div>
            )}

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

            <div className="card mb-3">
                <div className="card-header bg-light">Actie door commissie</div>
                <div className="card-body">
                    {isFinalStatus && (
                        <div className="alert alert-info">
                            Dit voorstel heeft al een finale status ({stage.status}) en kan niet meer aangepast worden.
                        </div>
                    )}

                    <label className="form-label" htmlFor="feedback">Feedback voor student</label>
                    <textarea
                        id="feedback"
                        className="form-control mb-3"
                        rows="4"
                        placeholder="Geef feedback. Verplicht bij afkeuren of aanpassing vereist."
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        disabled={Boolean(savingAction) || isFinalStatus}
                    />

                    {actieError && <div className="alert alert-danger py-2">{actieError}</div>}
                    {actieSuccess && <div className="alert alert-success py-2">{actieSuccess}</div>}

                    <div className="d-flex flex-wrap gap-2">
                        <button
                            className="btn btn-success"
                            onClick={() => verwerkActie('goedkeuren')}
                            disabled={Boolean(savingAction) || isFinalStatus}
                        >
                            {savingAction === 'goedkeuren' ? 'Opslaan...' : 'Goedkeuren'}
                        </button>
                        <button
                            className="btn btn-danger"
                            onClick={() => verwerkActie('afkeuren')}
                            disabled={Boolean(savingAction) || isFinalStatus}
                        >
                            {savingAction === 'afkeuren' ? 'Opslaan...' : 'Afkeuren'}
                        </button>
                        <button
                            className="btn btn-warning"
                            onClick={() => verwerkActie('aanpassing_vereist')}
                            disabled={Boolean(savingAction) || isFinalStatus}
                        >
                            {savingAction === 'aanpassing_vereist' ? 'Opslaan...' : 'Aanpassing vereist'}
                        </button>
                    </div>
                </div>
            </div>

        </div>
);
}