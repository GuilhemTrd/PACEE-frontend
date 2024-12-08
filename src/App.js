import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import NotFound from "./components/router/notFound/NotFound";
import PrivateRoute from "./components/router/privateRoute";
import './App.css';
/* Auth */
import Login from './components/login/Login';
import Register from "./components/register/Register";
/* Pages */
import Discussions from "./components/discussions/Discussions";
import Profile from "./components/profile/Profile";
import Articles from "./components/articles/Articles";
import ArticleDetail from "./components/articleDetail/ArticleDetail";
import CreateArticle from "./components/createArticle/CreateArticle";
import Settings from "./components/settings/Settings";
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