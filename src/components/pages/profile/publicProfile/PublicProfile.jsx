import React, { useState, useEffect, useRef } from 'react';
import { useParams} from 'react-router-dom';
import '../Profile.css';
import Navbar from '../../../common/navbar/Navbar';
import userProfilePlaceholder from '../../../../assets/temp/userProfile.png';
import apiClient from '../../../../utils/apiClient';
import Loader from "../../../common/loader/Loader";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import userProfileDefault from "../../../../assets/temp/userProfile.png";

const Profile = () => {
    const { userId } = useParams();
    const [userInfo, setUserInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedBadge, setSelectedBadge] = useState(null);
    const modalRef = useRef(null);
    const [pathProfilePicture, setPathProfilePicture] = useState(null);
    const formatTime = (isoString) => {
        if (!isoString) return '';
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
        setIsLoading(true);

        try {
            const id = userId || localStorage.getItem('userId');

            if (!id) {
                throw new Error("ID utilisateur introuvable.");
            }

            const response = await apiClient.get(`/api/users/${id}`);

            if (response.status !== 200) {
                throw new Error("Erreur lors de la récupération des informations.");
            }

            const data = response.data;
            setUserInfo(data);

            setPathProfilePicture(
                data.image_profile
                    ? `${process.env.REACT_APP_API_URL}${data.image_profile}`
                    : userProfileDefault
            );

        } catch (error) {
            console.error("Erreur lors de la récupération du profil:", error);

            // Gestion spécifique des erreurs HTTP
            if (error.response) {
                if (error.response.status === 404) {
                    setError("Utilisateur non trouvé.");
                } else if (error.response.status === 401) {
                    setError("Accès non autorisé.");
                    localStorage.removeItem('userId');
                    window.location.href = "/login";
                } else {
                    setError("Une erreur s'est produite, veuillez réessayer.");
                }
            } else {
                setError("Problème de connexion au serveur.");
            }

            toast.error("Erreur : " + error.message);
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
            <Navbar/>
            <ToastContainer/>
            <div className="profile-content-wrapper">
                {/* En-tête de profil */}
                <div className="profile-header-container">
                    <div className="profile-avatar-wrapper">
                        <img
                            src={pathProfilePicture || userProfilePlaceholder}
                            alt="Avatar utilisateur"
                            className="profile-avatar"
                        />
                    </div>
                    <div className="profile-info-user">
                        <h2>{userInfo.username || 'Utilisateur inconnu'}</h2>
                        <p>Email : {userInfo.email || 'Non spécifié'}</p>
                        <p>Membre depuis : {formatDate(userInfo.created_at)}</p>
                    </div>
                </div>
                {/* Cartes */}
                <div className="profile-cards-container">
                    <div className="profile-card">
                        <h3>Badges</h3>
                        <div className="badges-container">
                            {userInfo.userBadges && userInfo.userBadges.length > 0 ? (
                                userInfo.userBadges.map((userBadge, index) => (
                                    <div className="badge-item" key={index} onClick={() => openBadgeModal(userBadge)}>
                                        <div
                                            className="badge-icon"
                                            dangerouslySetInnerHTML={{__html: userBadge.badge.svg}}
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
                            dangerouslySetInnerHTML={{__html: selectedBadge.badge.svg}}
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