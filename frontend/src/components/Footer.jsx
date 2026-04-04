import { Link } from 'react-router-dom';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="site-footer">
            {/* Curved top edge */}
            <div className="footer-wave">
                <svg viewBox="0 0 1440 80" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0,40 C360,100 1080,-20 1440,40 L1440,80 L0,80 Z" fill="currentColor" />
                </svg>
            </div>

            <div className="footer-content">
                <div className="footer-grid">
                    {/* Column 1: Brand & About */}
                    <div className="footer-col footer-brand-col">
                        <div className="footer-brand">
                            <span className="footer-brand-icon">📚</span>
                            <div>
                                <h3 className="footer-brand-title">PYQHUB</h3>
                                <span className="footer-brand-tagline">Previous Year Questions</span>
                            </div>
                        </div>
                        <p className="footer-about-text">
                            Your one-stop destination for previous year university question papers —
                            organized, searchable, and completely free. Helping students prepare smarter, not harder.
                        </p>
                        <div className="footer-social-hint">
                            <span>Made for Students</span>
                            <span className="footer-dot">•</span>
                            <span>For Academic Use Only</span>
                        </div>
                    </div>

                    {/* Column 2: Quick Links */}
                    <div className="footer-col">
                        <h4 className="footer-heading">Quick Links</h4>
                        <ul className="footer-links">
                            <li><Link to="/">🏠 Home</Link></li>
                            <li><Link to="/ratings">⭐ Ratings</Link></li>
                            <li><Link to="/contact">✉️ Contact</Link></li>
                            <li><Link to="/login">🔐 Login</Link></li>
                            <li><Link to="/register">📝 Register</Link></li>
                        </ul>
                    </div>

                    {/* Column 3: About This Platform */}
                    <div className="footer-col footer-initiative-col">
                        <h4 className="footer-heading">About This Platform</h4>
                        <div className="footer-initiative">
                            <p>
                                This platform is built with one simple goal — to make previous year question papers
                                easily accessible to every student, completely <strong>free of cost</strong>,
                                with <strong>no ads or distractions</strong>.
                            </p>
                            <p>
                                All the question papers available here are collected through contributions from
                                fellow students and trusted academic sources. We sincerely appreciate everyone
                                who helped make this possible.
                            </p>
                            <p>
                                We know how much time students spend searching for PYQs before exams — this platform
                                brings everything together in one organized place, so you can focus on what truly
                                matters: <strong>your preparation</strong>.
                            </p>
                            <p className="footer-contribute">
                                📩 Want to contribute PYQs or have suggestions? Feel free to reach out — we'd love to hear from you!
                            </p>
                        </div>
                    </div>

                    {/* Column 4: Reach Us */}
                    <div className="footer-col">
                        <h4 className="footer-heading">Reach Us</h4>
                        <ul className="footer-contact-list">
                            <li>
                                <span className="footer-contact-icon">📧</span>
                                <div>
                                    <span className="footer-contact-label">Email</span>
                                    <a href="mailto:ankurbhowmick736@gmail.com" className="footer-email-link">
                                        ankurbhowmick736@gmail.com
                                    </a>
                                </div>
                            </li>
                            <li>
                                <span className="footer-contact-icon">💬</span>
                                <div>
                                    <span className="footer-contact-label">Feedback</span>
                                    <Link to="/contact" className="footer-contact-action">Send a Message →</Link>
                                </div>
                            </li>
                            <li>
                                <span className="footer-contact-icon">⭐</span>
                                <div>
                                    <span className="footer-contact-label">Rate Us</span>
                                    <Link to="/ratings" className="footer-contact-action">Leave a Review →</Link>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="footer-bottom">
                <div className="footer-bottom-content">
                    <span>© {currentYear} PYQHUB. All Rights Reserved.</span>
                    <div className="footer-creator">
                        <span className="footer-creator-label">Created by</span>
                        <span className="footer-creator-name">ANKUR BHOWMICK</span>
                        <span className="footer-creator-details">BSc Computer Science (Hons) • Bhairab Ganguly College</span>
                    </div>
                    <span className="footer-bottom-love">Made with 💜 for Students</span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
