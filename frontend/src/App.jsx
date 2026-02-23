import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import Home from './pages/Home';
import AllProducts from './pages/AllProducts';
import CategoryProducts from './pages/CategoryProducts';
import Login from './pages/Login';
import Signup from './pages/Signup';

/**
 * App layout wrapper — includes Navbar for all protected routes.
 * Search state is now in the URL (?q=...) not in React state.
 */
function ProtectedLayout({ children }) {
  return (
    <PrivateRoute>
      <div className="app-container" style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
        <Navbar />
        <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
          {children}
        </main>
      </div>
    </PrivateRoute>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected: Home — Category grid */}
        <Route path="/" element={<ProtectedLayout><Home /></ProtectedLayout>} />

        {/* Protected: All products + search results (?q=phones+under+5000) */}
        <Route path="/all-products" element={<ProtectedLayout><AllProducts /></ProtectedLayout>} />

        {/* Protected: Products by category */}
        <Route path="/category/:categoryId" element={<ProtectedLayout><CategoryProducts /></ProtectedLayout>} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
