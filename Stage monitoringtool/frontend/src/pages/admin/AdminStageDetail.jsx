import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getStageById, getStageHistoriek, getStageOvereenkomstUrl, valideerStageOvereenkomst, verwerkStageBeslissing } from '../../api/stages';
import { useAuth } from '../../context/AuthContext';
import AdminShell from './AdminShell';

function StatusBadge({ status }) {
  const kleuren = {
    ingediend: 'bg-primary',
    goedgekeurd: 'bg-success',
    afgekeurd: 'bg-danger',
    'aanpassing vereist': 'bg-warning text-dark',
    aanpassing_vereist: 'bg-warning text-dark'
  };
  const kleur = kleuren[status?.toLowerCase()] || 'bg-secondary';
  return <span className={`badge ${kleur}`}>{status}</span>;
}

function OvereenkomstStatusBadge({ status }) {
  const normalized = status?.toLowerCase();
  if (normalized === 'gevalideerd') return <span className="badge bg-success">Gevalideerd</span>;
  if (normalized === 'afgekeurd') return <span className="badge bg-danger">Afgekeurd</span>;
  if (normalized === 'geupload') return <span className="badge bg-warning text-dark">Geüpload, wachtend op validatie</span>;
  return <span className="badge bg-secondary">Niet geupload</span>;
}

