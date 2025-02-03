import React from 'react';
import { Link } from 'react-router-dom';
import '../router.css';
import logo from '../../../../assets/logo/logo-typographique.png';

const NotAuth = () => (
    <div className="not-found-page">
        <div className="not-found-content">
            <img src={logo} alt="Logo" className="not-found-logo" />
            <h1>Oups ! T'es pas censé être ici 😅</h1>
            <p>Tu t'es perdu ? 👀</p>
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

export default NotAuth;
