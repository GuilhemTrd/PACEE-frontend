import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Navbar.css';
import logo from '../../assets/logo/logo-typographique.png';
import userProfileDefault from '../../assets/temp/userProfile.png';
import discussionIcon from '../../assets/icons/discussion.svg';
import discussionIconColor from '../../assets/icons/discussionColor.svg';
import articlesIcon from '../../assets/icons/article.svg';
import articlesIconColor from '../../assets/icons/articleColor.svg';
import settingsIcon from '../../assets/icons/settings.svg';
import settingsIconColor from '../../assets/icons/settingsColor.svg';
import Loader from "../loader/Loader";
import apiClient from '../../utils/apiClient';

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (isMenuOpen) {
            document.body.classList.add('no-scroll');
        } else {
            document.body.classList.remove('no-scroll');
        }
    }, [isMenuOpen]);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await apiClient.get(`/api/users/${localStorage.getItem('userId')}`);
                const data = response.data;
                setUserData({
                    fullName: data.username,
                    email: data.email,
                    imageProfile: data.image_profile
                        ? `${process.env.REACT_APP_API_URL}${data.image_profile}`
                        : userProfileDefault,
                });
                setIsLoading(false);
            } catch (error) {
                console.error('Erreur lors de la récupération des données utilisateur:', error);
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, [navigate]);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    if (isLoading) {
        return (
            <Loader />
        );
    }

    return (
        <>
            <div className={`burger-menu ${isMenuOpen ? 'open' : ''}`} onClick={toggleMenu}>
                <div></div>
                <div></div>
                <div></div>
            </div>
            <div className={`navbar-container ${isMenuOpen ? 'open' : ''}`}>
                <div className="logo-container">
                    <img src={logo} alt="Logo" className="logo" />
                </div>
                <Link to="/profile" className="profile-container">
                    <img
                        src={userData.imageProfile}
                        alt="User Profile"
                        className="profile-pic"
                    />
                    <div className="profile-info">
                        <h2>{userData.fullName}</h2>
                        <p>{userData.email}</p>
                    </div>
                </Link>
                <div className="menu">
                    <Link to="/discussions" className={`menu-item ${location.pathname === '/' ? 'selected' : ''}`}>
                        <img src={location.pathname === '/discussions' ? discussionIconColor : discussionIcon} alt="Fil de discussion" className="menu-icon" />
                        <span>Fil d’actualité</span>
                    </Link>
                    <Link to="/articles" className={`menu-item ${location.pathname === '/articles' ? 'selected' : ''}`}>
                        <img src={location.pathname === '/articles' ? articlesIconColor : articlesIcon} alt="Articles" className="menu-icon" />
                        <span>Articles</span>
                    </Link>
                    <Link to="/settings" className={`menu-item ${location.pathname === '/settings' ? 'selected' : ''}`}>
                        <img src={location.pathname === '/settings' ? settingsIconColor : settingsIcon} alt="Settings" className="menu-icon" />
                        <span>Paramètres</span>
                    </Link>
                </div>
                <div className="socials">
                    <h3>Nos réseaux</h3>
                    <a href="https://instagram.com" className="social-link">Instagram</a>
                    <a href="https://twitter.com" className="social-link">Twitter</a>
                </div>
                <div className="logout">
                    <a href={"/login"} className="logout-link" onClick={handleLogout}>Logout</a>
                </div>
            </div>
        </>
    );
};

export default Navbar;
