import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createStudentLogboek, getStudentLogboeken } from '../../api/student.js';
import { useAuth } from '../../context/AuthContext';
import StudentShell from './StudentShell';

export default function StudentLogboeken() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [logboeken, setLogboeken] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [form, setForm] = useState({
    weeknummer: '',
    taken: '',
    reflectie: '',
    leerpunten: '',
  });

  useEffect(() => {
    getStudentLogboeken()
      .then((data) => setLogboeken(data.logboeken || []))
      .catch(() => setError('Kon logboeken niet laden'))
      .finally(() => setLoading(false));
  }, []);

  const gesorteerd = useMemo(() => {
    return [...logboeken].sort((a, b) => {
      const weekDelta = (b.weeknummer || 0) - (a.weeknummer || 0);
      if (weekDelta !== 0) return weekDelta;

      const datumA = a.aangemaakt_op ? new Date(a.aangemaakt_op).getTime() : 0;
      const datumB = b.aangemaakt_op ? new Date(b.aangemaakt_op).getTime() : 0;
      return datumB - datumA;
    });
  }, [logboeken]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setForm((vorigeForm) => ({
      ...vorigeForm,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError('');
    setSubmitSuccess('');

    const weeknummer = Number(form.weeknummer);
    if (!Number.isInteger(weeknummer) || weeknummer < 1 || weeknummer > 53) {
      setSubmitError('Weeknummer moet een geheel getal zijn tussen 1 en 53.');
      return;
    }

    if (!form.taken.trim() || !form.reflectie.trim()) {
      setSubmitError('Taken en reflectie zijn verplicht.');
      return;
    }

    try {
      setSubmitLoading(true);

      const payload = {
        weeknummer,
        taken: form.taken.trim(),
        reflectie: form.reflectie.trim(),
        leerpunten: form.leerpunten.trim(),
      };

      const data = await createStudentLogboek(payload);
      setLogboeken((vorigeLogboeken) => [data.logboek, ...vorigeLogboeken]);
      setForm({ weeknummer: '', taken: '', reflectie: '', leerpunten: '' });
      setSubmitSuccess('Logboek succesvol opgeslagen.');
    } catch (submitErr) {
      const foutBoodschap = submitErr?.response?.data?.error
        || submitErr?.response?.data?.message
        || 'Opslaan van logboek mislukt.';
      setSubmitError(foutBoodschap);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <StudentShell
      user={user}
      onLogout={handleLogout}
      title="Mijn logboeken"
      subtitle="Volg je wekelijkse activiteiten en reflecties."
      activeTab="logboeken"
    >
      <div className="card mb-4">
        <div className="card-header bg-danger text-white">Nieuw weeklogboek invullen</div>
        <div className="card-body">
          {submitError && <div className="alert alert-danger">{submitError}</div>}
          {submitSuccess && <div className="alert alert-success">{submitSuccess}</div>}

          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-12 col-md-4">
                <label className="form-label" htmlFor="weeknummer">Weeknummer</label>
                <input
                  id="weeknummer"
                  name="weeknummer"
                  type="number"
                  min="1"
                  max="53"
                  className="form-control"
                  value={form.weeknummer}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="col-12">
                <label className="form-label" htmlFor="taken">Uitgevoerde taken</label>
                <textarea
                  id="taken"
                  name="taken"
                  className="form-control"
                  rows="4"
                  value={form.taken}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="col-12">
                <label className="form-label" htmlFor="reflectie">Reflectie</label>
                <textarea
                  id="reflectie"
                  name="reflectie"
                  className="form-control"
                  rows="4"
                  value={form.reflectie}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="col-12">
                <label className="form-label" htmlFor="leerpunten">Leerpunten of problemen</label>
                <textarea
                  id="leerpunten"
                  name="leerpunten"
                  className="form-control"
                  rows="3"
                  value={form.leerpunten}
                  onChange={handleInputChange}
                />
              </div>

              <div className="col-12 d-flex justify-content-end">
                <button type="submit" className="btn btn-danger" disabled={submitLoading}>
                  {submitLoading ? 'Opslaan...' : 'Logboek opslaan'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header bg-danger text-white">Logboekoverzicht (nieuwste week eerst)</div>
        <div className="card-body">
          {loading && <div>Laden...</div>}
          {!loading && error && <div className="alert alert-danger mb-0">{error}</div>}
          {!loading && !error && gesorteerd.length === 0 && (
            <div className="alert alert-info mb-0">Nog geen logboeken beschikbaar.</div>
          )}

          {!loading && !error && gesorteerd.length > 0 && (
            <ul className="list-group">
              {gesorteerd.map((logboek) => (
                <li key={logboek.id} className="list-group-item">
                  <div className="fw-semibold mb-1">Week {logboek.weeknummer || '-'}</div>
                  <div className="mb-2">
                    <div className="small text-muted fw-semibold">Taken</div>
                    <div style={{ whiteSpace: 'pre-wrap' }}>{logboek.taken || '-'}</div>
                  </div>
                  <div className="mb-2">
                    <div className="small text-muted fw-semibold">Reflectie</div>
                    <div style={{ whiteSpace: 'pre-wrap' }}>{logboek.reflectie || '-'}</div>
                  </div>
                  <div>
                    <div className="small text-muted fw-semibold">Leerpunten / problemen</div>
                    <div style={{ whiteSpace: 'pre-wrap' }}>{logboek.leerpunten || '-'}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </StudentShell>
  );
}
