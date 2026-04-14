
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { stageIndienen, stageAanpassen, getDocenten, getMijnStages } from '../../api/stages.js';

const EMPTY_FORM = {
    bedrijf_naam: '',
    bedrijf_adres: '',
    contactpersoon: '',
    opdracht: '',
    start_datum: '',
    eind_datum: '',
    docent_id: '',
};

const toDateInputValue = (dateValue) => {
    if (!dateValue) {
        return '';
    }

    return new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Europe/Brussels',
    }).format(new Date(dateValue));
};

export default function StageNieuw() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = Boolean(id);

    const [form, setForm] = useState(EMPTY_FORM);
    const [errors, setErrors] = useState({});
    const [docenten, setDocenten] = useState([]);
    const [serverError, setServerError] = useState('');
    const [loadingStage, setLoadingStage] = useState(isEditMode);
    const [stageInfo, setStageInfo] = useState(null);

    useEffect(() => {
        getDocenten()
            .then((data) => setDocenten(data.docenten))
            .catch(() => setServerError('Kon docentenlijst niet laden'));
    }, []);

    useEffect(() => {
        if (!isEditMode) {
            return;
        }

        setLoadingStage(true);
        getMijnStages()
            .then((data) => {
                const gevondenStage = data.stages.find((stage) => String(stage.id) === String(id));

                if (!gevondenStage) {
                    setServerError('Voorstel niet gevonden');
                    return;
                }

                const status = gevondenStage.status?.toLowerCase();
                if (status !== 'aanpassing_vereist' && status !== 'aanpassing vereist') {
                    setServerError('Je kan dit voorstel alleen aanpassen wanneer de status aanpassing vereist is.');
                    return;
                }

                setStageInfo(gevondenStage);
                setForm({
                    bedrijf_naam: gevondenStage.bedrijf_naam || '',
                    bedrijf_adres: gevondenStage.bedrijf_adres || '',
                    contactpersoon: gevondenStage.contactpersoon || '',
                    opdracht: gevondenStage.opdracht || '',
                    start_datum: toDateInputValue(gevondenStage.start_datum),
                    eind_datum: toDateInputValue(gevondenStage.eind_datum),
                    docent_id: String(gevondenStage.docent_id || ''),
                });
            })
            .catch(() => setServerError('Kon stagevoorstel niet laden'))
            .finally(() => setLoadingStage(false));
    }, [id, isEditMode]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const validate = () => {
        const newErrors = {};

        if (!form.bedrijf_naam.trim()) newErrors.bedrijf_naam = 'Bedrijfsnaam is verplicht';
        if (!form.bedrijf_adres.trim()) newErrors.bedrijf_adres = 'Adres is verplicht';
        if (!form.contactpersoon.trim()) newErrors.contactpersoon = 'Contactpersoon is verplicht';
        if (!form.opdracht.trim()) newErrors.opdracht = 'Opdrachtsomschrijving is verplicht';
        if (!form.start_datum) newErrors.start_datum = 'Startdatum is verplicht';
        if (!form.eind_datum) newErrors.eind_datum = 'Einddatum is verplicht';
        if (!form.docent_id) newErrors.docent_id = 'Docent is verplicht';

        if (form.start_datum && form.eind_datum && form.eind_datum <= form.start_datum) {
            newErrors.eind_datum = 'Einddatum moet na de startdatum liggen';
        }

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerError('');

        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        try {
            if (isEditMode) {
                await stageAanpassen(id, form);
            } else {
                await stageIndienen(form);
            }

            navigate('/student/stages');
        } catch (err) {
            setServerError(err.response?.data?.error || 'Er ging iets mis, probeer opnieuw.');
        }
    };

    if (loadingStage) {
        return <div className="container mt-4">Laden...</div>;
    }

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
                <div>
                    <h2>{isEditMode ? 'Stagevoorstel aanpassen' : 'Nieuw stagevoorstel indienen'}</h2>
                    <p className="text-muted mb-0">
                        {isEditMode
                            ? 'Pas je voorstel aan op basis van de feedback van de commissie en dien het opnieuw in.'
                            : 'Vul alle verplichte velden in om je stagevoorstel in te dienen.'}
                    </p>
                </div>
                <button type="button" className="btn btn-secondary" onClick={() => navigate('/student/stages')}>
                    Terug
                </button>
            </div>

            {stageInfo?.laatste_feedback && (
                <div className="alert alert-warning">
                    <div className="fw-semibold mb-1">Feedback van de commissie</div>
                    <div style={{ whiteSpace: 'pre-wrap' }}>{stageInfo.laatste_feedback}</div>
                </div>
            )}

            {serverError && <div className="alert alert-danger">{serverError}</div>}

            <form onSubmit={handleSubmit} noValidate>
                <div className="mb-3">
                    <label className="form-label">Bedrijfsnaam *</label>
                    <input
                        type="text"
                        name="bedrijf_naam"
                        className={`form-control ${errors.bedrijf_naam ? 'is-invalid' : ''}`}
                        value={form.bedrijf_naam}
                        onChange={handleChange}
                    />
                    {errors.bedrijf_naam && <div className="invalid-feedback">{errors.bedrijf_naam}</div>}
                </div>

                <div className="mb-3">
                    <label className="form-label">Adres bedrijf *</label>
                    <input
                        type="text"
                        name="bedrijf_adres"
                        className={`form-control ${errors.bedrijf_adres ? 'is-invalid' : ''}`}
                        value={form.bedrijf_adres}
                        onChange={handleChange}
                    />
                    {errors.bedrijf_adres && <div className="invalid-feedback">{errors.bedrijf_adres}</div>}
                </div>

                <div className="mb-3">
                    <label className="form-label">Contactpersoon *</label>
                    <input
                        type="text"
                        name="contactpersoon"
                        className={`form-control ${errors.contactpersoon ? 'is-invalid' : ''}`}
                        value={form.contactpersoon}
                        onChange={handleChange}
                    />
                    {errors.contactpersoon && <div className="invalid-feedback">{errors.contactpersoon}</div>}
                </div>

                <div className="mb-3">
                    <label className="form-label">Opdrachtsomschrijving *</label>
                    <textarea
                        name="opdracht"
                        rows={4}
                        className={`form-control ${errors.opdracht ? 'is-invalid' : ''}`}
                        value={form.opdracht}
                        onChange={handleChange}
                    />
                    {errors.opdracht && <div className="invalid-feedback">{errors.opdracht}</div>}
                </div>

                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Startdatum *</label>
                        <input
                            type="date"
                            name="start_datum"
                            className={`form-control ${errors.start_datum ? 'is-invalid' : ''}`}
                            value={form.start_datum}
                            onChange={handleChange}
                        />
                        {errors.start_datum && <div className="invalid-feedback">{errors.start_datum}</div>}
                    </div>

                    <div className="col-md-6 mb-3">
                        <label className="form-label">Einddatum *</label>
                        <input
                            type="date"
                            name="eind_datum"
                            className={`form-control ${errors.eind_datum ? 'is-invalid' : ''}`}
                            value={form.eind_datum}
                            onChange={handleChange}
                        />
                        {errors.eind_datum && <div className="invalid-feedback">{errors.eind_datum}</div>}
                    </div>
                </div>

                <div className="mb-3">
                    <label className="form-label">Begeleidende docent *</label>
                    <select
                        name="docent_id"
                        className={`form-select ${errors.docent_id ? 'is-invalid' : ''}`}
                        value={form.docent_id}
                        onChange={handleChange}
                    >
                        <option value="">-- Kies een docent --</option>
                        {docenten.map((d) => (
                            <option key={d.id} value={d.id}>{d.naam}</option>
                        ))}
                    </select>
                    {errors.docent_id && <div className="invalid-feedback">{errors.docent_id}</div>}
                </div>

                <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-primary">
                        {isEditMode ? 'Opnieuw indienen' : 'Voorstel indienen'}
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={() => navigate('/student/stages')}>
                        Annuleren
                    </button>
                </div>
            </form>
        </div>
    );
}