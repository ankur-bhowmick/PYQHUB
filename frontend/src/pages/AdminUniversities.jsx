import { useState, useEffect } from 'react';
import api from '../utils/api';

const AdminUniversities = () => {
    const [universities, setUniversities] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState({ name: '', location: '', description: '', syllabusTypes: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchUniversities(); }, []);

    const fetchUniversities = async () => {
        try {
            const res = await api.get('/universities');
            setUniversities(res.data.universities);
        } catch (err) { console.error('Failed'); }
        setLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (editId) {
                const submitData = {
                    ...form,
                    syllabusTypes: form.syllabusTypes
                        .split(',')
                        .map(s => s.trim())
                        .filter(Boolean)
                };
                await api.put(`/universities/${editId}`, submitData);
            } else {
                const submitData = {
                    ...form,
                    syllabusTypes: form.syllabusTypes
                        .split(',')
                        .map(s => s.trim())
                        .filter(Boolean)
                };
                await api.post('/universities', submitData);
            }
            setForm({ name: '', location: '', description: '', syllabusTypes: '' });
            setEditId(null);
            setShowForm(false);
            fetchUniversities();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed');
        }
    };

    const handleEdit = (uni) => {
        setForm({ name: uni.name, location: uni.location, description: uni.description || '', syllabusTypes: (uni.syllabusTypes || []).join(', ') });
        setEditId(uni._id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this university and ALL its papers?')) return;
        try {
            await api.delete(`/universities/${id}`);
            fetchUniversities();
        } catch (err) { console.error('Failed'); }
    };

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div className="container">
            <div className="page-header-row">
                <div>
                    <h1>🏛️ Manage Universities</h1>
                    <p>Add, edit, or remove universities</p>
                </div>
                <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ name: '', location: '', description: '', syllabusTypes: '' }); }}>
                    {showForm ? '✕ Cancel' : '+ Add University'}
                </button>
            </div>

            {showForm && (
                <div className="section-card form-card">
                    <h3>{editId ? 'Edit University' : 'Add New University'}</h3>
                    {error && <div className="alert alert-error">{error}</div>}
                    <form onSubmit={handleSubmit}>
                        <div className="form-row">
                            <div className="form-group">
                                <label>University Name</label>
                                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Calcutta University" required />
                            </div>
                            <div className="form-group">
                                <label>Location</label>
                                <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. Kolkata, West Bengal" required />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Description (optional)</label>
                            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief description of the university..." rows="2" />
                        </div>
                        <div className="form-group">
                            <label>📋 Syllabus Types</label>
                            <input type="text" value={form.syllabusTypes} onChange={(e) => setForm({ ...form, syllabusTypes: e.target.value })} placeholder="e.g. NEP, CBCS" />
                            <span className="field-hint">Comma-separated list of syllabus types available at this university (e.g. NEP, CBCS, CCF)</span>
                        </div>
                        <button type="submit" className="btn btn-primary">{editId ? 'Update' : 'Add'} University</button>
                    </form>
                </div>
            )}

            {universities.length === 0 ? (
                <div className="empty-state"><h3>No universities added yet</h3></div>
            ) : (
                <div className="papers-table-wrap">
                    <table className="papers-table">
                        <thead>
                            <tr><th>Name</th><th>Location</th><th>Syllabus</th><th>Papers</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            {universities.map(uni => (
                                <tr key={uni._id}>
                                    <td><strong>{uni.name}</strong></td>
                                    <td>{uni.location}</td>
                                    <td>
                                        {uni.syllabusTypes && uni.syllabusTypes.length > 0 ? (
                                            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                                {uni.syllabusTypes.map(st => (
                                                    <span key={st} className="badge" style={{ background: 'var(--accent)', color: '#fff', fontSize: '11px' }}>{st}</span>
                                                ))}
                                            </div>
                                        ) : '—'}
                                    </td>
                                    <td>{uni.paperCount || 0}</td>
                                    <td className="action-btns">
                                        <button onClick={() => handleEdit(uni)} className="btn btn-sm btn-outline">Edit</button>
                                        <button onClick={() => handleDelete(uni._id)} className="btn btn-sm btn-danger">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminUniversities;
