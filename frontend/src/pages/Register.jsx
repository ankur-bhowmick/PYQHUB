import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('student');
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { register, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) navigate('/');
    }, [user]);

    const validateEmail = (email) => {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email);
    };

    const validatePhone = (phone) => {
        const cleaned = phone.replace(/[\s\-\(\)]/g, '');
        return /^[6-9]\d{9}$/.test(cleaned);
    };

    const handlePhoneChange = (e) => {
        const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
        setPhone(value);
        if (value.length === 10 && !validatePhone(value)) {
            setFieldErrors(prev => ({ ...prev, phone: 'Phone must start with 6-9' }));
        } else {
            setFieldErrors(prev => ({ ...prev, phone: '' }));
        }
    };

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
        if (e.target.value && !validateEmail(e.target.value)) {
            setFieldErrors(prev => ({ ...prev, email: 'Enter a valid email address' }));
        } else {
            setFieldErrors(prev => ({ ...prev, email: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Validate name
        if (!/^[A-Za-z\s]+$/.test(name.trim())) {
            setError('Name can only contain letters and spaces.');
            setLoading(false);
            return;
        }
        if (name.trim().length < 2) {
            setError('Name must be at least 2 characters.');
            setLoading(false);
            return;
        }

        // Validate email
        if (!validateEmail(email)) {
            setError('Please enter a valid email address.');
            setLoading(false);
            return;
        }

        // Validate phone
        if (!validatePhone(phone)) {
            setError('Please enter a valid 10-digit phone number starting with 6-9.');
            setLoading(false);
            return;
        }

        // Validate password
        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            setLoading(false);
            return;
        }

        // Confirm password
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            setLoading(false);
            return;
        }

        const result = await register(name, email, phone, password, role);
        if (!result.success) setError(result.message);
        setLoading(false);
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-header">
                    <span className="auth-icon">📝</span>
                    <h2>Create Account</h2>
                    <p>Register to browse question papers</p>
                </div>
                {error && <div className="alert alert-error">⚠️ {error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Full Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value.replace(/[^A-Za-z\s]/g, ''))}
                            placeholder="Enter your full name"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={handleEmailChange}
                            placeholder="yourname@example.com"
                            required
                            className={fieldErrors.email ? 'input-error' : ''}
                        />
                        {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
                    </div>
                    <div className="form-group">
                        <label>Phone Number</label>
                        <div className="phone-input-wrap">
                            <span className="phone-prefix">+91</span>
                            <input
                                type="tel"
                                value={phone}
                                onChange={handlePhoneChange}
                                placeholder="10-digit mobile number"
                                required
                                className={fieldErrors.phone ? 'input-error' : ''}
                                style={{ paddingLeft: '52px' }}
                            />
                        </div>
                        {fieldErrors.phone && <span className="field-error">{fieldErrors.phone}</span>}
                        {phone.length > 0 && phone.length < 10 && (
                            <span className="field-hint">{10 - phone.length} digits remaining</span>
                        )}
                        {phone.length === 10 && validatePhone(phone) && (
                            <span className="field-success">✓ Valid phone number</span>
                        )}
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <div className="password-wrap">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Minimum 6 characters"
                                required
                            />
                            <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? '🙈' : '👁️'}
                            </button>
                        </div>
                        {password.length > 0 && password.length < 6 && (
                            <span className="field-error">Password must be at least 6 characters</span>
                        )}
                    </div>
                    <div className="form-group">
                        <label>Confirm Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Re-enter your password"
                            required
                        />
                        {confirmPassword && password !== confirmPassword && (
                            <span className="field-error">Passwords do not match</span>
                        )}
                        {confirmPassword && password === confirmPassword && confirmPassword.length >= 6 && (
                            <span className="field-success">✓ Passwords match</span>
                        )}
                    </div>
                    <div className="form-group">
                        <label>I am a</label>
                        <div className="role-selector">
                            <button type="button" className={`role-btn ${role === 'student' ? 'active' : ''}`} onClick={() => setRole('student')}>🎓 Student</button>
                            <button type="button" className={`role-btn ${role === 'teacher' ? 'active' : ''}`} onClick={() => setRole('teacher')}>👩‍🏫 Teacher</button>
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                        {loading ? 'Creating Account...' : '🚀 Create Account'}
                    </button>
                </form>
                <p className="auth-footer">Already have an account? <Link to="/login">Login here</Link></p>
            </div>
        </div>
    );
};

export default Register;
