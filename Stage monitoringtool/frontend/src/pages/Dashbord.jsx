// Laadt het juiste dashboard op basis van de rol van de gebruiker

import { useEffect, useState } from 'react';
import StudentDashboard from '../components/studentdashboard';
import CommissieDashboard from '../components/commissieDashboard';
import DocentDashboard from '../components/DocentDashboard';
import MentorDashboard from '../components/mentorDashboard';
import AdminDashboard from '../components/adminDashboard';

function Dashboard({ gebruiker }) {
    const [data, setData] = useState(null);
    const [laden, setLaden] = useState(true);
    const [fout, setFout] = useState(null);

    useEffect(() => {
        fetch(`http://localhost:3000/dashboard/${gebruiker.rol}`, {
            credentials: 'include'
        })
            .then(res => res.json())
            .then(data => {
                setData(data);
                setLaden(false);
            })
            .catch(() => {
                setFout('Kon data niet laden');
                setLaden(false);
            });
    }, [gebruiker.rol]);

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
                    <span className="text-white">
                        Ingelogd als: <strong>{gebruiker.naam}</strong> ({gebruiker.rol})
                    </span>
                </div>
            </nav>

            {gebruiker.rol === 'student' && <StudentDashboard data={data} />}
            {gebruiker.rol === 'commissie' && <CommissieDashboard data={data} />}
            {gebruiker.rol === 'docent' && <DocentDashboard data={data} />}
            {gebruiker.rol === 'mentor' && <MentorDashboard data={data} />}
            {gebruiker.rol === 'admin' && <AdminDashboard data={data} />}
        </div>
    );
}

export default Dashboard;