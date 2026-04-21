import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getMijnStages } from '../../api/stages.js';

const toegangMeldingTekst = 'Logboeken en evaluaties komen pas vrij nadat je overeenkomst door een admin is gevalideerd.';

function StudentShell({ user, onLogout, title, subtitle, activeTab, children, heeftGevalideerdeOvereenkomst }) {
  const navigate = useNavigate();
  const location = useLocation();
  const tabClass = (tabName) => `btn ${activeTab === tabName ? 'btn-danger' : 'btn-outline-danger'}`;
  const [melding, setMelding] = useState('');
  const [loadingToegang, setLoadingToegang] = useState(typeof heeftGevalideerdeOvereenkomst !== 'boolean');
  const [lokaleOvereenkomstStatus, setLokaleOvereenkomstStatus] = useState(false);

  const heeftOvereenkomst = typeof heeftGevalideerdeOvereenkomst === 'boolean'
    ? heeftGevalideerdeOvereenkomst
    : lokaleOvereenkomstStatus;

  useEffect(() => {
    if (typeof heeftGevalideerdeOvereenkomst === 'boolean') {
      setLoadingToegang(false);
      return;
    }

    let actief = true;

    getMijnStages()
      .then((data) => {
        if (!actief) return;
        const stages = data?.stages || [];
        const heeftGevalideerd = stages.some((stage) => stage.overeenkomst_status?.toLowerCase() === 'gevalideerd');
        setLokaleOvereenkomstStatus(heeftGevalideerd);
      })
      .catch(() => {
        if (!actief) return;
        setLokaleOvereenkomstStatus(false);
      })
      .finally(() => {
        if (!actief) return;
        setLoadingToegang(false);
      });

    return () => {
      actief = false;
    };
  }, [heeftGevalideerdeOvereenkomst]);

  useEffect(() => {
    const doorgestuurdeMelding = location.state?.toegangMelding;
    if (doorgestuurdeMelding) {
      setMelding(doorgestuurdeMelding);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    if (loadingToegang || heeftOvereenkomst) {
      return;
    }

    const tabIsGelocked = activeTab === 'logboeken' || activeTab === 'evaluaties';
    if (tabIsGelocked) {
      navigate('/student/stagevoorstellen', {
        replace: true,
        state: { toegangMelding: toegangMeldingTekst },
      });
    }
  }, [activeTab, heeftOvereenkomst, loadingToegang, navigate]);

  const toonToegangMelding = () => {
    setMelding(toegangMeldingTekst);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at top right, rgba(220, 53, 69, 0.18), transparent 40%), linear-gradient(180deg, #fff7f7 0%, #ffe9ec 100%)',
      }}
    >
      <div className="container py-5">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div>
            <p className="text-uppercase text-danger mb-1 small">Student portaal</p>
            <h1 className="mb-1">{title}</h1>
            <p className="text-secondary mb-0">{subtitle}</p>
          </div>
          <div className="d-flex align-items-center gap-3">
            <div className="text-end">
              <div className="fw-semibold">{user?.naam || 'Student'}</div>
              <div className="text-secondary small">{user?.email}</div>
            </div>
            <button type="button" className="btn btn-outline-secondary" onClick={() => window.location.reload()}>
              Refresh
            </button>
            <button type="button" className="btn btn-outline-dark" onClick={onLogout}>
              Uitloggen
            </button>
          </div>
        </div>

        <div className="d-flex flex-wrap gap-2 mb-4">
          <Link className={tabClass('stagevoorstellen')} to="/student/stagevoorstellen">
            Stagevoorstellen
          </Link>

          {loadingToegang || heeftOvereenkomst ? (
            <>
              <Link className={tabClass('logboeken')} to="/student/logboeken">
                Logboeken
              </Link>
              <Link className={tabClass('evaluaties')} to="/student/evaluaties">
                Evaluaties
              </Link>
            </>
          ) : (
            <>
              <button type="button" className="btn btn-outline-secondary" onClick={toonToegangMelding}>
                Logboeken
              </button>
              <button type="button" className="btn btn-outline-secondary" onClick={toonToegangMelding}>
                Evaluaties
              </button>
            </>
          )}
        </div>

        {melding && (
          <div className="alert alert-warning" role="alert">
            {melding}
          </div>
        )}

        {children}
      </div>
    </div>
  );
}

export default StudentShell;
