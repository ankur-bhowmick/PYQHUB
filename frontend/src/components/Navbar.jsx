import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        setMenuOpen(false);
        navigate('/login');
    };

    const closeMenu = () => setMenuOpen(false);

    const isActive = (path) => location.pathname === path ? 'nav-link active' : 'nav-link';

    return (
        <nav className="navbar">
            <div className="nav-container">
                <Link to="/" className="nav-brand" onClick={closeMenu}>
                    <span className="nav-icon">📚</span>
                    <span className="nav-title">PYQHUB</span>
                </Link>

                <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
                    <span className={`hamburger-line ${menuOpen ? 'open' : ''}`}></span>
                    <span className={`hamburger-line ${menuOpen ? 'open' : ''}`}></span>
                    <span className={`hamburger-line ${menuOpen ? 'open' : ''}`}></span>
                </button>

                <div className={`nav-links ${menuOpen ? 'nav-open' : ''}`}>
                    <Link to="/" className={isActive('/')} onClick={closeMenu}>🏠 Home</Link>
                    <Link to="/ratings" className={isActive('/ratings')} onClick={closeMenu}>⭐ Ratings</Link>

                    {user ? (
                        <>
                            {user.role !== 'admin' && (
                                <Link to="/contact" className={isActive('/contact')} onClick={closeMenu}>📩 Contact</Link>
                            )}
                            {user.role === 'admin' && (
                                <>
                                    <Link to="/admin/dashboard" className={isActive('/admin/dashboard')} onClick={closeMenu}>📊 Dashboard</Link>
                                    <Link to="/admin/universities" className={isActive('/admin/universities')} onClick={closeMenu}>🏛️ Universities</Link>
                                    <Link to="/admin/papers" className={isActive('/admin/papers')} onClick={closeMenu}>📄 Papers</Link>
                                </>
                            )}

                            <div className="nav-divider"></div>

                            <Link to="/profile" className="nav-user-link" onClick={closeMenu}>
                                <span className="nav-avatar">{user.name[0].toUpperCase()}</span>
                                <div className="nav-user-info">
                                    <span className="nav-username">{user.name}</span>
                                    <span className="nav-role">{user.role}</span>
                                </div>
                            </Link>
                            <button onClick={handleLogout} className="btn btn-sm btn-outline nav-logout-btn">Logout</button>
                        </>
                    ) : (
                        <>
                            <div className="nav-divider"></div>
                            <Link to="/login" className="btn btn-sm btn-outline" onClick={closeMenu}>Login</Link>
                            <Link to="/register" className="btn btn-sm btn-primary" onClick={closeMenu}>Register</Link>
                        </>
                    )}
                </div>
            </div>

            {menuOpen && <div className="nav-overlay" onClick={closeMenu}></div>}
        </nav>
    );
};

export default Navbar;
