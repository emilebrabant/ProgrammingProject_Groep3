import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMijnStages, getStageOvereenkomstUrl, uploadStageOvereenkomst } from '../../api/stages.js';
import { useAuth } from '../../context/AuthContext';
import StudentShell from './StudentShell';

function statusClass(status) {
  const normalized = status?.toLowerCase();
  if (normalized === 'goedgekeurd') return 'bg-success';
  if (normalized === 'afgekeurd') return 'bg-danger';
  if (normalized === 'aanpassing_vereist' || normalized === 'aanpassing vereist') return 'bg-warning text-dark';
  return 'bg-primary';
}

function formatDate(dateValue) {
  if (!dateValue) return '-';
  return new Date(dateValue).toLocaleDateString('nl-BE');
}

function overeenkomstStatusLabel(status) {
  const normalized = status?.toLowerCase();
  if (normalized === 'geupload') return 'Geüpload, wachtend op validatie';
  if (normalized === 'gevalideerd') return 'Gevalideerd';
  if (normalized === 'afgekeurd') return 'Afgekeurd';
  return '-';
}

function overeenkomstStatusClass(status) {
  const normalized = status?.toLowerCase();
  if (normalized === 'geupload') return 'bg-warning text-dark';
  if (normalized === 'gevalideerd') return 'bg-success';
  if (normalized === 'afgekeurd') return 'bg-danger';
  return 'bg-secondary';
}

export default function StudentStagevoorstellen() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploadingStageId, setUploadingStageId] = useState(null);
  const [actieError, setActieError] = useState('');
  const [actieSuccess, setActieSuccess] = useState('');

  useEffect(() => {
    getMijnStages()
      .then((data) => setStages(data.stages || []))
      .catch(() => setError('Kon stagevoorstellen niet laden'))
      .finally(() => setLoading(false));
  }, []);

  const heeftActiefVoorstel = useMemo(
    () => stages.some((stage) => stage.status?.toLowerCase() !== 'afgekeurd'),
    [stages]
  );

  const heeftGevalideerdeOvereenkomst = useMemo(
    () => stages.some((stage) => stage.overeenkomst_status?.toLowerCase() === 'gevalideerd'),
    [stages]
  );

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const herlaadStages = async () => {
    const data = await getMijnStages();
    setStages(data.stages || []);
  };

  const handleUpload = async (stageId, event) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setActieError('Enkel PDF-bestanden zijn toegestaan.');
      setActieSuccess('');
      return;
    }

    setActieError('');
    setActieSuccess('');
    setUploadingStageId(stageId);

    try {
      const response = await uploadStageOvereenkomst(stageId, file);
      await herlaadStages();
      setActieSuccess(response?.overeenkomstStatusLabel || 'Geupload, wachtend op validatie');
    } catch (requestError) {
      const apiError = requestError?.response?.data?.error;
      setActieError(apiError || 'Upload mislukt. Probeer opnieuw.');
    } finally {
      setUploadingStageId(null);
    }
  };

  return (
    <StudentShell
      user={user}
      onLogout={handleLogout}
      title="Mijn stagevoorstellen"
      subtitle="Beheer je voorstel en volg feedback van de commissie."
      activeTab="stagevoorstellen"
      heeftGevalideerdeOvereenkomst={heeftGevalideerdeOvereenkomst}
    >
      <div className="card mb-4">
        <div className="card-header bg-danger text-white d-flex justify-content-between align-items-center gap-2">
          <span>Overzicht voorstellen</span>
          {!heeftActiefVoorstel && (
            <button
              type="button"
              className="btn btn-light btn-sm"
              onClick={() => navigate('/student/stages/nieuw')}
            >
              + Nieuw voorstel
            </button>
          )}
        </div>
        <div className="card-body">
          {loading && <div>Laden...</div>}
          {!loading && error && <div className="alert alert-danger mb-0">{error}</div>}
          {!loading && !error && actieError && <div className="alert alert-danger mb-3">{actieError}</div>}
          {!loading && !error && actieSuccess && <div className="alert alert-success mb-3">{actieSuccess}</div>}

          {!loading && !error && stages.length === 0 && (
            <div className="alert alert-info mb-0">
              Je hebt nog geen stagevoorstel ingediend.
            </div>
          )}

          {!loading && !error && stages.length > 0 && (
            <div className="table-responsive">
              <table className="table table-striped mb-0">
                <thead>
                  <tr>
                    <th>Bedrijf</th>
                    <th>Docent</th>
                    <th>Periode</th>
                    <th>Status</th>
                    <th>Overeenkomst</th>
                    <th>Feedback</th>
                    <th>Actie</th>
                  </tr>
                </thead>
                <tbody>
                  {stages.map((stage) => {
                    const normalizedStatus = stage.status?.toLowerCase();
                    const aanpasbaar = normalizedStatus === 'aanpassing_vereist' || normalizedStatus === 'aanpassing vereist';
                    const isGoedgekeurd = normalizedStatus === 'goedgekeurd';
                    const heeftOvereenkomst = Boolean(stage.overeenkomst_bestand_pad);
                    const overeenkomstBeoordelingStatus = stage.overeenkomst_status?.toLowerCase();
                    const magUploaden = !heeftOvereenkomst || overeenkomstBeoordelingStatus === 'afgekeurd';

                    return (
                      <tr key={stage.id}>
                        <td>{stage.bedrijf_naam}</td>
                        <td>{stage.docent_naam || '-'}</td>
                        <td>{formatDate(stage.start_datum)} - {formatDate(stage.eind_datum)}</td>
                        <td>
                          <span className={`badge ${statusClass(stage.status)}`}>{stage.status}</span>
                        </td>
                        <td>
                          {stage.overeenkomst_status ? (
                            <span className={`badge ${overeenkomstStatusClass(stage.overeenkomst_status)}`}>
                              {overeenkomstStatusLabel(stage.overeenkomst_status)}
                            </span>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td style={{ whiteSpace: 'pre-wrap' }}>{stage.laatste_feedback || '-'}</td>
                        <td>
                          {aanpasbaar ? (
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => navigate(`/student/stages/${stage.id}/aanpassen`)}
                            >
                              Aanpassen
                            </button>
                          ) : isGoedgekeurd ? (
                            <div className="d-flex flex-wrap gap-2">
                              {magUploaden ? (
                                <label className="btn btn-sm btn-danger mb-0">
                                  {uploadingStageId === stage.id ? 'Uploaden...' : heeftOvereenkomst ? 'Nieuwe PDF uploaden' : 'PDF uploaden'}
                                  <input
                                    type="file"
                                    accept="application/pdf,.pdf"
                                    className="d-none"
                                    onChange={(event) => handleUpload(stage.id, event)}
                                    disabled={uploadingStageId === stage.id}
                                  />
                                </label>
                              ) : (
                                <span className="text-muted">PDF wacht op validatie</span>
                              )}
                              {heeftOvereenkomst && (
                                <a
                                  className="btn btn-sm btn-outline-secondary"
                                  href={getStageOvereenkomstUrl(stage.id)}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  Bekijk PDF
                                </a>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </StudentShell>
  );
}
