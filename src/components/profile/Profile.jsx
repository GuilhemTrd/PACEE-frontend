import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './Profile.css';
import Navbar from '../navbar/Navbar';
import userProfilePlaceholder from '../../assets/temp/userProfile.png';
import apiClient from '../../utils/apiClient';
import Loader from "../loader/Loader";

const Profile = () => {
    const [userInfo, setUserInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedBadge, setSelectedBadge] = useState(null);
    const modalRef = useRef(null);

    const formatTime = (isoString) => {
        if (!isoString) return '-';
        const date = new Date(isoString);
        const hours = String(date.getUTCHours()).padStart(2, '0');
        const minutes = String(date.getUTCMinutes()).padStart(2, '0');
        const seconds = String(date.getUTCSeconds()).padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    };

    const formatDate = (isoString) => {
        if (!isoString) return '-';
        try {
            const date = new Date(isoString);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
        } catch (error) {
            console.error("Erreur lors de la conversion de la date :", isoString, error);
            return 'Date invalide';
        }
    };

    const fetchUserInfo = async () => {
        try {
            const response = await apiClient.get(`/api/users/${localStorage.getItem('userId')}`);
            setUserInfo(response.data);
        } catch (error) {
            console.error('Erreur lors de la récupération des informations utilisateur:', error);
            setError('Impossible de récupérer les informations utilisateur.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUserInfo();

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                closeBadgeModal();
            }
        };
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    const logout = () => {
        localStorage.clear();
        window.location.href = '/login';
    };

    const openBadgeModal = (badge) => {
        setSelectedBadge({
            ...badge,
            awarded_at: formatDate(badge.awarded_at),
        });
    };

    const closeBadgeModal = () => {
        setSelectedBadge(null);
    };

    const handleOutsideClick = (event) => {
        if (modalRef.current && !modalRef.current.contains(event.target)) {
            closeBadgeModal();
        }
    };

    if (isLoading) {
        return <Loader />;
    }

    if (error) {
        return <div className="profile-page">Erreur : {error}</div>;
    }

    return (
        <div className="profile-page">
            <Navbar />
            <div className="profile-content-wrapper">
                {/* En-tête de profil */}
                <div className="profile-header-container">
                    <img
                        src={userInfo.image_profile || userProfilePlaceholder}
                        alt="Avatar utilisateur"
                        className="profile-avatar"
                    />
                    <div className="profile-info">
                        <h2>{userInfo.username || 'Utilisateur inconnu'}</h2>
                        <p>Email : {userInfo.email || 'Non spécifié'}</p>
                        <p>Membre depuis : {formatDate(userInfo.created_at)}</p>
                    </div>
                </div>

                <div className="profile-cards-container">
                    <div className="profile-card">
                        <h3>Badges</h3>
                        <div className="badges-container">
                            {userInfo.userBadges && userInfo.userBadges.length > 0 ? (
                                userInfo.userBadges.map((userBadge, index) => (
                                    <div
                                        className="badge-item"
                                        key={index}
                                        onClick={() => openBadgeModal(userBadge)}
                                    >
                                        <div
                                            className="badge-icon"
                                            dangerouslySetInnerHTML={{ __html: userBadge.badge.svg }}
                                        ></div>
                                    </div>
                                ))
                            ) : (
                                <p>Aucun badge obtenu pour le moment.</p>
                            )}
                        </div>
                    </div>

                    {/* Activité */}
                    <div className="profile-card">
                        <h3>Activité</h3>
                        <ul>
                            <li><strong>Publications :</strong> {userInfo.countDiscussions || 0}</li>
                            <li><strong>Commentaires :</strong> {userInfo.countCommentaires || 0}</li>
                            <li><strong>J'aime :</strong> {userInfo.countLikes || 0}</li>
                        </ul>
                    </div>

                    {/* Performances */}
                    <div className="profile-card">
                        <h3>Mes performances</h3>
                        <ul>
                            <li><strong>5 km :</strong> {formatTime(userInfo.time_5k)}</li>
                            <li><strong>10 km :</strong> {formatTime(userInfo.time_10k)}</li>
                            <li><strong>Semi :</strong> {formatTime(userInfo.time_semi)}</li>
                            <li><strong>Marathon :</strong> {formatTime(userInfo.time_marathon)}</li>
                            <li><strong>Autre :</strong> {userInfo.palmares || '-'}</li>
                        </ul>
                    </div>
                </div>

                {/* Boutons d'action */}
                <div className="profile-buttons-container">
                    <button className="profile-btn edit-btn">Modifier le profil</button>
                    <Link to="/MyPaces" className="profile-btn paceCalculate-btn">Calculer mes allures</Link>
                    <Link to="/Login" onClick={logout} className="profile-btn logout-btn">Déconnexion</Link>
                </div>
            </div>

            {/* Modal des badges */}
            {selectedBadge && (
                <div className="badge-modal" onClick={handleOutsideClick}>
                    <div className="badge-modal-content" ref={modalRef}>
                        <span className="close-btn" onClick={closeBadgeModal}>
                            &times;
                        </span>
                        <h2>{selectedBadge.badge.name}</h2>
                        <div
                            className="badge-icon-large"
                            dangerouslySetInnerHTML={{ __html: selectedBadge.badge.svg }}
                        ></div>
                        <p>{selectedBadge.badge.description}</p>
                        <p>Obtenu le : {selectedBadge.awarded_at}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
