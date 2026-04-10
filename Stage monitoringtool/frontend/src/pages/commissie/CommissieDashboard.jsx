import { useNavigate } from 'react-router-dom';

function CommissieDashboard({ data }) {

  const navigate = useNavigate();

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Ingediende Stagevoorstellen</h2>

      <div className="card">
        <div className="card-header bg-warning d-flex justify-content-between align-items-center">
          Alle Voorstellen
        </div>

       {/*Knop nr volledig overzicht */}
          <button className="btn btn-dark btn-sm" onClick={() => navigate('/commissie/stages')}>
            Bekijk overzicht
          </button>


        <div className="card-body">
          {data.voorstellen.length === 0 ? (
            <p>Geen voorstellen ingediend.</p>
          ) : (
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Bedrijf</th>
                  <th>Periode</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.voorstellen.map((voorstel) => (
                  <tr key={voorstel.id}>
                    <td>{voorstel.student_naam}</td>
                    <td>{voorstel.bedrijf_naam}</td>
                    <td>{voorstel.start_datum} - {voorstel.eind_datum}</td>
                    <td>
                      <span className="badge bg-warning text-dark">
                        {voorstel.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default CommissieDashboard;