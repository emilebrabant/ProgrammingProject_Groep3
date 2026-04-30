import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminShell from './AdminShell';
import {
    getAlleCompetenties,
    createCompetentie,
    updateCompetentie,
    deleteCompetentie,
} from '../../api/competenties';

const leegFormulier = { naam: '', omschrijving: '', gewicht: '' };

export default function AdminCompetencies() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [competenties, setCompetenties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    //formulier voor nieuwe competentie
    const [form, setForm] = useState(leegFormulier);
    const [formError, setFormError] = useState('');
    const [formBezig, setFormBezig] = useState(false);


    const [bewerkId, setBewerkId] = useState(null);
    const [bewerkForm, setBewerkForm] = useState({});
    const [bewerkBezig, setBewerkBezig] = useState(false);
    const [bewerkError, setBewerkError] = useState('');

    const [verwijderBezig, setVerwijderBezig] = useState(null);


    const [bericht, setBericht] = useState({ type: '', tekst: '' });

    const handleLogout = async () => {
        await logout();
        navigate('/login', { replace: true });
    };

    const toonBericht = (type, tekst) => {
        setBericht({ type, tekst });
        setTimeout(() => setBericht({ type: '', tekst: '' }), 3000);
    };


    const laadCompetenties = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await getAlleCompetenties();
            setCompetenties(data.competenties || []);
        } catch {
            setError('Kon competenties niet laden.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        laadCompetenties();
    }, []);

    //Tot gewicht berekenen
    const totaalGewicht = competenties.reduce(
        (som, c) => som + Number(c.gewicht), 0
    );

