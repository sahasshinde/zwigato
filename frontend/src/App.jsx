import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import UserRegister from './pages/UserRegister';
import UserLogin from './pages/UserLogin';
import PartnerRegister from './pages/PartnerRegister';
import PartnerLogin from './pages/PartnerLogin';
import PartnerDashboard from './pages/PartnerDashboard';
import Profile from './pages/Profile';
import PartnerProfile from './pages/PartnerProfile';
import Discover from './pages/Discover';
import RestaurantPage from './pages/RestaurantPage';
import OrderPage from './pages/OrderPage';
import Navbar from './components/Navbar';

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="text-4xl animate-spin">🍽️</div></div>;
  if (!user) return <Navigate to="/" replace />;
  if (role && user.role !== role) return <Navigate to={user.role === 'partner' ? '/partner/dashboard' : '/discover'} replace />;
  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();
  return (
    <>
      {user && <Navbar />}
      <Routes>
        <Route path="/" element={user ? <Navigate to={user.role === 'partner' ? '/partner/dashboard' : '/discover'} /> : <Landing />} />
        <Route path="/register" element={<UserRegister />} />
        <Route path="/login" element={<UserLogin />} />
        <Route path="/partner/register" element={<PartnerRegister />} />
        <Route path="/partner/login" element={<PartnerLogin />} />
        <Route path="/discover" element={<ProtectedRoute role="user"><Discover /></ProtectedRoute>} />
        <Route path="/restaurant/:handle" element={<ProtectedRoute role="user"><RestaurantPage /></ProtectedRoute>} />
        <Route path="/order/:postId" element={<ProtectedRoute role="user"><OrderPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute role="user"><Profile /></ProtectedRoute>} />
        <Route path="/partner/dashboard" element={<ProtectedRoute role="partner"><PartnerDashboard /></ProtectedRoute>} />
        <Route path="/partner/profile" element={<ProtectedRoute role="partner"><PartnerProfile /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}