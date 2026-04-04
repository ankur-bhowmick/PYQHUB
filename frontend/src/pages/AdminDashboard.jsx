import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ totalUsers: 0, totalUniversities: 0, totalPapers: 0, totalContacts: 0, totalDownloads: 0 });
    const [contacts, setContacts] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        try {
            const [usersRes, unisRes, papersRes, contactsRes] = await Promise.all([
                api.get('/auth/users'),
                api.get('/universities'),
                api.get('/papers/stats'),
                api.get('/contacts')
            ]);
            setStats({
                totalUsers: usersRes.data.users.length,
                totalUniversities: unisRes.data.universities.length,
                totalPapers: papersRes.data.stats.totalPapers,
                totalContacts: contactsRes.data.contacts.length,
                totalDownloads: papersRes.data.stats.totalDownloads || 0
            });
            setContacts(contactsRes.data.contacts.slice(0, 5));
            setUsers(usersRes.data.users.slice(0, 10));
        } catch (err) {
            console.error('Failed to fetch stats');
        }
        setLoading(false);
    };

    const updateStatus = async (id, status) => {
        try {
            await api.put(`/contacts/${id}`, { status });
            fetchAll();
        } catch (err) { console.error('Failed'); }
    };

    const deleteContact = async (id) => {
        if (!window.confirm('Delete this message?')) return;
        try {
            await api.delete(`/contacts/${id}`);
            fetchAll();
        } catch (err) { console.error('Failed'); }
    };

    if (loading) return <div className="loading">Loading dashboard...</div>;

    return (
        <div className="container">
            <div className="page-header">
                <h1>🛠️ Admin Dashboard</h1>
                <p>Manage universities, papers, and user messages</p>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <span className="stat-icon">👥</span>
                    <h3>{stats.totalUsers}</h3>
                    <p>Total Users</p>
                </div>
                <div className="stat-card">
                    <span className="stat-icon">🏛️</span>
                    <h3>{stats.totalUniversities}</h3>
                    <p>Universities</p>
                </div>
                <div className="stat-card">
                    <span className="stat-icon">📄</span>
                    <h3>{stats.totalPapers}</h3>
                    <p>Papers</p>
                </div>
                <div className="stat-card">
                    <span className="stat-icon">📥</span>
                    <h3>{stats.totalDownloads}</h3>
                    <p>Downloads</p>
                </div>
                <div className="stat-card">
                    <span className="stat-icon">📩</span>
                    <h3>{stats.totalContacts}</h3>
                    <p>Messages</p>
                </div>
            </div>

            <div className="admin-actions">
                <Link to="/admin/universities" className="btn btn-primary">🏛️ Manage Universities</Link>
                <Link to="/admin/papers" className="btn btn-primary">📄 Manage Papers</Link>
            </div>

            {/* Recent Users */}
            <div className="section-card">
                <h3>👥 Recent Users</h3>
                {users.length === 0 ? (
                    <p className="muted">No users yet</p>
                ) : (
                    <div className="papers-table-wrap">
                        <table className="papers-table">
                            <thead>
                                <tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Joined</th></tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u._id}>
                                        <td><strong style={{ color: 'var(--text-primary)' }}>{u.name}</strong></td>
                                        <td>{u.email}</td>
                                        <td>{u.phone ? `+91 ${u.phone}` : '—'}</td>
                                        <td><span className={`badge ${u.role === 'admin' ? 'badge-danger' : u.role === 'teacher' ? 'badge-warning' : ''}`}>{u.role}</span></td>
                                        <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Recent Messages */}
            <div className="section-card">
                <h3>📩 Recent Messages</h3>
                {contacts.length === 0 ? (
                    <p className="muted">No messages yet</p>
                ) : (
                    <div className="papers-table-wrap">
                        <table className="papers-table">
                            <thead>
                                <tr><th>From</th><th>Subject</th><th>Status</th><th>Actions</th></tr>
                            </thead>
                            <tbody>
                                {contacts.map(c => (
                                    <tr key={c._id}>
                                        <td>
                                            <strong>{c.userId?.name}</strong>
                                            <br /><small>{c.userId?.email}</small>
                                            {c.userId?.phone && <><br /><small>📞 +91 {c.userId.phone}</small></>}
                                        </td>
                                        <td>{c.subject}<br /><small className="muted">{c.message.substring(0, 60)}...</small></td>
                                        <td><span className={`badge ${c.status === 'resolved' ? 'badge-success' : 'badge-warning'}`}>{c.status}</span></td>
                                        <td className="action-btns">
                                            {c.status === 'pending' && <button onClick={() => updateStatus(c._id, 'resolved')} className="btn btn-sm btn-success">✓ Resolve</button>}
                                            <button onClick={() => deleteContact(c._id)} className="btn btn-sm btn-danger">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
