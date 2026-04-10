import { useNavigate } from 'react-router-dom';

function CommissieDashboard({ data }) {

  const navigate = useNavigate();

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Ingediende Stagevoorstellen</h2>

      <div className="card">
        <div className="card-header bg-warning d-flex justify-content-between align-items-center">
          Alle Voorstellen
        

       {/*Knop nr volledig overzicht */}
          <button className="btn btn-dark btn-sm" onClick={() => navigate('/commissie/stages')}>
            Bekijk overzicht
          </button>
 </div>

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
                    <td>{new Date(voorstel.start_datum).toLocaleDateString('nl-BE')} - {new Date(voorstel.eind_datum).toLocaleDateString('nl-BE')}</td>
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