import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import StudentShell from './StudentShell';
import { getStudentEvaluatie, slaZelfevaluatieOp } from '../../api/evaluaties';

export default function StudentEvaluaties() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const [competenties, setCompetenties] = useState([]);
    const [scores, setScores] = useState({});
    const [vergrendeld, setVergrendeld] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Tekstvelden per competentie bijhouden
    const [beschrijvingen, setBeschrijvingen] = useState({});

    //ppslaan status per competentie
    const [bezig, setBezig] = useState(null);
    const [berichtPerCompetentie, setBerichtPerCompetentie] = useState({});

    const handleLogout = async () => {
        await logout();
        navigate('/login', { replace: true });
    };

    const laadEvaluatie = async () => {
        setLoading(true);
        setError(''); 
        try {
            const data = await getStudentEvaluatie();

            setCompetenties(data.competenties || []);
          setVergrendeld(data.evaluatie?.vergrendeld === 1);
            const scoresMap = {};
            const beschrijvingenMap = {};
            (data.scores || []).forEach((s) => {
                scoresMap[s.competentie_id] = s;
                beschrijvingenMap[s.competentie_id] = s.student_beschrijving || '';
            });
            setScores(scoresMap);
            setBeschrijvingen(beschrijvingenMap);
        } catch {
            setError('Kon evaluatie niet laden. Probeer opnieuw.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        laadEvaluatie();
      }, []); 

    const handleOpslaan = async (competentie_id) => {
        setBezig(competentie_id);
        setBerichtPerCompetentie((prev) => ({ ...prev, [competentie_id]: null }));

        try {
            await slaZelfevaluatieOp(competentie_id, beschrijvingen[competentie_id] || '');
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

    return (
        <StudentShell
            user={user}
            onLogout={handleLogout}
            title="Mijn evaluaties"
            subtitle="Beschrijf per competentie jouw vorderingen tijdens de stage."
            activeTab="evaluaties"
        >
            {vergrendeld && (
                <div className="alert alert-warning">
                    De evaluatie is afgesloten en kan niet meer bewerkt worden.
                </div>
            )}

            {loading ? (
                <p>Laden...</p>
            ) : error ? (
                <div className="alert alert-danger">{error}</div>
            ) : competenties.length === 0 ? (
                <div className="alert alert-info">
                    Geen actieve competenties gevonden.
                </div>
            ) : (
                <div className="card"> 
                    <div className="card-header bg-danger text-white">
                        Zelfevaluatie per competentie
                    </div>
                    <div className="card-body p-0">
                        {competenties.map((competentie) => (
                            <div key={competentie.id} className="border-bottom p-3">
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                    <h6 className="mb-0">{competentie.naam}</h6>
                                    <span className="badge bg-secondary">
                                        {competentie.gewicht}%
                                    </span>
                                </div>
                                {competentie.omschrijving && (
                                    <p className="text-muted small mb-2">
                                        {competentie.omschrijving}
                                    </p>
                                )}
                                {vergrendeld ? (
                                    <div className="p-2 bg-light rounded">
                                        {beschrijvingen[competentie.id] || (
                                            <span className="text-muted small">
                                                Geen beschrijving ingevoerd.
                                            </span>
                                        )}
                                    </div>
                                ) : (
                                    <div>
                                        {berichtPerCompetentie[competentie.id] && (
                                            <div className={`alert alert-${berichtPerCompetentie[competentie.id].type} py-1 small`}>
                                                {berichtPerCompetentie[competentie.id].tekst}
                                            </div>
                                        )}
                                        <textarea
                                            className="form-control mb-2"
                                            rows={3}
                                            placeholder="Beschrijf hier jouw vorderingen..."
                                            value={beschrijvingen[competentie.id] || ''}
                                            onChange={(e) =>
                                                setBeschrijvingen((prev) => ({
                                                    ...prev,
                                                    [competentie.id]: e.target.value,
                                                }))
                                            }
                                        />
                                        <button
                                            className="btn btn-danger btn-sm"
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
            )}
        </StudentShell>
    );
} 