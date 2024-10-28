import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './App.css';
/* Auth */
import Login from './components/login/Login';
import Register from "./components/register/Register";
/* Pages */
import Discussion from "./components/discussion/Discussion";
/* Layout */
import Navbar from "./components/navbar/Navbar";

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Navigate to="/login" />} />

                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/navbar" element={<Navbar />} />
                <Route path="/discussion" element={<Discussion />} />

            </Routes>
        </Router>
    );
};

export default App;
