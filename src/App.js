import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './App.css';
import Login from './components/login/Login';
import Register from "./components/register/Register";

const App = () => {
    return (
        <Router>
            <Routes>
                {/* Redirection de la route "/" vers "/login" */}
                <Route path="/" element={<Navigate to="/login" />} />

                {/* Route pour la page de login */}
                <Route path="/login" element={<Login />} />

                <Route path="/register" element={<Register />} />
            </Routes>
        </Router>
    );
};

export default App;
