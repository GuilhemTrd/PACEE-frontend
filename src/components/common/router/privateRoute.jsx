import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';
const PrivateRoute = ({ children, isAuthenticated, requiredRole }) => {
    const { roles } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    if (requiredRole && !roles.includes(requiredRole)) {
        return <Navigate to="/not-auth" />;
    }

    return children;
};

export default PrivateRoute;
