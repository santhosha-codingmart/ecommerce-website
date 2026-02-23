import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * PrivateRoute - Guards routes that require authentication.
 * If no token is found in localStorage, redirects to /login.
 */
function PrivateRoute({ children }) {
    const token = localStorage.getItem('token');
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    return children;
}

export default PrivateRoute;
