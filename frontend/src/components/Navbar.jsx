// components/Navbar.jsx — The top navigation bar shown on every page.
//
// It shows different links depending on whether the user is:
//   - Logged out → shows Login / Register
//   - Logged in as employee → shows Events, Dashboard, Logout
//   - Logged in as admin → also shows Admin Panel

import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-green-700 text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo / Brand name */}
        <Link to="/events" className="text-xl font-bold tracking-tight flex items-center gap-2">
          🌿 VolunteerTrack
        </Link>

        {/* Navigation links */}
        <div className="flex items-center gap-4 text-sm font-medium">
          {user ? (
            // Links shown when LOGGED IN
            <>
              <Link to="/events"    className="hover:text-green-200 transition-colors">Events</Link>
              <Link to="/dashboard" className="hover:text-green-200 transition-colors">Dashboard</Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="hover:text-green-200 transition-colors">Admin Panel</Link>
              )}
              {/* User info + logout */}
              <div className="flex items-center gap-3 ml-4 pl-4 border-l border-green-500">
                <span className="text-green-200 text-xs">
                  Hi, <span className="font-semibold text-white">{user.name}</span>
                  {user.role === 'admin' && (
                    <span className="ml-1 bg-yellow-400 text-yellow-900 text-xs px-1.5 py-0.5 rounded-full font-bold">ADMIN</span>
                  )}
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-green-600 hover:bg-green-500 px-3 py-1 rounded-md transition-colors text-xs"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            // Links shown when LOGGED OUT
            <>
              <Link to="/login"    className="hover:text-green-200 transition-colors">Login</Link>
              <Link to="/register" className="bg-white text-green-700 hover:bg-green-50 px-3 py-1.5 rounded-md transition-colors font-semibold">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
