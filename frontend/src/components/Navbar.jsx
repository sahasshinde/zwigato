import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ZwigatoLogo from './Logo';

export default function Navbar() {
  const { user, logout, isPartner } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-orange-100 shadow-sm">
      <div className="w-full px-6 h-14 flex items-center">

        {/* Logo — far left */}
        <div className="flex-none">
          <Link to={isPartner ? '/partner/dashboard' : '/discover'} >
            <ZwigatoLogo size={30} />
          </Link>
        </div>

        {/* Nav Links — center */}
        <div className="flex-1 flex items-center justify-center gap-1">
          {!isPartner && (
            <>
              
              <Link to="/discover" className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${isActive('/discover') ? 'bg-orange-50 text-orange-600' : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'}`}>
                🏠 Home
              </Link>
              <Link to="/profile" className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${isActive('/profile') ? 'bg-orange-50 text-orange-600' : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'}`}>
                👤 Profile
              </Link>
            </>
          )}
          {isPartner && (
            <>
              <Link to="/partner/dashboard" className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${isActive('/partner/dashboard') ? 'bg-orange-50 text-orange-600' : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'}`}>
                📊 Dashboard
              </Link>
              <Link to="/partner/profile" className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${isActive('/partner/profile') ? 'bg-orange-50 text-orange-600' : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'}`}>
                🏪 My Page
              </Link>
            </>
          )}
        </div>

        {/* User info + logout — far right */}
        <div className="flex-none flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center text-sm">
              {isPartner ? '🏪' : '😋'}
            </div>
            <span className="text-sm font-medium text-gray-700 max-w-[120px] truncate hidden sm:block">
              {isPartner ? user?.restaurantName : user?.name}
            </span>
            {isPartner && (
              <span className="text-xs bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full font-medium hidden sm:block">
                Partner
              </span>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-1.5 text-sm font-semibold text-orange-500 bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Logout
          </button>
        </div>

      </div>
    </nav>
  );
}