//nieuwe competentie aanmaken
    const handleAanmaken = async (e) => {
        e.preventDefault();
        setFormError('');

        const gewicht = Number(form.gewicht);
        if (!form.naam.trim()) {
            setFormError('Naam is verplicht.');
            return;
        }
        if (isNaN(gewicht) || gewicht <= 0) {
            setFormError('Gewicht moet een positief getal zijn.');
            return;
        }

        setFormBezig(true);
        try {
            await createCompetentie({
                naam: form.naam.trim(),
                omschrijving: form.omschrijving.trim(),
                gewicht,
            });
            setForm(leegFormulier);
            toonBericht('success', 'Competentie aangemaakt!');
            await laadCompetenties();
        } catch (err) {
            setFormError(err?.response?.data?.error || 'Aanmaken mislukt.');
        } finally {
            setFormBezig(false);
        }
    };

    //Bewerken starten
    const startBewerken = (competentie) => {
        setBewerkId(competentie.id);
        setBewerkForm({
            naam: competentie.naam,
            omschrijving: competentie.omschrijving || '',
            gewicht: competentie.gewicht,
        });
        setBewerkError('');
    };

    //Bewerken opslaan
    const handleOpslaan = async (id) => {
        setBewerkError('');
        const gewicht = Number(bewerkForm.gewicht);

        if (!bewerkForm.naam.trim()) {
            setBewerkError('Naam is verplicht.');
            return;
        }
        if (isNaN(gewicht) || gewicht <= 0) {
            setBewerkError('Gewicht moet een positief getal zijn.');
            return;
        }

        setBewerkBezig(true);
        try {
            await updateCompetentie(id, {
                naam: bewerkForm.naam.trim(),
                omschrijving: bewerkForm.omschrijving.trim(),
                gewicht,
            });
            setBewerkId(null);
            toonBericht('success', 'Competentie bijgewerkt!');
            await laadCompetenties();
        } catch (err) {
            setBewerkError(err?.response?.data?.error || 'Opslaan mislukt.');
        } finally {
            setBewerkBezig(false);
        }
    };

    //competentie verwijderen
    const handleVerwijderen = async (id) => {
        const bevestigd = window.confirm(
            'Weet je zeker dat je deze competentie wilt verwijderen?'
        );
        if (!bevestigd) return;

        setVerwijderBezig(id);
        try {
            await deleteCompetentie(id);
            toonBericht('success', 'Competentie verwijderd!');
            await laadCompetenties();
        } catch (err) {
            toonBericht('danger', err?.response?.data?.error || 'Verwijderen mislukt.');
        } finally {
            setVerwijderBezig(null);
        }
    };

    return (
        <AdminShell
            user={user}
            onLogout={handleLogout}
            title="Competenties beheren"
            subtitle="Voeg competenties toe, bewerk ze of verwijder ze."
            activeTab="competenties"
        >
            {bericht.tekst && (
                <div className={`alert alert-${bericht.type}`}>{bericht.tekst}</div>
            )}

            {!loading && competenties.length > 0 && Math.round(totaalGewicht) !== 100 && (
                <div className="alert alert-warning">
                    De gewichten tellen op tot <strong>{totaalGewicht}%</strong> in plaats van 100%.
                </div>
            )}

            <div className="card shadow-sm border-0 mb-4">
                <div className="card-body p-4">
                    <h2 className="h5 mb-3">Nieuwe competentie toevoegen</h2>
                    {formError && <div className="alert alert-danger">{formError}</div>}
                    <form onSubmit={handleAanmaken}>
                        <div className="row g-3">
                            <div className="col-12 col-md-4">
                                <label className="form-label">Naam</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={form.naam}
                                    onChange={(e) => setForm((v) => ({ ...v, naam: e.target.value }))}
                                    required
                                />
                            </div>
                            <div className="col-12 col-md-5">
                                <label className="form-label">Omschrijving</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={form.omschrijving}
                                    onChange={(e) => setForm((v) => ({ ...v, omschrijving: e.target.value }))}
                                />
                            </div>
                            <div className="col-12 col-md-3">
                                <label className="form-label">Gewicht (%)</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    value={form.gewicht}
                                    min="0"
                                    step="0.01"
                                    onChange={(e) => setForm((v) => ({ ...v, gewicht: e.target.value }))}
                                    required
                                />
                            </div>
                            <div className="col-12 d-flex justify-content-end">
                                <button
                                    type="submit"
                                    className="btn btn-dark"
                                    disabled={formBezig}
                                >
                                    {formBezig ? 'Bezig...' : 'Toevoegen'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

      
            <div className="card shadow-sm border-0">
                <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h2 className="h5 mb-0">Alle competenties</h2>
                        <span className="badge text-bg-dark">
                            Totaal gewicht: {totaalGewicht}%
                        </span>
                    </div>

                    {loading ? (
                        <p>Laden...</p>
                    ) : error ? (
                        <div className="alert alert-danger">{error}</div>
                    ) : competenties.length === 0 ? (
                        <div className="alert alert-info">Nog geen competenties aangemaakt.</div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table align-middle mb-0">
                                <thead>
                                    <tr>
                                        <th>Naam</th>
                                        <th>Omschrijving</th>
                                        <th>Gewicht (%)</th>
                                        <th>Acties</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {competenties.map((competentie) => (
                                        <tr key={competentie.id}>
                                            {bewerkId === competentie.id ? (
                                                <>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            className="form-control form-control-sm"
                                                            value={bewerkForm.naam}
                                                            onChange={(e) =>
                                                                setBewerkForm((v) => ({ ...v, naam: e.target.value }))
                                                            }
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            className="form-control form-control-sm"
                                                            value={bewerkForm.omschrijving}
                                                            onChange={(e) =>
                                                                setBewerkForm((v) => ({ ...v, omschrijving: e.target.value }))
                                                            }
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            className="form-control form-control-sm"
                                                            value={bewerkForm.gewicht}
                                                            min="0"
                                                            step="0.01"
                                                            onChange={(e) =>
                                                                setBewerkForm((v) => ({ ...v, gewicht: e.target.value }))
                                                            }
                                                        />
                                                    </td>
                                                    <td>
                                                        {bewerkError && (
                                                            <div className="text-danger small mb-1">{bewerkError}</div>
                                                        )}
                                                        <div className="d-flex gap-2">
                                                            <button
                                                                className="btn btn-sm btn-primary"
                                                                onClick={() => handleOpslaan(competentie.id)}
                                                                disabled={bewerkBezig}
                                                            >
                                                                {bewerkBezig ? 'Opslaan...' : 'Opslaan'}
                                                            </button>
                                                            <button
                                                                className="btn btn-sm btn-outline-secondary"
                                                                onClick={() => setBewerkId(null)}
                                                                disabled={bewerkBezig}
                                                            >
                                                                Annuleren
                                                            </button>
                                                        </div>
                                                    </td>
                                                </>
                                            ) : (
                                                <>
                                                    <td>{competentie.naam}</td>
                                                    <td>{competentie.omschrijving || '-'}</td>
                                                    <td>{competentie.gewicht}%</td>
                                                    <td>
                                                        <div className="d-flex gap-2">
                                                            <button
                                                                className="btn btn-sm btn-primary"
                                                                onClick={() => startBewerken(competentie)}
                                                            >
                                                                Bewerken
                                                            </button>
                                                            <button
                                                                className="btn btn-sm btn-outline-danger"
                                                                onClick={() => handleVerwijderen(competentie.id)}
                                                                disabled={verwijderBezig === competentie.id}
                                                            >
                                                                {verwijderBezig === competentie.id
                                                                    ? 'Bezig...'
                                                                    : 'Verwijderen'}
                                                            </button>
                                                        </div>
                                                    </td>
                                                </>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </AdminShell>
    );
}