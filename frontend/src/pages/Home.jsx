import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const Home = () => {
    const [universities, setUniversities] = useState([]);
    const [recentPapers, setRecentPapers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [showSearchResults, setShowSearchResults] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [uniRes, recentRes] = await Promise.all([
                api.get('/universities'),
                api.get('/papers/recent')
            ]);
            setUniversities(uniRes.data.universities);
            setRecentPapers(recentRes.data.papers);
        } catch (err) {
            console.error('Failed to fetch data');
        }
        setLoading(false);
    };

    // Debounced global search
    useEffect(() => {
        if (search.trim().length < 2) {
            setSearchResults([]);
            setShowSearchResults(false);
            return;
        }
        const timer = setTimeout(async () => {
            setSearching(true);
            try {
                const res = await api.get(`/papers/search?q=${encodeURIComponent(search.trim())}`);
                setSearchResults(res.data.papers);
                setShowSearchResults(true);
            } catch (err) {
                console.error('Search failed');
            }
            setSearching(false);
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    const filtered = universities.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.location.toLowerCase().includes(search.toLowerCase())
    );

    const getPdfUrl = (filename) => `/api/papers/view/${filename}`;

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div className="container">
            {/* Hero */}
            <div className="hero">
                <h1>
                    Find Your <span className="gradient-text">Question Papers</span>
                </h1>
                <p>Browse previous year question papers from top universities — organized, searchable, and ready to download.</p>
            </div>

            {/* Global Search */}
            <div className="search-bar" style={{ position: 'relative' }}>
                <input
                    type="text"
                    placeholder="Search papers by subject, university name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onFocus={() => searchResults.length > 0 && setShowSearchResults(true)}
                    onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                />
                {searching && <span className="search-spinner"></span>}

                {/* Search Results Dropdown */}
                {showSearchResults && searchResults.length > 0 && (
                    <div className="search-dropdown">
                        <div className="search-dropdown-header">
                            📄 Found {searchResults.length} paper{searchResults.length !== 1 ? 's' : ''}
                        </div>
                        {searchResults.slice(0, 8).map(paper => (
                            <Link
                                key={paper._id}
                                to={`/university/${paper.universityId?._id}`}
                                className="search-result-item"
                                onClick={() => { setSearch(''); setShowSearchResults(false); }}
                            >
                                <div className="search-result-info">
                                    <strong>{paper.subject}</strong>
                                    <span>{paper.universityId?.name} • {paper.year} • {paper.examType}</span>
                                </div>
                                <span className="search-result-arrow">→</span>
                            </Link>
                        ))}
                        {searchResults.length > 8 && (
                            <div className="search-dropdown-footer">
                                +{searchResults.length - 8} more results
                            </div>
                        )}
                    </div>
                )}
                {showSearchResults && searchResults.length === 0 && search.trim().length >= 2 && !searching && (
                    <div className="search-dropdown">
                        <div className="search-no-results">No papers found for "{search}"</div>
                    </div>
                )}
            </div>

            {/* Stats Bar */}
            <div className="home-stats-bar">
                <div className="home-stat-item">
                    <span className="home-stat-num">{universities.length}</span>
                    <span className="home-stat-label">Universities</span>
                </div>
                <div className="home-stat-divider"></div>
                <div className="home-stat-item">
                    <span className="home-stat-num">{universities.reduce((sum, u) => sum + (u.paperCount || 0), 0)}</span>
                    <span className="home-stat-label">Papers Available</span>
                </div>
                <div className="home-stat-divider"></div>
                <div className="home-stat-item">
                    <span className="home-stat-num">Free</span>
                    <span className="home-stat-label">Always & Forever</span>
                </div>
            </div>

            {/* Recently Added Papers */}
            {recentPapers.length > 0 && (
                <div className="recent-section">
                    <div className="section-header">
                        <h2>🆕 Recently Added</h2>
                        <p>Latest question papers uploaded to the portal</p>
                    </div>
                    <div className="recent-papers-scroll">
                        {recentPapers.map(paper => (
                            <Link
                                key={paper._id}
                                to={`/university/${paper.universityId?._id}`}
                                className="recent-paper-card"
                            >
                                <div className="recent-paper-icon">📝</div>
                                <div className="recent-paper-info">
                                    <h4>{paper.subject}</h4>
                                    <span className="recent-paper-uni">{paper.universityId?.name}</span>
                                    <div className="recent-paper-meta">
                                        <span>{paper.year}</span>
                                        <span>•</span>
                                        <span>{paper.examType}</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Universities Grid */}
            <div className="section-header" style={{ marginTop: '48px' }}>
                <h2>🏛️ Universities</h2>
                <p>Select a university to browse its question papers</p>
            </div>

            {filtered.length === 0 ? (
                <div className="empty-state">
                    <span className="empty-icon">🏫</span>
                    <h3>No universities found</h3>
                    <p>{search ? 'Try a different search term' : 'Universities will appear here once added by admin'}</p>
                </div>
            ) : (
                <div className="uni-grid">
                    {filtered.map(uni => (
                        <Link to={`/university/${uni._id}`} key={uni._id} className="uni-card">
                            <div className="uni-icon">🏛️</div>
                            <h3>{uni.name}</h3>
                            <p className="uni-location">📍 {uni.location}</p>
                            {uni.description && <p className="uni-desc">{uni.description}</p>}
                            <div className="uni-meta">
                                <span className="paper-count">📄 {uni.paperCount || 0} Papers</span>
                                <span className="view-link">View Papers →</span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Home;
