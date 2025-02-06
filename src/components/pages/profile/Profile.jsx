import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './Profile.css';
import Navbar from '../../common/navbar/Navbar';
import userProfilePlaceholder from '../../../assets/temp/userProfile.png';
import apiClient from '../../../utils/apiClient';
import Loader from "../../common/loader/Loader";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import userProfileDefault from "../../../assets/temp/userProfile.png";

const Profile = () => {
    const [userInfo, setUserInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedBadge, setSelectedBadge] = useState(null);
    const modalRef = useRef(null);
    const [pathProfilePicture, setPathProfilePicture] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [updatedUserInfo, setUpdatedUserInfo] = useState({
        username: '',
        email: '',
        palmares: '',
        time_5k: '',
        time_10k: '',
        time_semi: '',
        time_marathon: ''
    });
    const [formErrors, setFormErrors] = useState({});
    const fileInputRef = useRef(null);

    const handleEditAvatar = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };
    const isValidTimeFormat = (time) => {
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5]?[0-9]):([0-5]?[0-9])$/;
        return timeRegex.test(time);
    };

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
        try {
            const response = await apiClient.get(`/api/users/${localStorage.getItem('userId')}`);
            const data = response.data;

            setUserInfo(data);
            if (!data.image_profile) {
                setPathProfilePicture(userProfileDefault);
            } else {
                setPathProfilePicture(`${process.env.REACT_APP_API_URL}${data.image_profile}`);
            }

        } catch (error) {
            console.error('Erreur lors de la récupération des informations utilisateur:', error);
            setError('Impossible de récupérer les informations utilisateur.');
            toast.error('Impossible de récupérer les informations utilisateur.');
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

    const handleEditModalOpen = () => {
        setUpdatedUserInfo({
            username: userInfo.username || '',
            email: userInfo.email || '',
            palmares: userInfo.palmares || '',
            time_5k: userInfo.time_5k ? formatTime(userInfo.time_5k) : '',
            time_10k: userInfo.time_10k ? formatTime(userInfo.time_10k) : '',
            time_semi: userInfo.time_semi ? formatTime(userInfo.time_semi) : '',
            time_marathon: userInfo.time_marathon ? formatTime(userInfo.time_marathon) : ''
        });
        setIsEditModalOpen(true);
    };

    const handleEditModalClose = () => {
        setIsEditModalOpen(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUpdatedUserInfo((prev) => ({ ...prev, [name]: value }));
    };

    const validateForm = () => {
        const errors = {};

        if (!isValidTimeFormat(updatedUserInfo.time_5k)) {
            errors.time_5k = "Le format doit être HH:MM:SS.";
        }
        if (!isValidTimeFormat(updatedUserInfo.time_10k)) {
            errors.time_10k = "Le format doit être HH:MM:SS.";
        }
        if (!isValidTimeFormat(updatedUserInfo.time_semi)) {
            errors.time_semi = "Le format doit être HH:MM:SS.";
        }
        if (!isValidTimeFormat(updatedUserInfo.time_marathon)) {
            errors.time_marathon = "Le format doit être HH:MM:SS.";
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleProfileUpdate = async () => {
        if (!validateForm()) {
            toast.error("Veuillez corriger les erreurs dans le formulaire.");
            return;
        }

        const updatedData = {
            ...updatedUserInfo,
            time_5k: updatedUserInfo.time_5k ? `1970-01-01T${updatedUserInfo.time_5k}Z` : null,
            time_10k: updatedUserInfo.time_10k ? `1970-01-01T${updatedUserInfo.time_10k}Z` : null,
            time_semi: updatedUserInfo.time_semi ? `1970-01-01T${updatedUserInfo.time_semi}Z` : null,
            time_marathon: updatedUserInfo.time_marathon ? `1970-01-01T${updatedUserInfo.time_marathon}Z` : null,
        };

        try {
            const response = await apiClient.put(`/api/users/${localStorage.getItem('userId')}`, updatedData);
            if (response.status === 200) {
                setUserInfo((prev) => ({ ...prev, ...updatedData }));
                toast.success("Profil mis à jour avec succès !");
                setIsEditModalOpen(false);
            } else {
                throw new Error("Mise à jour non réussie.");
            }
        } catch (err) {
            console.error("Erreur lors de la mise à jour du profil :", err);
            toast.error("Une erreur s'est produite lors de la mise à jour du profil.");
        }
    };

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        const maxFileSize = 2 * 1024 * 1024; // 2MB

        if (!allowedTypes.includes(file.type)) {
            toast.warning("Seuls les fichiers JPEG, PNG et GIF sont acceptés.");
            return;
        }
        if (file.size > maxFileSize) {
            toast.warning("La taille du fichier ne doit pas dépasser 2MB.");
            return;
        }

        const formData = new FormData();
        formData.append('image_profile', file);

        try {
            const uploadResponse = await apiClient.post(
                `/api/users/${localStorage.getItem('userId')}/upload-avatar`,
                formData
            );
            const updatedImageProfile = uploadResponse.data.image_profile;
            const timestampedUrl = `${process.env.REACT_APP_API_URL}${updatedImageProfile}?timestamp=${new Date().getTime()}`;

            setPathProfilePicture(timestampedUrl);
            setUserInfo((prev) => ({
                ...prev,
                image_profile: updatedImageProfile,
            }));

            toast.success("Votre photo de profil a été mise à jour avec succès !");
            localStorage.setItem('profileUpdated', true);

        } catch (error) {
            console.error("Erreur lors de l'upload :", error);
            toast.error("Une erreur s'est produite lors de la mise à jour de votre photo de profil.");
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
                        <button className="edit-avatar-btn" onClick={handleEditAvatar}>
                            ✏️
                        </button>
                        {/* Ajoutez l'élément <input> caché */}
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            style={{display: 'none'}}
                            onChange={handleFileChange}
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

                <div className="profile-buttons-container">
                    <button className="profile-btn edit-btn" onClick={handleEditModalOpen}>
                        Modifier le profil
                    </button>
                    <Link to="/Users" className="profile-btn user-btn">
                        Chercher un utilisateur
                    </Link>
                    <Link to="/Login" onClick={logout} className="profile-btn logout-btn">
                        Déconnexion
                    </Link>
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
            {isEditModalOpen && (
                <div className="modal-overlay" onClick={handleEditModalClose}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-form">
                            <label>
                                Nom d'utilisateur :
                                <input
                                    type="text"
                                    name="username"
                                    value={updatedUserInfo.username}
                                    onChange={handleInputChange}
                                />
                            </label>
                            <label>
                                Email :
                                <input
                                    type="email"
                                    name="email"
                                    value={updatedUserInfo.email}
                                    onChange={handleInputChange}
                                />
                            </label>
                            <label>
                                5 km :
                                <input
                                    type="text"
                                    name="time_5k"
                                    value={updatedUserInfo.time_5k}
                                    onChange={handleInputChange}
                                    placeholder="HH:MM:SS"
                                    className={formErrors.time_5k ? "input-error" : ""}
                                />
                                {formErrors.time_5k && <span className="error-message">{formErrors.time_5k}</span>}
                            </label>
                            <label>
                                10 km :
                                <input
                                    type="text"
                                    name="time_10k"
                                    value={updatedUserInfo.time_10k}
                                    onChange={handleInputChange}
                                    placeholder="HH:MM:SS"
                                    className={formErrors.time_10k ? "input-error" : ""}
                                />
                                {formErrors.time_10k && <span className="error-message">{formErrors.time_10k}</span>}
                            </label>
                            <label>
                                Semi :
                                <input
                                    type="text"
                                    name="time_semi"
                                    value={updatedUserInfo.time_semi}
                                    onChange={handleInputChange}
                                    placeholder="HH:MM:SS"
                                    className={formErrors.time_semi ? "input-error" : ""}
                                />
                                {formErrors.time_semi && <span className="error-message">{formErrors.time_semi}</span>}
                            </label>
                            <label>
                                Marathon :
                                <input
                                    type="text"
                                    name="time_marathon"
                                    value={updatedUserInfo.time_marathon}
                                    onChange={handleInputChange}
                                    placeholder="HH:MM:SS"
                                    className={formErrors.time_marathon ? "input-error" : ""}
                                />
                                {formErrors.time_marathon &&
                                    <span className="error-message">{formErrors.time_marathon}</span>}
                            </label>

                            <div className="modal-actions">
                                <button onClick={handleProfileUpdate} className="save-btn">
                                    Enregistrer
                                </button>
                                <button onClick={handleEditModalClose} className="cancel-btn">
                                    Annuler
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Profile;