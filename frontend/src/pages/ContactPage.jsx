import { useState } from 'react';
import api from '../utils/api';

const ContactPage = () => {
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);
        try {
            await api.post('/contacts', { subject, message });
            setSuccess('Message sent successfully! We will get back to you soon.');
            setSubject('');
            setMessage('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send message');
        }
        setLoading(false);
    };

    return (
        <div className="container">
            <div className="page-header">
                <h1>📩 Contact Us</h1>
                <p>Have a question, suggestion, or need help? Send us a message!</p>
            </div>

            <div className="contact-layout">
                <div className="contact-info-cards">
                    <div className="info-card">
                        <span className="info-icon">📧</span>
                        <h4>Email</h4>
                        <p>support@pyqportal.com</p>
                    </div>
                    <div className="info-card">
                        <span className="info-icon">📍</span>
                        <h4>Location</h4>
                        <p>Kolkata, West Bengal, India</p>
                    </div>
                    <div className="info-card">
                        <span className="info-icon">🕐</span>
                        <h4>Response Time</h4>
                        <p>Within 24 hours</p>
                    </div>
                </div>

                <div className="contact-form-card">
                    <h3>Send a Message</h3>
                    {error && <div className="alert alert-error">{error}</div>}
                    {success && <div className="alert alert-success">{success}</div>}
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Subject</label>
                            <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="What's this about?" required />
                        </div>
                        <div className="form-group">
                            <label>Message</label>
                            <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Write your message here..." rows="5" required />
                        </div>
                        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                            {loading ? 'Sending...' : '📨 Send Message'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
