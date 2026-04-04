import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
    const { user, updateUser } = useAuth();
    const [bookmarks, setBookmarks] = useState([]);
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({ name: '', phone: '' });
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        if (user) {
            setForm({ name: user.name, phone: user.phone || '' });
            fetchBookmarks();
        }
    }, [user]);

    const fetchBookmarks = async () => {
        try {
            const res = await api.get('/bookmarks');
            setBookmarks(res.data.bookmarks);
        } catch (err) {
            console.error('Failed to fetch bookmarks');
        }
        setLoading(false);
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            const res = await api.put('/auth/profile', form);
            updateUser({ ...user, name: res.data.user.name, phone: res.data.user.phone });
            setSuccess('Profile updated successfully!');
            setEditing(false);
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile');
        }
    };

    const removeBookmark = async (paperId) => {
        try {
            await api.post('/bookmarks/toggle', { paperId });
            setBookmarks(prev => prev.filter(b => b.paperId?._id !== paperId));
        } catch (err) {
            console.error('Failed to remove bookmark');
        }
    };

    const getPdfUrl = (filename) => `/api/papers/view/${filename}`;

    if (!user) return <div className="loading">Loading...</div>;

    return (
        <div className="container">
            <div className="profile-layout">
                {/* Profile Sidebar */}
                <div className="profile-sidebar">
                    <div className="profile-avatar-section">
                        <div className="profile-avatar-lg">
                            {user.name[0].toUpperCase()}
                        </div>
                        <h2>{user.name}</h2>
                        <span className={`profile-role-badge role-${user.role}`}>
                            {user.role === 'student' ? '🎓' : user.role === 'teacher' ? '👩‍🏫' : '🛡️'} {user.role}
                        </span>
                    </div>
                    <div className="profile-nav">
                        <button className={`profile-nav-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
                            📋 Overview
                        </button>
                        <button className={`profile-nav-btn ${activeTab === 'bookmarks' ? 'active' : ''}`} onClick={() => setActiveTab('bookmarks')}>
                            🔖 Saved Papers ({bookmarks.length})
                        </button>
                        <button className={`profile-nav-btn ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
                            ⚙️ Settings
                        </button>
                    </div>
                </div>

                {/* Profile Content */}
                <div className="profile-content">
                    {success && <div className="alert alert-success">✅ {success}</div>}
                    {error && <div className="alert alert-error">⚠️ {error}</div>}

                    {activeTab === 'overview' && (
                        <div className="profile-section">
                            <h3>👤 Account Information</h3>
                            <div className="profile-info-grid">
                                <div className="profile-info-item">
                                    <span className="profile-info-label">Full Name</span>
                                    <span className="profile-info-value">{user.name}</span>
                                </div>
                                <div className="profile-info-item">
                                    <span className="profile-info-label">Email</span>
                                    <span className="profile-info-value">{user.email}</span>
                                </div>
                                <div className="profile-info-item">
                                    <span className="profile-info-label">Phone</span>
                                    <span className="profile-info-value">{user.phone ? `+91 ${user.phone}` : 'Not set'}</span>
                                </div>
                                <div className="profile-info-item">
                                    <span className="profile-info-label">Role</span>
                                    <span className="profile-info-value" style={{ textTransform: 'capitalize' }}>{user.role}</span>
                                </div>
                            </div>
                            <div className="profile-stats-row">
                                <div className="profile-stat">
                                    <span className="profile-stat-num">{bookmarks.length}</span>
                                    <span className="profile-stat-label">Saved Papers</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'bookmarks' && (
                        <div className="profile-section">
                            <h3>🔖 Saved Papers</h3>
                            {loading ? (
                                <div className="loading">Loading bookmarks...</div>
                            ) : bookmarks.length === 0 ? (
                                <div className="empty-state">
                                    <span className="empty-icon">📑</span>
                                    <h3>No saved papers yet</h3>
                                    <p>When you bookmark papers, they'll appear here for quick access.</p>
                                    <Link to="/" className="btn btn-primary" style={{ marginTop: '16px' }}>Browse Papers</Link>
                                </div>
                            ) : (
                                <div className="bookmarks-list">
                                    {bookmarks.map(b => (
                                        b.paperId && (
                                            <div key={b._id} className="bookmark-card">
                                                <div className="bookmark-info">
                                                    <h4>{b.paperId.subject}</h4>
                                                    <div className="bookmark-meta">
                                                        <span className="tag">🏛️ {b.paperId.universityId?.name || 'Unknown'}</span>
                                                        <span className="tag">📅 {b.paperId.year}</span>
                                                        {b.paperId.semester && <span className="tag">📘 {b.paperId.semester}</span>}
                                                        <span className="tag">📋 {b.paperId.examType}</span>
                                                    </div>
                                                </div>
                                                <div className="bookmark-actions">
                                                    {b.paperId.paperFile && (
                                                        <a href={getPdfUrl(b.paperId.paperFile)} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-primary">
                                                            👁️ View
                                                        </a>
                                                    )}
                                                    <button className="btn btn-sm btn-danger" onClick={() => removeBookmark(b.paperId._id)}>
                                                        🗑️ Remove
                                                    </button>
                                                </div>
                                            </div>
                                        )
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="profile-section">
                            <h3>⚙️ Edit Profile</h3>
                            <form onSubmit={handleProfileUpdate}>
                                <div className="form-group">
                                    <label>Full Name</label>
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value.replace(/[^A-Za-z\s]/g, '') })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Phone Number</label>
                                    <div className="phone-input-wrap">
                                        <span className="phone-prefix">+91</span>
                                        <input
                                            type="tel"
                                            value={form.phone}
                                            onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/[^0-9]/g, '').slice(0, 10) })}
                                            placeholder="10-digit mobile number"
                                            style={{ paddingLeft: '52px' }}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input type="email" value={user.email} disabled className="input-disabled" />
                                    <span className="field-hint">Email cannot be changed</span>
                                </div>
                                <button type="submit" className="btn btn-primary">💾 Save Changes</button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
