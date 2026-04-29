import { useEffect, useState } from 'react';
import DocentShell from './DocentShell';
import { getDocentLogboeken, voegFeedbackToe } from '../../api/stages';

export default function DocentLogboeken() {
    const [logboeken, setLogboeken] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');


    const [feedbackTekst, setFeedbackTekst] = useState({});
    const [bezig, setBezig] = useState(null);
    const [berichtPerLogboek, setBerichtPerLogboek] = useState({});

    useEffect(() => {
        laadLogboeken();
    }, []);

    const laadLogboeken = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await getDocentLogboeken();
            setLogboeken(data.logboeken || []);
        } catch {
            setError('Kon logboeken niet laden. Probeer opnieuw.');
        } finally {
            setLoading(false);
        }
  };

    const handleFeedback = async (logboekId) => {
        const tekst = feedbackTekst[logboekId] || '';
        if (!tekst.trim()) {
            setBerichtPerLogboek((prev) => ({
                ...prev,
                [logboekId]: { type: 'warning', tekst: 'Feedback mag niet leeg zijn.' },
            }));
            return;
        }

        setBezig(logboekId);
        setBerichtPerLogboek((prev) => ({ ...prev, [logboekId]: null }));

        try {
            await voegFeedbackToe(logboekId, tekst);
            setFeedbackTekst((prev) => ({ ...prev, [logboekId]: '' }));
            setBerichtPerLogboek((prev) => ({
                ...prev,
                [logboekId]: { type: 'success', tekst: 'Feedback succesvol toegevoegd!' },
            }));
            await laadLogboeken();
        } catch {
            setBerichtPerLogboek((prev) => ({
                ...prev,
                [logboekId]: { type: 'danger', tekst: 'Feedback toevoegen mislukt. Probeer opnieuw.' },
            }));
        } finally {
        setBezig(null);
        }
    };

    //logboeken groeperen per student
    const groeperenPerStudent = () => {
        const groepen = {};
        logboeken.forEach((l) => {
            const key = l.student_naam;
            if (!groepen[key]) {
                groepen[key] = {
                    student_naam: l.student_naam,
                    student_email: l.student_email,
                    logboeken: [],
                };
            }
            groepen[key].logboeken.push(l);
        });
 return Object.values(groepen);
    };

    const studentGroepen = groeperenPerStudent();

    return (
        <DocentShell
            title="Logboeken"
            subtitle="Bekijk de logboeken van uw studenten en geef feedback."
            activeTab="logboeken"
        >
            {error && <div className="alert alert-danger">{error}</div>}

            {loading ? (
                <p>Laden...</p>
            ) : studentGroepen.length === 0 ? (
                <div className="alert alert-info">
                    Er zijn nog geen logboeken van gekoppelde studenten.
                </div>
            ) : (
                studentGroepen.map((groep) => (
                    <div className="card mb-4" key={groep.student_naam}>
                       <div className="card-header bg-info text-white">
                            <strong>{groep.student_naam}</strong>
                            <span className="ms-2 small">{groep.student_email}</span>
                        </div>

                        <div className="card-body p-0">
                            {groep.logboeken.map((logboek) => (
                                <div key={logboek.id} className="border-bottom p-3">
                                    {/* Weeknummer en aftekenstatus */}
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <h6 className="mb-0">Week {logboek.weeknummer}</h6>
                                        {logboek.afgetekend_door ? (
                                            <span className="badge bg-success">Afgetekend door mentor</span>
                                        ) : (
                                           <span className="badge bg-warning text-dark">Nog niet afgetekend</span>
                                        )}
                                    </div>

                                    {/* Logboek inhoud */}
                                    <p className="mb-1"><strong>Taken:</strong> {logboek.taken}</p>
                                    <p className="mb-1"><strong>Reflectie:</strong> {logboek.reflectie}</p>
                                    {logboek.leerpunten && (
                                        <p className="mb-1">
                                            <strong>Leerpunten:</strong> {logboek.leerpunten}
                                        </p>
                                    )}

                                    {/* Mentor commentaar indien aanwezig */}
                                    {logboek.mentor_commentaar && (
                                        <div className="mt-2 p-2 bg-light rounded">
                                            <p className="mb-0 small">
                                                <strong>Mentor commentaar:</strong> {logboek.mentor_commentaar}
                                            </p>
                                        </div>
                                   )}

                                    {/* Feedback toevoegen */}
                                    <div className="mt-3">
                                        <p className="mb-1"><strong>Feedback geven:</strong></p>
                                        {berichtPerLogboek[logboek.id] && (
                                            <div className={`alert alert-${berichtPerLogboek[logboek.id].type} py-1 small`}>
                                                {berichtPerLogboek[logboek.id].tekst}
                                            </div>
                                        )}
                                        <textarea
                                            className="form-control mb-2"
                                            rows={2}
                                            placeholder="Schrijf hier uw feedback..."
                                            value={feedbackTekst[logboek.id] || ''}
                                            onChange={(e) =>
                                                setFeedbackTekst((prev) => ({
                                                    ...prev,
                                                    [logboek.id]: e.target.value,
                                               }))
                                            }
                                        />
                                        <button
                                            className="btn btn-info btn-sm text-white"
                                            onClick={() => handleFeedback(logboek.id)}
                                            disabled={bezig === logboek.id}
                                        >
                                            {bezig === logboek.id ? 'Bezig...' : 'Feedback toevoegen'}
                                        </button>
                                   </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))
            )}
        </DocentShell>
);
}