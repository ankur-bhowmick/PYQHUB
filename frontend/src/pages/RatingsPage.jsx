import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const RatingsPage = () => {
    const { user } = useAuth();
    const [ratings, setRatings] = useState([]);
    const [avgRating, setAvgRating] = useState(0);
    const [totalRatings, setTotalRatings] = useState(0);
    const [myRating, setMyRating] = useState(0);
    const [myReview, setMyReview] = useState('');
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRatings();
    }, []);

    const fetchRatings = async () => {
        try {
            const res = await api.get('/ratings');
            setRatings(res.data.ratings);
            setAvgRating(res.data.avgRating);
            setTotalRatings(res.data.totalRatings);

            if (user) {
                const mine = res.data.ratings.find(r => r.userId?._id === user._id);
                if (mine) {
                    setMyRating(mine.rating);
                    setMyReview(mine.review || '');
                }
            }
        } catch (err) {
            console.error('Failed to fetch ratings');
        }
        setLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (myRating === 0) { setError('Please select a rating'); return; }
        setError('');
        try {
            await api.post('/ratings', { rating: myRating, review: myReview });
            setSuccess('Rating submitted!');
            fetchRatings();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit rating');
        }
    };

    const renderStars = (count) => '⭐'.repeat(count) + '☆'.repeat(5 - count);

    if (loading) return <div className="loading">Loading ratings...</div>;

    return (
        <div className="container">
            <div className="page-header">
                <h1>⭐ Ratings & Reviews</h1>
                <p>See what others think about PYQ Portal</p>
            </div>

            <div className="rating-overview">
                <div className="rating-big">
                    <span className="rating-number">{avgRating}</span>
                    <span className="rating-stars">{renderStars(Math.round(avgRating))}</span>
                    <span className="rating-count">{totalRatings} review{totalRatings !== 1 ? 's' : ''}</span>
                </div>
            </div>

            {user && user.role !== 'admin' && (
                <div className="rating-form-card">
                    <h3>📝 Rate Your Experience</h3>
                    {error && <div className="alert alert-error">{error}</div>}
                    {success && <div className="alert alert-success">{success}</div>}
                    <form onSubmit={handleSubmit}>
                        <div className="star-picker">
                            {[1, 2, 3, 4, 5].map(star => (
                                <button type="button" key={star} className={`star-btn ${star <= myRating ? 'active' : ''}`} onClick={() => setMyRating(star)}>
                                    {star <= myRating ? '⭐' : '☆'}
                                </button>
                            ))}
                        </div>
                        <div className="form-group">
                            <textarea value={myReview} onChange={(e) => setMyReview(e.target.value)} placeholder="Write a review (optional)..." rows="3" />
                        </div>
                        <button type="submit" className="btn btn-primary">Submit Rating</button>
                    </form>
                </div>
            )}

            <div className="reviews-list">
                {ratings.length === 0 ? (
                    <div className="empty-state"><h3>No reviews yet</h3><p>Be the first to rate!</p></div>
                ) : (
                    ratings.map(r => (
                        <div key={r._id} className="review-card">
                            <div className="review-header">
                                <div className="review-user">
                                    <span className="review-avatar">{r.userId?.name?.[0]?.toUpperCase() || '?'}</span>
                                    <div>
                                        <strong>{r.userId?.name || 'User'}</strong>
                                        <span className="review-role">{r.userId?.role}</span>
                                    </div>
                                </div>
                                <div className="review-stars">{renderStars(r.rating)}</div>
                            </div>
                            {r.review && <p className="review-text">{r.review}</p>}
                            <span className="review-date">{new Date(r.createdAt).toLocaleDateString()}</span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default RatingsPage;
