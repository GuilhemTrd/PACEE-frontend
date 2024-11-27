import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import NotFound from "./components/router/notFound/NotFound";
import PrivateRoute from "./components/router/privateRoute";
import './App.css';
/* Auth */
import Login from './components/login/Login';
import Register from "./components/register/Register";
/* Pages */
import Discussion from "./components/discussion/Discussion";
import Profile from "./components/profile/Profile";
/* Layout */
import Navbar from "./components/navbar/Navbar";

const App = () => {
    const isAuthenticated = !!localStorage.getItem('token'); // Vérifie l'authentification

    return (
        <Router>
            <Routes>
                {/* Redirection par défaut */}
                <Route path="/" element={<Navigate to={isAuthenticated ? "/profile" : "/login"} />} />

                {/* Routes publiques */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Routes privées */}
                <Route
                    path="/profile"
                    element={
                        <PrivateRoute isAuthenticated={isAuthenticated}>
                            <Profile />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/discussion"
                    element={
                        <PrivateRoute isAuthenticated={isAuthenticated}>
                            <Discussion />
                        </PrivateRoute>
                    }
                />
                <Route path="/navbar" element={<Navbar />} />

                {/* Route 404 */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Router>
    );
};

export default App;