// App.jsx — The root of our React app.
// This file defines all the "pages" and which URL shows which page.
// react-router-dom handles navigation without full page reloads (Single Page App).

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Import all pages
import Login      from './pages/Login';
import Register   from './pages/Register';
import Events     from './pages/Events';
import AdminPanel from './pages/AdminPanel';
import Dashboard  from './pages/Dashboard';
import Navbar     from './components/Navbar';

// ProtectedRoute: If user is not logged in, redirect them to /login.
// Think of it as a locked door — only people with a wristband (token) can enter.
function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex items-center justify-center h-screen text-gray-500">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/events" replace />;

  return children;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <BrowserRouter>
      {/* Navbar is shown on every page */}
      <Navbar />
      <Routes>
        {/* Public routes — accessible without login */}
        <Route path="/login"    element={user ? <Navigate to="/events" /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/events" /> : <Register />} />

        {/* Protected routes — requires login */}
        <Route path="/events" element={
          <ProtectedRoute><Events /></ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute adminOnly={true}><AdminPanel /></ProtectedRoute>
        } />

        {/* Default: redirect root to /events */}
        <Route path="/" element={<Navigate to="/events" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

// Wrap everything in AuthProvider so ALL components can access auth state
export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