export default function AdminStageDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [stage, setStage] = useState(null);
  const [historiek, setHistoriek] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [actieError, setActieError] = useState('');
  const [actieSuccess, setActieSuccess] = useState('');
  const [savingAction, setSavingAction] = useState('');
  const [overeenkomstReden, setOvereenkomstReden] = useState('');
  const [overeenkomstError, setOvereenkomstError] = useState('');
  const [overeenkomstSuccess, setOvereenkomstSuccess] = useState('');
  const [savingOvereenkomstActie, setSavingOvereenkomstActie] = useState('');

  const status = stage?.status?.toLowerCase();
  const isFinalStatus = status === 'goedgekeurd' || status === 'afgekeurd';
  const overeenkomstStatus = stage?.overeenkomst_status?.toLowerCase();
  const isOvereenkomstLocked = overeenkomstStatus === 'gevalideerd' || overeenkomstStatus === 'afgekeurd';

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  useEffect(() => {
    setLoading(true);
    setError('');

    Promise.all([getStageById(id), getStageHistoriek(id)])
      .then(([stageData, historiekData]) => {
        setStage(stageData.stage);
        setHistoriek(historiekData.historiek || []);
      })
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
        feedback: feedbackTekst || null
      });

      setStage(response.stage);
      const historiekResponse = await getStageHistoriek(id);
      setHistoriek(historiekResponse.historiek || []);
      setActieSuccess('Actie succesvol verwerkt. Je wordt teruggestuurd naar het overzicht.');
      if (actie === 'goedkeuren') {
        setFeedback('');
      }
      window.setTimeout(() => {
        navigate('/admin/stages');
      }, 1200);
    } catch (requestError) {
      const apiError = requestError?.response?.data?.error;
      setActieError(apiError || 'Beslissing kon niet opgeslagen worden.');
    } finally {
      setSavingAction('');
    }
  };

  const verwerkOvereenkomstActie = async (actie) => {
    if (!stage?.overeenkomst_bestand_pad) {
      setOvereenkomstError('Er is nog geen overeenkomst geupload.');
      return;
    }

    if (isOvereenkomstLocked) {
      setOvereenkomstError('Deze overeenkomst is al beoordeeld. Wacht tot de student een nieuwe versie uploadt.');
      return;
    }

    const redenTekst = overeenkomstReden.trim();
    if (actie === 'afkeuren' && !redenTekst) {
      setOvereenkomstError('Een reden is verplicht bij afkeuren.');
      return;
    }

    setOvereenkomstError('');
    setOvereenkomstSuccess('');
    setSavingOvereenkomstActie(actie);

    try {
      const response = await valideerStageOvereenkomst(id, {
        actie,
        reden: redenTekst || null,
      });

      setStage(response.stage);
      const historiekResponse = await getStageHistoriek(id);
      setHistoriek(historiekResponse.historiek || []);
      setOvereenkomstSuccess(response.message || 'Overeenkomststatus bijgewerkt.');
      if (actie === 'gevalideren') {
        setOvereenkomstReden('');
      }
    } catch (requestError) {
      const apiError = requestError?.response?.data?.error;
      setOvereenkomstError(apiError || 'Validatie van overeenkomst mislukt.');
    } finally {
      setSavingOvereenkomstActie('');
    }
  };

  let body;

  if (loading) {
    body = <p className="mb-0">Laden...</p>;
  } else if (error) {
    body = <div className="alert alert-danger mb-0">{error}</div>;
  } else if (!stage) {
    body = <div className="alert alert-warning mb-0">Voorstel niet gevonden.</div>;
  } else {
    body = (
      <>
        <button type="button" className="btn btn-secondary mb-3" onClick={() => navigate('/admin/stages')}>
          {'<- Terug naar overzicht'}
        </button>

        <h2>Stagevoorstel details</h2>
        <p><StatusBadge status={stage.status} /></p>

        {stage.laatste_feedback && (
          <div className="card mb-3 border-warning">
            <div className="card-header bg-warning-subtle">Laatste commissiefeedback</div>
            <div className="card-body">
              <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>{stage.laatste_feedback}</p>
            </div>
          </div>
        )}

        <div className="card mb-3">
          <div className="card-header bg-light">Bedrijfsgegevens</div>
          <div className="card-body">
            <p><strong>Bedrijfsnaam:</strong> {stage.bedrijf_naam}</p>
            <p><strong>Adres:</strong> {stage.bedrijf_adres}</p>
            <p><strong>Contactpersoon:</strong> {stage.contactpersoon}</p>
          </div>
        </div>

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
              onChange={(event) => setFeedback(event.target.value)}
              disabled={Boolean(savingAction) || isFinalStatus}
            />

            {actieError && <div className="alert alert-danger py-2">{actieError}</div>}
            {actieSuccess && <div className="alert alert-success py-2">{actieSuccess}</div>}

            <div className="d-flex flex-wrap gap-2">
              <button
                type="button"
                className="btn btn-success"
                onClick={() => verwerkActie('goedkeuren')}
                disabled={Boolean(savingAction) || isFinalStatus}
              >
                {savingAction === 'goedkeuren' ? 'Opslaan...' : 'Goedkeuren'}
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => verwerkActie('afkeuren')}
                disabled={Boolean(savingAction) || isFinalStatus}
              >
                {savingAction === 'afkeuren' ? 'Opslaan...' : 'Afkeuren'}
              </button>
              <button
                type="button"
                className="btn btn-warning"
                onClick={() => verwerkActie('aanpassing_vereist')}
                disabled={Boolean(savingAction) || isFinalStatus}
              >
                {savingAction === 'aanpassing_vereist' ? 'Opslaan...' : 'Aanpassing vereist'}
              </button>
            </div>
          </div>
        </div>

        <div className="card mb-0">
          <div className="card-header bg-light">Statushistoriek</div>
          <div className="card-body">
            {historiek.length === 0 ? (
              <div className="alert alert-info mb-0">Er zijn nog geen historiekregels voor dit voorstel.</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-sm align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Status</th>
                      <th>Datum</th>
                      <th>Gewijzigd door</th>
                      <th>Feedback</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historiek.map((regel) => (
                      <tr key={regel.id}>
                        <td><StatusBadge status={regel.status} /></td>
                        <td>{new Date(regel.gewijzigd_op).toLocaleString('nl-BE')}</td>
                        <td>{regel.gewijzigd_door_naam || 'Onbekend'}</td>
                        <td style={{ whiteSpace: 'pre-wrap' }}>{regel.feedback || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="card mb-3">
          <div className="card-header bg-light">Stageovereenkomst (PDF)</div>
          <div className="card-body">
            <p><strong>Status:</strong> <OvereenkomstStatusBadge status={stage.overeenkomst_status} /></p>
            {stage.overeenkomst_bestand_pad ? (
              <div className="d-flex flex-wrap gap-2">
                <a className="btn btn-outline-primary" href={getStageOvereenkomstUrl(stage.id)} target="_blank" rel="noreferrer">
                  Bekijk geuploade PDF
                </a>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={() => verwerkOvereenkomstActie('gevalideren')}
                  disabled={Boolean(savingOvereenkomstActie) || isOvereenkomstLocked}
                >
                  {savingOvereenkomstActie === 'gevalideren' ? 'Opslaan...' : 'Markeer als gevalideerd'}
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => verwerkOvereenkomstActie('afkeuren')}
                  disabled={Boolean(savingOvereenkomstActie) || isOvereenkomstLocked}
                >
                  {savingOvereenkomstActie === 'afkeuren' ? 'Opslaan...' : 'Afkeuren met reden'}
                </button>
              </div>
            ) : (
              <div className="text-muted">Nog geen PDF geupload door de student.</div>
            )}

            <label className="form-label mt-3" htmlFor="overeenkomstReden">Reden bij afkeuren</label>
            <textarea
              id="overeenkomstReden"
              className="form-control"
              rows="3"
              placeholder="Verplicht als je de overeenkomst afkeurt."
              value={overeenkomstReden}
              onChange={(event) => setOvereenkomstReden(event.target.value)}
              disabled={Boolean(savingOvereenkomstActie) || isOvereenkomstLocked}
            />

            {overeenkomstError && <div className="alert alert-danger py-2 mt-3 mb-0">{overeenkomstError}</div>}
            {overeenkomstSuccess && <div className="alert alert-success py-2 mt-3 mb-0">{overeenkomstSuccess}</div>}
          </div>
        </div>
      </>
    );
  }

  return (
    <AdminShell
      user={user}
      onLogout={handleLogout}
      title="Stagevoorstel"
      subtitle="Bekijk details, historiek en verwerk de beslissing."
      activeTab="stages"
    >
      <div className="card shadow-sm border-0">
        <div className="card-body p-4">
          {body}
        </div>
      </div>
    </AdminShell>
  );
}
