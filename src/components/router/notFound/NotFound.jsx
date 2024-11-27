import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css';
import logo from '../../../assets/logo/logo-typographique.png';

const NotFound = () => (
    <div className="not-found-page">
        <div className="not-found-content">
            <img src={logo} alt="Logo" className="not-found-logo" />
            <h1>404 - Page introuvable</h1>
            <p>La page que vous recherchez n'existe pas ou a été déplacée.</p>
            <div className="not-found-links">
                <Link to="/login" className="not-found-link">
                    Se connecter
                </Link>
                <Link to="/register" className="not-found-link secondary-link">
                    Créer un compte
                </Link>
            </div>
        </div>
    </div>
);

export default NotFound;
