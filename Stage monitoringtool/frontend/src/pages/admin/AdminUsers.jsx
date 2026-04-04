import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const roleOptions = ['student', 'commissie', 'docent', 'mentor', 'admin'];

const noticeTimeout = 3000;

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortMode, setSortMode] = useState('role-asc');
  const [notice, setNotice] = useState({ type: '', text: '' });
  const { user, logout } = useAuth();

  const showNotice = (type, text) => {
    setNotice({ type, text });
    window.clearTimeout(showNotice.timeoutId);
    showNotice.timeoutId = window.setTimeout(() => {
      setNotice({ type: '', text: '' });
    }, noticeTimeout);
  };

  const loadUsers = async () => {
    try {
      const response = await api.get('/users');
      const fetchedUsers = response.data.users;
      setUsers(fetchedUsers);
      setDrafts(
        fetchedUsers.reduce((accumulator, currentUser) => {
          accumulator[currentUser.id] = {
            naam: currentUser.naam,
            rol: currentUser.rol
          };
          return accumulator;
        }, {})
      );
    } catch (requestError) {
      showNotice('danger', requestError.response?.data?.error || 'Gebruikers konden niet worden geladen');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();

    return () => {
      window.clearTimeout(showNotice.timeoutId);
    };
  }, []);

  const updateUser = async (id, payload) => {
    setSavingId(id);

    try {
      await api.patch(`/users/${id}`, payload);
      showNotice('success', 'Gebruiker bijgewerkt');
      await loadUsers();
    } catch (requestError) {
      showNotice('danger', requestError.response?.data?.error || 'Gebruiker kon niet worden bijgewerkt');
    } finally {
      setSavingId(null);
    }
  };

  const deleteUser = async (id) => {
    const confirmed = window.confirm('Weet je zeker dat je deze gebruiker wilt verwijderen?');
    if (!confirmed) return;

    setDeletingId(id);

    try {
      await api.delete(`/users/${id}`);
      showNotice('success', 'Gebruiker verwijderd');
      await loadUsers();
    } catch (requestError) {
      showNotice('danger', requestError.response?.data?.error || 'Gebruiker kon niet worden verwijderd');
    } finally {
      setDeletingId(null);
    }
  };

  const updateDraft = (id, field, value) => {
    setDrafts((currentDrafts) => ({
      ...currentDrafts,
      [id]: {
        ...currentDrafts[id],
        [field]: value
      }
    }));
  };

  const hasChanges = (account) => {
    const draft = drafts[account.id];
    if (!draft) return false;

    const changedName = draft.naam.trim() !== account.naam;
    const changedRole = draft.rol !== account.rol;
    return changedName || changedRole;
  };

  const saveChanges = async (account) => {
    const draft = drafts[account.id];
    if (!draft) return;

    const payload = {};
    const trimmedName = draft.naam.trim();

    if (trimmedName !== account.naam) {
      payload.naam = trimmedName;
    }

    if (draft.rol !== account.rol) {
      payload.rol = draft.rol;
    }

    if (Object.keys(payload).length === 0) {
      showNotice('info', 'Geen wijzigingen om op te slaan');
      return;
    }

    await updateUser(account.id, payload);
  };

  const filteredAndSortedUsers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    const filteredUsers = users.filter((account) => {
      if (!query) return true;
      return (
        account.naam.toLowerCase().includes(query) ||
        account.email.toLowerCase().includes(query)
      );
    });

    return [...filteredUsers].sort((left, right) => {
      if (sortMode === 'name-asc') {
        return left.naam.localeCompare(right.naam, 'nl');
      }

      if (sortMode === 'name-desc') {
        return right.naam.localeCompare(left.naam, 'nl');
      }

      if (sortMode === 'role-desc') {
        const roleComparison = right.rol.localeCompare(left.rol, 'nl');
        return roleComparison !== 0 ? roleComparison : left.naam.localeCompare(right.naam, 'nl');
      }

      const roleComparison = left.rol.localeCompare(right.rol, 'nl');
      return roleComparison !== 0 ? roleComparison : left.naam.localeCompare(right.naam, 'nl');
    });
  }, [searchTerm, sortMode, users]);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)' }}>
      <div className="container py-5">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div>
            <p className="text-uppercase text-secondary mb-1 small">Admin dashboard</p>
            <h1 className="mb-1">Gebruikersbeheer</h1>
            <p className="text-secondary mb-0">Pas namen en rollen aan, zoek gebruikers en verwijder accounts.</p>
          </div>
          <div className="d-flex align-items-center gap-3">
            <div className="text-end">
              <div className="fw-semibold">{user?.naam || 'Admin'}</div>
              <div className="text-secondary small">{user?.email}</div>
            </div>
            <button type="button" className="btn btn-outline-dark" onClick={logout}>
              Uitloggen
            </button>
          </div>
        </div>

        <div className="d-flex flex-wrap gap-2 mb-4">
          <Link className="btn btn-dark" to="/admin/users">
            Gebruikersbeheer
          </Link>
          <Link className="btn btn-outline-dark" to="/admin/users/new">
            Gebruiker toevoegen
          </Link>
        </div>

        {notice.text && <div className={`alert alert-${notice.type}`}>{notice.text}</div>}

        <div className="card shadow-sm border-0">
          <div className="card-body p-4">
            <div className="d-flex flex-column flex-lg-row justify-content-between gap-3 align-items-lg-center mb-3">
              <div>
                <h2 className="h4 mb-1">Alle gebruikers</h2>
                <div className="text-secondary">Zoek op naam of e-mail en sorteer op rol of naam.</div>
              </div>
              <span className="badge text-bg-dark align-self-start align-self-lg-center">{filteredAndSortedUsers.length} accounts</span>
            </div>

            <div className="row g-3 mb-4">
              <div className="col-12 col-lg-7">
                <label className="form-label">Zoeken</label>
                <input
                  type="search"
                  className="form-control"
                  placeholder="Zoek op naam of e-mail"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </div>
              <div className="col-12 col-lg-5">
                <label className="form-label">Sorteren</label>
                <select
                  className="form-select"
                  value={sortMode}
                  onChange={(event) => setSortMode(event.target.value)}
                >
                  <option value="role-asc">Rol A-Z</option>
                  <option value="role-desc">Rol Z-A</option>
                  <option value="name-asc">Naam A-Z</option>
                  <option value="name-desc">Naam Z-A</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="text-secondary">Gebruikers laden...</div>
            ) : (
              <div className="table-responsive">
                <table className="table align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Naam</th>
                      <th>E-mail</th>
                      <th>Rol</th>
                      <th>Eerste login</th>
                      <th>Aangemaakt</th>
                      <th>Acties</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAndSortedUsers.map((account) => (
                      <tr key={account.id}>
                        {(() => {
                          const draft = drafts[account.id] || {
                            naam: account.naam,
                            rol: account.rol
                          };
                          const rowHasChanges = hasChanges(account);

                          return (
                            <>
                        <td style={{ minWidth: '220px' }}>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            value={draft.naam}
                            onChange={(event) => {
                              updateDraft(account.id, 'naam', event.target.value);
                            }}
                            disabled={savingId === account.id}
                          />
                        </td>
                        <td>{account.email}</td>
                        <td style={{ minWidth: '180px' }}>
                          <select
                            className="form-select form-select-sm"
                            value={draft.rol}
                            onChange={(event) => {
                              updateDraft(account.id, 'rol', event.target.value);
                            }}
                            disabled={savingId === account.id}
                          >
                            {roleOptions.map((role) => (
                              <option key={role} value={role}>
                                {role}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>{account.eerste_login ? 'Ja' : 'Nee'}</td>
                        <td>{new Date(account.aangemaakt_op).toLocaleDateString('nl-BE')}</td>
                        <td>
                          <div className="d-flex flex-column gap-2">
                          <button
                            type="button"
                            className="btn btn-sm btn-primary"
                            onClick={() => saveChanges(account)}
                            disabled={!rowHasChanges || savingId === account.id}
                          >
                            {savingId === account.id ? 'Opslaan...' : 'Aanpassingen opslaan'}
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => deleteUser(account.id)}
                            disabled={deletingId === account.id || savingId === account.id}
                          >
                            {deletingId === account.id ? 'Verwijderen...' : 'Verwijderen'}
                          </button>
                          </div>
                        </td>
                            </>
                          );
                        })()}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}