import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import NotFound from "./components/common/router/notFound/NotFound";
import PrivateRoute from "./components/common/router/privateRoute";
import './App.css';
/* Auth */
import Login from './components/authentification/login/Login';
import Register from "./components/authentification/register/Register";
/* Pages */
import Discussions from "./components/pages/discussions/Discussions";
import Profile from "./components/pages/profile/Profile";
import Articles from "./components/pages/articles/Articles";
import ArticleDetail from "./components/pages/articleDetail/ArticleDetail";
import CreateArticle from "./components/pages/createArticle/CreateArticle";
import Settings from "./components/pages/settings/Settings";
/* Layout */
import Navbar from "./components/common/navbar/Navbar";

const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token')); // Utilisation de l'état

    // Met à jour `isAuthenticated` lorsque les jetons sont modifiés
    useEffect(() => {
        const handleStorageChange = () => {
            setIsAuthenticated(!!localStorage.getItem('token'));
        };

        // Écoute les changements dans `localStorage`
        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    return (
        <Router>
            <Routes>
                {/* Redirection par défaut */}
                <Route path="/" element={<Navigate to={isAuthenticated ? "/profile" : "/login"} />} />

                {/* Routes publiques */}
                <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
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
                    path="/discussions"
                    element={
                        <PrivateRoute isAuthenticated={isAuthenticated}>
                            <Discussions />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/articles"
                    element={
                        <PrivateRoute isAuthenticated={isAuthenticated}>
                            <Articles />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/articles/:id"
                    element={
                        <PrivateRoute isAuthenticated={isAuthenticated}>
                            <ArticleDetail />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/create-article"
                    element={
                        <PrivateRoute isAuthenticated={isAuthenticated}>
                            <CreateArticle />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/settings"
                    element={
                        <PrivateRoute isAuthenticated={isAuthenticated}>
                            <Settings />
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
