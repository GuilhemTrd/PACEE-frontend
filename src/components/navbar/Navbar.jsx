import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Navbar.css';
import logo from '../../assets/logo/logo-typographique.png';
import userProfile from '../../assets/temp/userProfile.png';
import discussionIcon from '../../assets/icons/discussion.svg';
import discussionIconColor from '../../assets/icons/discussionColor.svg';
import articlesIcon from '../../assets/icons/article.svg';
import articlesIconColor from '../../assets/icons/articleColor.svg';
import settingsIcon from '../../assets/icons/settings.svg';
import settingsIconColor from '../../assets/icons/settingsColor.svg';

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Utiliser useEffect pour ajouter ou enlever la classe no-scroll sur le body
    useEffect(() => {
        if (isMenuOpen) {
            document.body.classList.add('no-scroll');
        } else {
            document.body.classList.remove('no-scroll');
        }
    }, [isMenuOpen]);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <>
            {/* Burger Menu */}
            <div className={`burger-menu ${isMenuOpen ? 'open' : ''}`} onClick={toggleMenu}>
                <div></div>
                <div></div>
                <div></div>
            </div>
            {/* Navbar */}
            <div className={`navbar-container ${isMenuOpen ? 'open' : ''}`}>
                <div className="logo-container">
                    <img src={logo} alt="Logo" className="logo"/>
                </div>
                {/* Change to Link for client-side routing */}
                <Link to="/profile" className="profile-container">
                    <img src={userProfile} alt="User Profile" className="profile-pic"/>
                    <div className="profile-info">
                        <h2>John Doe</h2>
                        <p>john.doe@gmail.com</p>
                    </div>
                </Link>
                <div className="menu">
                    <Link
                        to="/"
                        className={`menu-item ${location.pathname === '/' ? 'selected' : ''}`}
                    >
                        <img
                            src={location.pathname === '/' ? discussionIconColor : discussionIcon}
                            alt="Fil de discussion"
                            className="menu-icon"
                        />
                        <span>Fil d’actualité</span>
                    </Link>
                    <Link
                        to="/articles"
                        className={`menu-item ${location.pathname === '/articles' ? 'selected' : ''}`}
                    >
                        <img
                            src={location.pathname === '/articles' ? articlesIconColor : articlesIcon}
                            alt="Articles"
                            className="menu-icon"
                        />
                        <span>Articles</span>
                    </Link>
                    <Link
                        to="/settings"
                        className={`menu-item ${location.pathname === '/settings' ? 'selected' : ''}`}
                    >
                        <img
                            src={location.pathname === '/settings' ? settingsIconColor : settingsIcon}
                            alt="Settings"
                            className="menu-icon"
                        />
                        <span>Settings</span>
                    </Link>
                </div>
                <div className="socials">
                    <h3>Nos réseaux</h3>
                    <a href="https://instagram.com" className="social-link">Instagram</a>
                    <a href="https://twitter.com" className="social-link">Twitter</a>
                </div>
                <div className="logout">
                    {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                    <a href={"#"} className="logout-link" onClick={handleLogout}>Logout</a>
                </div>
            </div>
        </>
    );
};

export default Navbar;
