// Laadt het juiste dashboard op basis van de rol van de gebruiker

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CommissieDashboard from './commissie/CommissieDashboard';
import DocentDashboard from './docent/DocentDashboard';
import MentorDashboard from './mentor/MentorDashboard';
import { useAuth } from '../context/AuthContext';

function Dashboard() {
    const { user: gebruiker, logout } = useAuth();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [laden, setLaden] = useState(true);
    const [fout, setFout] = useState(null);

    const handleLogout = async () => {
        await logout();
        navigate('/login', { replace: true });
    };

    useEffect(() => {
        if (!gebruiker?.rol) {
            return;
        }

        fetch(`http://localhost:3000/dashboard/${gebruiker.rol}`, {
            credentials: 'include'
        })
            .then(async (res) => {
                const responseBody = await res.json();
                if (!res.ok) {
                    throw new Error(responseBody.fout || responseBody.message || 'Kon dashboard data niet laden');
                }
                return responseBody;
            })
            .then((responseData) => {
                setData(responseData);
                setLaden(false);
            })
            .catch((error) => {
                setFout(error.message || 'Kon data niet laden');
                setLaden(false);
            });
    }, [gebruiker?.rol]);

    if (laden) {
        return (
            <div className="container mt-4 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Laden...</span>
                </div>
            </div>
        );
    }

    if (fout) {
        return (
            <div className="container mt-4">
                <div className="alert alert-danger">{fout}</div>
            </div>
        );
    }

    return (
        <div>
            <nav className="navbar navbar-dark bg-primary">
                <div className="container">
                    <span className="navbar-brand">Stage Monitoring Tool</span>
                    <div className="d-flex align-items-center gap-3">
                        <span className="text-white">
                            Ingelogd als: <strong>{gebruiker.naam}</strong> ({gebruiker.rol})
                        </span>
                        <button type="button" className="btn btn-outline-light btn-sm" onClick={handleLogout}>
                            Uitloggen
                        </button>
                    </div>
                </div>
            </nav>

            {gebruiker.rol === 'commissie' && <CommissieDashboard data={data} />}
            {gebruiker.rol === 'docent' && <DocentDashboard data={data} />}
            {gebruiker.rol === 'mentor' && <MentorDashboard data={data} />}
        </div>
    );
}

export default Dashboard;