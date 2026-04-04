import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const UniversityPapers = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [university, setUniversity] = useState(null);
    const [papers, setPapers] = useState([]);
    const [years, setYears] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [theoryCount, setTheoryCount] = useState(0);
    const [practicalCount, setPracticalCount] = useState(0);
    const [paperNames, setPaperNames] = useState([]);
    const [syllabusTypes, setSyllabusTypes] = useState([]);
    const [selectedYear, setSelectedYear] = useState('');
    const [selectedSemester, setSelectedSemester] = useState('');
    const [selectedSyllabusType, setSelectedSyllabusType] = useState('');
    const [activeTab, setActiveTab] = useState('Theory');
    const [sortBy, setSortBy] = useState('newest');
    const [loading, setLoading] = useState(true);
    const [viewingPdf, setViewingPdf] = useState(null);
    const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
    const [copiedId, setCopiedId] = useState(null);
    const [groupBySubject, setGroupBySubject] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchData();
        if (user) fetchBookmarks();
    }, [id, selectedYear, selectedSemester, selectedSyllabusType, sortBy, activeTab]);

    const fetchData = async () => {
        try {
            let query = `/papers/university/${id}?sort=${sortBy}&paperType=${activeTab}`;
            if (selectedYear) query += `&year=${selectedYear}`;
            if (selectedSemester) query += `&semester=${encodeURIComponent(selectedSemester)}`;
            if (selectedSyllabusType) query += `&syllabusType=${encodeURIComponent(selectedSyllabusType)}`;

            const [uniRes, papersRes] = await Promise.all([
                api.get(`/universities/${id}`),
                api.get(query)
            ]);
            setUniversity(uniRes.data.university);
            setPapers(papersRes.data.papers);
            setYears(papersRes.data.years);
            setSemesters(papersRes.data.semesters || []);
            setSubjects(papersRes.data.subjects || []);
            setPaperNames(papersRes.data.paperNames || []);
            setSyllabusTypes(papersRes.data.syllabusTypes || []);
            setTheoryCount(papersRes.data.theoryCount || 0);
            setPracticalCount(papersRes.data.practicalCount || 0);
        } catch (err) {
            console.error('Failed to fetch data');
        }
        setLoading(false);
    };

    const fetchBookmarks = async () => {
        try {
            const res = await api.get('/bookmarks/ids');
            setBookmarkedIds(new Set(res.data.bookmarkedIds));
        } catch (err) { /* not logged in or error */ }
    };

    const getPdfUrl = (filename) => `/api/papers/view/${filename}`;

    const handleDownload = async (paper) => {
        try { await api.post(`/papers/download/${paper._id}`); } catch (e) { }
        const link = document.createElement('a');
        link.href = getPdfUrl(paper.paperFile);
        link.download = paper.originalName || `${paper.subject}-${paper.year}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setPapers(prev => prev.map(p =>
            p._id === paper._id ? { ...p, downloadCount: (p.downloadCount || 0) + 1 } : p
        ));
    };

    const toggleBookmark = async (paperId) => {
        if (!user) return;
        try {
            const res = await api.post('/bookmarks/toggle', { paperId });
            setBookmarkedIds(prev => {
                const next = new Set(prev);
                if (res.data.bookmarked) next.add(paperId);
                else next.delete(paperId);
                return next;
            });
        } catch (err) { console.error('Failed to toggle bookmark'); }
    };

    const handleShare = (paper) => {
        const url = window.location.href;
        const text = `Check out this paper: ${paper.subject} (${paper.year}) - ${university?.name}`;
        if (navigator.share) {
            navigator.share({ title: paper.subject, text, url }).catch(() => { });
        } else {
            navigator.clipboard.writeText(`${text}\n${url}`);
            setCopiedId(paper._id);
            setTimeout(() => setCopiedId(null), 2000);
        }
    };

    // Filter papers by search query (paper name + subject)
    const filteredPapers = searchQuery.trim()
        ? papers.filter(p => {
            const q = searchQuery.toLowerCase();
            return (
                (p.paperName && p.paperName.toLowerCase().includes(q)) ||
                (p.subject && p.subject.toLowerCase().includes(q))
            );
        })
        : papers;

    // Group filtered papers by subject → semester → paperName hierarchy
    const buildGroupedPapers = () => {
        const groups = {};
        filteredPapers.forEach(p => {
            const subjectKey = p.subject;
            const semKey = p.semester || 'No Semester';
            const paperNameKey = p.paperName || 'General';

            if (!groups[subjectKey]) groups[subjectKey] = {};
            if (!groups[subjectKey][semKey]) groups[subjectKey][semKey] = {};
            if (!groups[subjectKey][semKey][paperNameKey]) groups[subjectKey][semKey][paperNameKey] = [];
            groups[subjectKey][semKey][paperNameKey].push(p);
        });
        return groups;
    };
    const groupedPapers = groupBySubject ? buildGroupedPapers() : {};

    const clearFilters = () => {
        setSelectedYear('');
        setSelectedSemester('');
        setSelectedSyllabusType('');
        setSearchQuery('');
        setSortBy('newest');
    };

    const hasActiveFilters = selectedYear || selectedSemester || selectedSyllabusType || searchQuery || sortBy !== 'newest';

    if (loading) return <div className="loading">Loading papers...</div>;
    if (!university) return <div className="empty-state"><h3>University not found</h3></div>;

    const renderPaperCard = (paper) => (
        <div key={paper._id} className="paper-card">
            <div className="paper-card-header">
                <div>
                    <h4>{paper.subject}</h4>
                    {paper.paperName && (
                        <div className="paper-name-badge">📄 {paper.paperName}</div>
                    )}
                    {paper.paperCategory === 'Minor' && paper.minorSubject && (
                        <div style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 600, marginTop: '2px' }}>
                            📝 Minor: {paper.minorSubject}
                        </div>
                    )}
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {user && (
                        <button
                            className={`bookmark-btn ${bookmarkedIds.has(paper._id) ? 'bookmarked' : ''}`}
                            onClick={() => toggleBookmark(paper._id)}
                            title={bookmarkedIds.has(paper._id) ? 'Remove bookmark' : 'Bookmark'}
                        >
                            {bookmarkedIds.has(paper._id) ? '🔖' : '📑'}
                        </button>
                    )}
                    <div className={`paper-card-icon ${paper.paperType === 'Practical' ? 'practical-icon' : 'theory-icon'}`}>
                        {paper.paperType === 'Practical' ? '🔬' : '📖'}
                    </div>
                </div>
            </div>
            <div className="paper-card-meta">
                <span className="tag">📅 {paper.year}</span>
                {paper.semester && <span className="tag">📘 {paper.semester}</span>}
                <span className="tag">📋 {paper.examType}</span>
                <span className={`tag ${paper.paperType === 'Practical' ? 'tag-practical' : 'tag-theory'}`}>
                    {paper.paperType === 'Practical' ? '🔬 Practical' : '📖 Theory'}
                </span>
                <span className={`tag ${paper.paperCategory === 'Minor' ? 'tag-minor' : 'tag-major'}`}>
                    {paper.paperCategory === 'Minor' ? '📝 Minor' : '🎓 Major'}
                </span>
                {paper.downloadCount > 0 && (
                    <span className="tag tag-downloads">📥 {paper.downloadCount}</span>
                )}
                {paper.syllabusType && (
                    <span className="tag tag-syllabus">📑 {paper.syllabusType}</span>
                )}
            </div>
            <div className="paper-card-actions">
                <button className="btn btn-sm btn-primary" onClick={() => setViewingPdf(paper)}>
                    👁️ View PDF
                </button>
                <button className="btn btn-sm btn-outline" onClick={() => handleDownload(paper)}>
                    ⬇️ Download
                </button>
                <button
                    className="btn btn-sm btn-ghost"
                    onClick={() => handleShare(paper)}
                    title="Share"
                >
                    {copiedId === paper._id ? '✅' : '🔗'}
                </button>
            </div>
        </div>
    );

    const renderPapersContent = () => {
        if (filteredPapers.length === 0) {
            return (
                <div className="empty-state">
                    <span className="empty-icon">{searchQuery ? '🔍' : activeTab === 'Practical' ? '🔬' : '📖'}</span>
                    <h3>{searchQuery ? `No papers match "${searchQuery}"` : `No ${activeTab.toLowerCase()} papers found`}</h3>
                    <p>{hasActiveFilters ? 'Try changing your filters or search term' : `No ${activeTab.toLowerCase()} papers uploaded yet for this university`}</p>
                    {hasActiveFilters && <button className="btn btn-outline" onClick={clearFilters} style={{ marginTop: '12px' }}>Clear Filters</button>}
                </div>
            );
        }

        if (groupBySubject) {
            return (
                <div className="grouped-papers">
                    {Object.entries(groupedPapers).map(([subject, semesters]) => (
                        <div key={subject} className="subject-group">
                            <div className="subject-group-header">
                                <h3>📚 {subject}</h3>
                                <span className="subject-count">
                                    {Object.values(semesters).reduce((total, paperNames) =>
                                        total + Object.values(paperNames).reduce((t, arr) => t + arr.length, 0), 0
                                    )} paper{Object.values(semesters).reduce((total, paperNames) =>
                                        total + Object.values(paperNames).reduce((t, arr) => t + arr.length, 0), 0
                                    ) !== 1 ? 's' : ''}
                                </span>
                            </div>
                            {Object.entries(semesters).map(([semester, paperNameGroups]) => (
                                <div key={semester} className="semester-group">
                                    <div className="semester-group-header">
                                        <span>📘 {semester}</span>
                                    </div>
                                    {Object.entries(paperNameGroups).map(([paperName, papersList]) => (
                                        <div key={paperName} className="paper-name-group">
                                            {paperName !== 'General' && (
                                                <div className="paper-name-group-header">
                                                    <span>📄 {paperName}</span>
                                                    <span className="paper-name-count">{papersList.length} paper{papersList.length !== 1 ? 's' : ''}</span>
                                                </div>
                                            )}
                                            <div className="papers-grid">
                                                {papersList.map(paper => renderPaperCard(paper))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            );
        }

        return (
            <div className="papers-grid">
                {filteredPapers.map(paper => renderPaperCard(paper))}
            </div>
        );
    };

    return (
        <div className="container">
            {/* Breadcrumb */}
            <div className="breadcrumb">
                <Link to="/">Home</Link>
                <span className="breadcrumb-sep">›</span>
                <span>{university.name}</span>
            </div>

            <div className="page-header">
                <h1>🏛️ {university.name}</h1>
                <p>📍 {university.location}</p>
                {university.description && <p className="uni-about">{university.description}</p>}
            </div>

            {/* Search Bar */}
            <div className="uni-search-bar">
                <div className="uni-search-wrapper">
                    <span className="uni-search-icon">🔍</span>
                    <input
                        type="text"
                        className="uni-search-input"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by paper name or subject..."
                    />
                    {searchQuery && (
                        <button className="uni-search-clear" onClick={() => setSearchQuery('')}>✕</button>
                    )}
                </div>
                {searchQuery && (
                    <div className="uni-search-results-hint">
                        Found <strong>{filteredPapers.length}</strong> result{filteredPapers.length !== 1 ? 's' : ''} for "{searchQuery}"
                    </div>
                )}
            </div>

            {/* Theory / Practical Tabs */}
            <div className="paper-type-tabs">
                <button
                    className={`paper-type-tab ${activeTab === 'Theory' ? 'active' : ''}`}
                    onClick={() => { setActiveTab('Theory'); setSelectedYear(''); setSelectedSemester(''); setSelectedSyllabusType(''); }}
                >
                    <span className="tab-icon">📖</span>
                    <span className="tab-label">Theory Papers</span>
                    <span className="tab-count">{theoryCount}</span>
                </button>
                <button
                    className={`paper-type-tab ${activeTab === 'Practical' ? 'active' : ''}`}
                    onClick={() => { setActiveTab('Practical'); setSelectedYear(''); setSelectedSemester(''); setSelectedSyllabusType(''); }}
                >
                    <span className="tab-icon">🔬</span>
                    <span className="tab-label">Practical Papers</span>
                    <span className="tab-count">{practicalCount}</span>
                </button>
            </div>

            {/* Filters */}
            <div className="filter-bar">
                <div className="filter-section">
                    <span className="filter-label">Year:</span>
                    <button className={`filter-btn ${selectedYear === '' ? 'active' : ''}`} onClick={() => setSelectedYear('')}>All</button>
                    {years.map(year => (
                        <button key={year} className={`filter-btn ${selectedYear === String(year) ? 'active' : ''}`} onClick={() => setSelectedYear(String(year))}>{year}</button>
                    ))}
                </div>

                {semesters.length > 0 && (
                    <div className="filter-section">
                        <span className="filter-label">Semester:</span>
                        <button className={`filter-btn ${selectedSemester === '' ? 'active' : ''}`} onClick={() => setSelectedSemester('')}>All</button>
                        {semesters.map(sem => (
                            <button key={sem} className={`filter-btn ${selectedSemester === sem ? 'active' : ''}`} onClick={() => setSelectedSemester(sem)}>{sem}</button>
                        ))}
                    </div>
                )}

                {syllabusTypes.length > 0 && (
                    <div className="filter-section">
                        <span className="filter-label">Syllabus:</span>
                        <button className={`filter-btn ${selectedSyllabusType === '' ? 'active' : ''}`} onClick={() => setSelectedSyllabusType('')}>All</button>
                        {syllabusTypes.map(st => (
                            <button key={st} className={`filter-btn ${selectedSyllabusType === st ? 'active' : ''}`} onClick={() => setSelectedSyllabusType(st)}>{st}</button>
                        ))}
                    </div>
                )}

                <div className="filter-section">
                    <span className="filter-label">Sort:</span>
                    <select className="filter-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="subject">Subject A-Z</option>
                        <option value="popular">Most Downloaded</option>
                        <option value="recent">Recently Added</option>
                    </select>
                </div>

                <div className="filter-section">
                    <button
                        className={`filter-btn ${groupBySubject ? 'active' : ''}`}
                        onClick={() => setGroupBySubject(!groupBySubject)}
                    >
                        📚 Group by Subject
                    </button>
                    {hasActiveFilters && (
                        <button className="filter-btn filter-clear" onClick={clearFilters}>✕ Clear</button>
                    )}
                </div>
            </div>

            {/* Papers Content */}
            {renderPapersContent()}

            <div className="paper-stats">
                Showing {filteredPapers.length} {activeTab.toLowerCase()} paper{filteredPapers.length !== 1 ? 's' : ''}{selectedYear ? ` for ${selectedYear}` : ''}
                {selectedSemester ? ` • ${selectedSemester}` : ''}
                {searchQuery ? ` • Search: "${searchQuery}"` : ''}
            </div>

            {/* PDF Viewer Modal */}
            {viewingPdf && (
                <div className="pdf-modal-overlay" onClick={() => setViewingPdf(null)}>
                    <div className="pdf-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="pdf-modal-header">
                            <h3>{viewingPdf.paperType === 'Practical' ? '🔬' : '📖'} {viewingPdf.subject} — {viewingPdf.year} {viewingPdf.examType} ({viewingPdf.paperType || 'Theory'})</h3>
                            <div className="pdf-modal-header-actions">
                                <button className="btn btn-sm btn-outline" onClick={() => handleDownload(viewingPdf)}>
                                    ⬇️ Download
                                </button>
                                <button className="pdf-close-btn" onClick={() => setViewingPdf(null)}>✕</button>
                            </div>
                        </div>
                        <div className="pdf-modal-body">
                            <iframe
                                src={getPdfUrl(viewingPdf.paperFile)}
                                title={viewingPdf.subject}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UniversityPapers;
