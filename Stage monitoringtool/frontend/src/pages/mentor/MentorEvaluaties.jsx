import { useEffect, useState } from 'react';
import MentorShell from './MentorShell';
import { getMentorEvaluatie, slaMentorScoreOp, dientEvaluatieIn } from '../../api/evaluaties';

// MentorEvaluaties
// - Doel: Laat mentoren scores en feedback geven per competentie
// - Belangrijk: validatie van scores (0-20) en indienen van evaluatie
export default function MentorEvaluaties() {
    // hoofdzakelijke data en status
    const [competenties, setCompetenties] = useState([]);
    const [scores, setScores] = useState({});
    const [evaluatie, setEvaluatie] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // score/feedback state per competentie
    const [mentorScores, setMentorScores] = useState({});
    const [mentorFeedback, setMentorFeedback] = useState({});

    // UI status per competentie
    const [bezig, setBezig] = useState(null);
    const [berichtPerCompetentie, setBerichtPerCompetentie] = useState({});

    // indienen status
    const [indievenBezig, setIndievenBezig] = useState(false);
    const [indievenBericht, setIndievenBericht] = useState(null);

    // Laad evaluatie en competenties van API
    const laadEvaluatie = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await getMentorEvaluatie();
            setEvaluatie(data.evaluatie);
            setCompetenties(data.competenties || []);

            // scores omzetten naar maps per competentie_id
            const scoresMap = {};
            const mentorScoresMap = {};
            const mentorFeedbackMap = {};

            (data.scores || []).forEach((s) => {
                scoresMap[s.competentie_id] = s;
                mentorScoresMap[s.competentie_id] = s.mentor_score ?? '';
                mentorFeedbackMap[s.competentie_id] = s.mentor_feedback || '';
            });

            setScores(scoresMap);
            setMentorScores(mentorScoresMap);
            setMentorFeedback(mentorFeedbackMap);
        } catch {
            setError('Geen evaluatie gevonden voor jouw student(en).');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        laadEvaluatie();
    }, []);

    // Handler: opslaan van mentor score/feedback voor één competentie
    const handleOpslaan = async (competentie_id) => {
        setBezig(competentie_id);
        setBerichtPerCompetentie((prev) => ({ ...prev, [competentie_id]: null }));

        const score = Number(mentorScores[competentie_id]);

        if (isNaN(score) || score < 0 || score > 20) {
            setBerichtPerCompetentie((prev) => ({
                ...prev,
                [competentie_id]: { type: 'warning', tekst: 'Score moet tussen 0 en 20 liggen.' },
            }));
            setBezig(null);
            return;
        }

        try {
            await slaMentorScoreOp(
                competentie_id,
                score,
                mentorFeedback[competentie_id] || ''
            );
            setBerichtPerCompetentie((prev) => ({
                ...prev,
                [competentie_id]: { type: 'success', tekst: 'Opgeslagen!' },
            }));
        } catch (err) {
            setBerichtPerCompetentie((prev) => ({
                ...prev,
                [competentie_id]: {
                    type: 'danger',
                    tekst: err?.response?.data?.error || 'Opslaan mislukt.',
                },
            }));
        } finally {
            setBezig(null);
        }
    };

    // Handler: indienen van volledige evaluatie
    const handleIndienen = async () => {
        const bevestigd = window.confirm(
            'Ben je zeker dat je de evaluatie wilt indienen? Dit kan niet meer ongedaan gemaakt worden.'
        );
        if (!bevestigd) return;

        setIndievenBezig(true);
        setIndievenBericht(null);

        try {
            await dientEvaluatieIn();
            setIndievenBericht({ type: 'success', tekst: 'Evaluatie succesvol ingediend!' });
            await laadEvaluatie();
        } catch (err) {
            setIndievenBericht({
                type: 'danger',
                tekst: err?.response?.data?.error || 'Indienen mislukt.',
            });
        } finally {
            setIndievenBezig(false) ;
        }
    };

    // Render via MentorShell
    return (
        <MentorShell
            title="Evaluatie"
            subtitle="Geef per competentie een score en feedback aan uw student."
            activeTab="evaluatie"
        >
            {error && <div className="alert alert-danger">{error}</div>}

            {loading ? (
                <p>Laden...</p>
            ) : !evaluatie ? (
                <div className="alert alert-info">
                    Geen evaluatie gevonden. De student moet eerst zijn zelfevaluatie starten.
                </div>
            ) : (
                <>
                    {evaluatie.vergrendeld ? (
                        <div className="alert alert-success">
                            ✅ De evaluatie is ingediend en kan niet meer bewerkt worden.
                        </div>
                    ) : (
                        <div className="alert alert-info">
                            Je kan scores opslaan als concept en later indienen.
                        </div>
                    )}

                    {indievenBericht && (
                        <div className={`alert alert-${indievenBericht.type}`}>
                            {indievenBericht.tekst}
                        </div> 
                )}

                    <div className="card mb-4">
                        <div className="card-header bg-primary text-white">
                            Evaluatie van {evaluatie.student_naam}
                        </div>
                        <div className="card-body p-0">
                            {competenties.map((competentie) => (
                                <div key={competentie.id} className="border-bottom p-3">
                                    {/* Competentie info */}
                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                        <h6 className="mb-0">{competentie.naam}</h6>
                                        <span className="badge bg-secondary">
                                            {competentie.gewicht}%
                                        </span>
                                    </div>
 
                                    {scores[competentie.id]?.student_beschrijving ? (
                                        <div className="p-2 bg-light rounded mb-2 small">
                                            <strong>Zelfevaluatie student:</strong>{' '}
                                            {scores[competentie.id].student_beschrijving}
                                        </div>
                                    ) : (
                                        <p className="text-muted small mb-2">
                                            Student heeft nog geen zelfevaluatie ingevuld.
                                        </p>
                                    )}

                                    {evaluatie.vergrendeld ? (
                                        <div className="p-2 bg-light rounded">
                                            <p className="mb-1 small">
                                                <strong>Score:</strong>{' '}
                                                {scores[competentie.id]?.mentor_score ?? '-'}/20
                                            </p>
                                            {scores[competentie.id]?.mentor_feedback && (
                                                <p className="mb-0 small">
                                                    <strong>Feedback:</strong>{' '}
                                                    {scores[competentie.id].mentor_feedback}
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <div>
                                            {berichtPerCompetentie[competentie.id] && (
                                                <div className={`alert alert-${berichtPerCompetentie[competentie.id].type} py-1 small`}>
                                                    {berichtPerCompetentie[competentie.id].tekst}
                                                </div>
                                            )}
                                            <div className="row g-2">
                                                <div className="col-12 col-md-3">
                                                    <label className="form-label small">
                                                        Score (0–20)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        className="form-control form-control-sm"
                                                        min="0"
                                                        max="20"
                                                        value={mentorScores[competentie.id] ?? ''}
                                                        onChange={(e) =>
                                                            setMentorScores((prev) => ({
                                                                ...prev, 
                                                                [competentie.id]: e.target.value,
                                                            }))
                                                        }
                                                    />
                                                </div>
                                                <div className="col-12 col-md-9">
                                                    <label className="form-label small">
                                                        Feedback (optioneel)
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm"
                                                        placeholder="Optionele feedback..."
                                                        value={mentorFeedback[competentie.id] || ''}
                                                        onChange={(e) =>
                                                            setMentorFeedback((prev) => ({
                                                                ...prev, 
                                                                [competentie.id]: e.target.value,
                                                            }))
                                                        }
                                                    />
                                                </div>
                                        </div>
                                            <button
                                                className="btn btn-primary btn-sm mt-2"
                                                onClick={() => handleOpslaan(competentie.id)}
                                                disabled={bezig === competentie.id}
                                            >
                                                {bezig === competentie.id ? 'Opslaan...' : 'Opslaan'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                 {!evaluatie.vergrendeld && (
                        <div className="d-flex justify-content-end">
                            <button
                                className="btn btn-success"
                                onClick={handleIndienen}
                                disabled={indievenBezig}
                            >
                                {indievenBezig ? 'Bezig...' : 'Evaluatie indienen'}
                            </button>
                        </div>
               )}
                </>
            )}
        </MentorShell>
    );
}