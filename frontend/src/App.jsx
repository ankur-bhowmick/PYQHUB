import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import UniversityPapers from './pages/UniversityPapers';
import RatingsPage from './pages/RatingsPage';
import ContactPage from './pages/ContactPage';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import AdminUniversities from './pages/AdminUniversities';
import AdminPapers from './pages/AdminPapers';

const ProtectedRoute = ({ children, adminOnly = false }) => {
    const { user, loading } = useAuth();
    if (loading) return <div className="loading">Loading...</div>;
    if (!user) return <Navigate to="/login" />;
    if (adminOnly && user.role !== 'admin') return <Navigate to="/" />;
    return children;
};

const App = () => {
    return (
        <AuthProvider>
            <Router>
                <Navbar />
                <main className="main-content">
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/" element={<Home />} />
                        <Route path="/university/:id" element={<UniversityPapers />} />
                        <Route path="/ratings" element={<RatingsPage />} />
                        <Route path="/contact" element={
                            <ProtectedRoute><ContactPage /></ProtectedRoute>
                        } />
                        <Route path="/profile" element={
                            <ProtectedRoute><Profile /></ProtectedRoute>
                        } />
                        <Route path="/admin/dashboard" element={
                            <ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>
                        } />
                        <Route path="/admin/universities" element={
                            <ProtectedRoute adminOnly><AdminUniversities /></ProtectedRoute>
                        } />
                        <Route path="/admin/papers" element={
                            <ProtectedRoute adminOnly><AdminPapers /></ProtectedRoute>
                        } />
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </main>
                <Footer />
            </Router>
        </AuthProvider>
    );
};

export default App;
