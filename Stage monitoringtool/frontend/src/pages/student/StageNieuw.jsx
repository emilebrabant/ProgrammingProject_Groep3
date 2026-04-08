
{/*formulier voor student om een stagevoorstel in te dienen*/}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { stageIndienen, getDocenten } from '../../api/stages.js';

export default function StageNieuw() {
    const navigate = useNavigate();

    {/*Formuliervelden*/}
    const [form, setForm] = useState({
        bedrijf_naam: '',
        bedrijf_adres: '',
        contactpersoon: '',
        opdracht: '',
        start_datum: '',
        eind_datum: '',
        docent_id: '',
    });

    {/*inline validatiefouten per veld*/}
    const [errors, setErrors] = useState({});

    {/*Lijst v docenten voor de dropdown*/}
    const [docenten, setDocenten] = useState([]);

    {/*Algemene foutmelding van de server*/}
    const [serverError, setServerError] = useState('');

    {/*Laad docenten bij openen van de pagina*/}
    useEffect(() => {
        getDocenten()
            .then((data) => setDocenten(data.docenten))
            .catch(() => setServerError('Kon docentenlijst niet laden'));
       }, []);


    {/*Veld aanpassen en fout voor dat veld wissen*/}
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    {/*Controleer alle verplichte velden*/}
    const validate = () => {
        const newErrors = {};

        if (!form.bedrijf_naam.trim()) newErrors.bedrijf_naam = 'Bedrijfsnaam is verplicht';
        if (!form.bedrijf_adres.trim()) newErrors.bedrijf_adres = 'Adres is verplicht';
        if (!form.contactpersoon.trim()) newErrors.contactpersoon = 'Contactpersoon is verplicht';
        if (!form.opdracht.trim()) newErrors.opdracht = 'Opdrachtsomschrijving is verplicht';
        if (!form.start_datum) newErrors.start_datum = 'Startdatum is verplicht';
        if (!form.eind_datum) newErrors.eind_datum = 'Einddatum is verplicht';
        if (!form.docent_id) newErrors.docent_id = 'Docent is verplicht';

    {/*Einddatum moet na startdatum liggen*/}
    if (form.start_datum && form.eind_datum && form.eind_datum <= form.start_datum) {
            newErrors.eind_datum = 'Einddatum moet na de startdatum liggen';
        }

        return newErrors;
    };

    {/*Formulier indienen*/}
    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerError('');

        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        try {
            await stageIndienen(form);
            {/*terug naar overzicht na indienen*/}
            navigate('/student/stages');
        } catch (err) {
            setServerError(err.response?.data?.error || 'Er ging iets mis, probeer opnieuw.');
        }
    };

 return (
        <div className="container mt-4">
            <h2>Nieuw stagevoorstel indienen</h2>
            <p className="text-muted">Vul alle verplichte velden in om je stagevoorstel in te dienen.</p>

{/*Algemene servererror*/}
            {serverError && (
                <div className="alert alert-danger">{serverError}</div>
            )}

            <form onSubmit={handleSubmit} noValidate>

{/*Bedrijfsnaam*/}
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


{/*Adres*/}
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

{/*Contactpersoon*/}
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

{/*Opdrachtsomschrijving*/}
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


{/*Startdatum en einddatum naast elkaar*/}
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

{/*Docent dropdown*/}
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

{/*Knoppen*/}
                <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-primary">
                        Voorstel indienen
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={() => navigate('/student/stages')}>
                        Annuleren
                    </button>
               </div>

         </form>
        </div>
    );
}