import { useEffect, useState } from 'react';
import MentorShell from './MentorShell';
import { getMentorLogboeken, aftekenenLogboek } from '../../api/stages';

export default function MentorLogboeken() {
    const [logboeken, setLogboeken] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [commentaren, setCommentaren] = useState({});
    const [bezig, setBezig] = useState(null);
    const [berichtPerLogboek, setBerichtPerLogboek] = useState({});

    useEffect(() => {
        laadLogboeken();
    }, []);

    const laadLogboeken = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await getMentorLogboeken();
            setLogboeken(data.logboeken || []);
        } catch {
            setError('Kon logboeken niet laden. Probeer opnieuw.');
        } finally {
            setLoading(false);
        }
    };

    const handleAftekenen = async (logboekId) => {
        setBezig(logboekId);
        setBerichtPerLogboek((prev) => ({ ...prev, [logboekId]: null }));

        try {
            await aftekenenLogboek(logboekId, commentaren[logboekId] || '');
            setBerichtPerLogboek((prev) => ({
                ...prev,
                [logboekId]: { type: 'success', tekst: 'Logboek afgetekend!' },
            }));
            await laadLogboeken();
        } catch {
            setBerichtPerLogboek((prev) => ({
                ...prev,
                [logboekId]: { type: 'danger', tekst: 'Aftekenen mislukt. Probeer opnieuw.' },
            }));
        } finally {
            setBezig(null);
        }
    };

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
        <MentorShell
            title="Logboeken"
            subtitle="Bekijk en teken de wekelijkse logboeken van uw studenten af."
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
                        <div className="card-header bg-primary text-white">
                            <strong>{groep.student_naam}</strong>
                            <span className="ms-2 small">{groep.student_email}</span>
                        </div>

                        <div className="card-body p-0">
                            {groep.logboeken.map((logboek) => (
                                <div key={logboek.id} className="border-bottom p-3">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <h6 className="mb-0">Week {logboek.weeknummer}</h6>
                                        {logboek.afgetekend_door ? (
                                            <span className="badge bg-success">Afgetekend</span>
                                        ) : (
                                            <span className="badge bg-warning text-dark">
                                                Nog af te tekenen
                                            </span>
                                        )}
                                    </div>

                                    <p className="mb-1"><strong>Taken:</strong> {logboek.taken}</p>
                                    <p className="mb-1"><strong>Reflectie:</strong> {logboek.reflectie}</p>
                                    {logboek.leerpunten && (
                                        <p className="mb-1">
                                            <strong>Leerpunten:</strong> {logboek.leerpunten}
                                        </p>
                                    )}

                                    {logboek.afgetekend_door ? (
                                        <div className="mt-2 p-2 bg-light rounded">
                                            <p className="mb-1 small text-muted">
                                                Afgetekend op:{' '}
                                                {new Date(logboek.afgetekend_op).toLocaleDateString('nl-BE')}
                                            </p>
                                            {logboek.mentor_commentaar && (
                                                <p className="mb-0 small">
                                                    <strong>Uw commentaar:</strong> {logboek.mentor_commentaar}
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="mt-2">
                                            {berichtPerLogboek[logboek.id] && (
                                                <div className={`alert alert-${berichtPerLogboek[logboek.id].type} py-1 small`}>
                                                    {berichtPerLogboek[logboek.id].tekst}
                                                </div>
                                            )}
                                            <textarea
                                                className="form-control mb-2"
                                                rows={2}
                                                placeholder="Optioneel commentaar..."
                                                value={commentaren[logboek.id] || ''}
                                                onChange={(e) =>
                                                    setCommentaren((prev) => ({
                                                        ...prev,
                                                        [logboek.id]: e.target.value,
                                                    }))
                                                }
                                            />
                                            <button
                                                className="btn btn-success btn-sm"
                                                onClick={() => handleAftekenen(logboek.id)}
                                                disabled={bezig === logboek.id}
                                            >
                                                {bezig === logboek.id ? 'Bezig...' : 'Aftekenen'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
              ))
     )}
 </MentorShell>
 );
}