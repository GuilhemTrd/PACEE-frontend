import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './App.css';
import Login from './components/login/Login';
import Register from "./components/register/Register";
import Navbar from "./components/navbar/Navbar";

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Navigate to="/login" />} />

                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/navbar" element={<Navbar />} />
            </Routes>
        </Router>
    );
};

export default App;
