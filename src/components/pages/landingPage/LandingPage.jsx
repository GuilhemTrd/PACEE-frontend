import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';
import logo from '../../../assets/logo/logo-typographique.png';

const LandingPage = () => {
    return (
        <div className="landing-page">
            <header className="landing-header">
                <img src={logo} alt="Pacee Logo" className="logoLanding" />
                <nav className="nav-links">
                    <Link to="/login">Se connecter</Link>
                    <Link to="/register" className="register-btn">S'inscrire</Link>
                </nav>
            </header>

            <section className="hero-section">
                <h1>Rejoignez la Communauté des Passionnés de Course à Pied et de Trail 🏃‍♂️🏃‍♀️</h1>
                <p>Partagez vos expériences, trouvez des conseils et connectez-vous avec d'autres coureurs.</p>
                <Link to="/register" className="cta-button">Commencez dès maintenant</Link>
            </section>

            <section className="features-section">
                <div className="features-grid">
                    <div className="feature-card">
                        <h3>💬 Page d'Échange</h3>
                        <p>Partagez vos sorties, conseils, et interagissez avec d'autres passionnés.</p>
                    </div>
                    <div className="feature-card">
                        <h3>📚 Articles Spécialisés</h3>
                        <p>Découvrez des articles sur l'entraînement, l'équipement et les meilleures stratégies de course.</p>
                    </div>
                    <div className="feature-card">
                        <h3>🏆 Profils Personnalisés</h3>
                        <p>Affichez vos performances, obtenez des badges, etc.</p>
                    </div>
                    <div className="feature-card">
                        <h3>🔍 Recherche Avancée</h3>
                        <p>Trouvez facilement des articles et des utilisateurs grâce à notre barre de recherche intuitive.</p>
                    </div>
                </div>
            </section>

            <section className="community-section">
                <h2>Une Communauté Active et Bienveillante</h2>
                <p>Rejoignez des milliers de coureurs, des débutants aux experts, prêts à partager et à s'entraider.</p>
            </section>

            <footer className="landing-footer">
                <p>&copy; 2025 Pacee. Tous droits réservés.</p>
                <nav className="footer-links">
                    <Link to="/login">Connexion</Link>
                    <Link to="/register">Inscription</Link>
                </nav>
            </footer>
        </div>
    );
};

export default LandingPage;
