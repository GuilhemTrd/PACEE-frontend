import React, { useState } from 'react';
import './Register.css';
import logo from '../../../assets/logo/logo-typographique.png';
import background from '../../../assets/images/LoginRegister_img.png';
import userIcon from '../../../assets/icons/user.svg';
import mailIcon from '../../../assets/icons/mail.svg';
import eyeOpenIcon from '../../../assets/icons/eye-open.svg';
import eyeClosedIcon from '../../../assets/icons/eye-closed.svg';
import checkIcon from '../../../assets/icons/check.svg';
import crossIcon from '../../../assets/icons/cross.svg';
import { Link } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';


const Register = () => {
    const [firstname, setFirstname] = useState('');
    const [lastname, setLastname] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [validations, setValidations] = useState({
        length: false,
        number: false,
        uppercase: false,
        identical: false,
    });
    const [showValidations, setShowValidations] = useState({
        password: false,
        confirmPassword: false,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [shakePassword, setShakePassword] = useState(false);
    const [shakeConfirm, setShakeConfirm] = useState(false);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

    // Validation du mot de passe
    const validatePassword = (password, confirmPassword) => {
        const length = password.length >= 8;
        const number = /\d/.test(password);
        const uppercase = /[A-Z]/.test(password);
        const identical = password === confirmPassword && confirmPassword.length > 0;

        setValidations({
            length,
            number,
            uppercase,
            identical,
        });
    };

    const handlePasswordChange = (e) => {
        const newPassword = e.target.value;
        setPassword(newPassword);
        validatePassword(newPassword, confirmPassword);
    };

    const handleConfirmPasswordChange = (e) => {
        const newConfirmPassword = e.target.value;
        setConfirmPassword(newConfirmPassword);
        validatePassword(password, newConfirmPassword);
    };

    const handlePasswordFocus = () => {
        setShowValidations({ ...showValidations, password: true });
    };

    const handleConfirmPasswordFocus = () => {
        setShowValidations({ ...showValidations, confirmPassword: true });
    };

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    const toggleConfirmPasswordVisibility = () => {
        setConfirmPasswordVisible(!confirmPasswordVisible);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Si le mot de passe ne correspond pas aux validations, ajouter l'animation de secousse
        if (!validations.length || !validations.number || !validations.uppercase) {
            setShakePassword(true);
            setTimeout(() => setShakePassword(false), 500);
            return;
        }

        if (!validations.identical) {
            setShakeConfirm(true);
            setTimeout(() => setShakeConfirm(false), 500);
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    firstname,
                    lastname,
                    email,
                    password,
                }),
            });

            if (response.status === 409) {
                toast.warn('Cet email est déjà utilisé. Veuillez utiliser une autre adresse email.');
                setShowValidations({ password: false, confirmPassword: false });
                return;
            }

            if (!response.ok) {
                throw new Error('Erreur lors de l\'inscription.');
            }

            // Inscription réussie
            toast.success('Inscription réussie ! Vous pouvez maintenant vous connecter.');

            // Cacher les validateurs après la soumission
            setShowValidations({ password: false, confirmPassword: false });
        } catch (error) {
            toast.error('Une erreur est survenue, veuillez réessayer.');
            setShowValidations({ password: false, confirmPassword: false });
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="register-container">
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
            <Link to="/" className="back-to-landing">⬅ Retour sur le site</Link>
            <div className="image-container">
                <img src={background} alt="Background" className="background-image" />
            </div>
            <div className="form-container">
                <img src={logo} alt="Logo" className="logo-register"/>
                <h1>Créer un compte</h1>
                <form onSubmit={handleSubmit}>
                    {/* Prénom */}
                    <div className="form-group">
                        <div className="input-icon">
                            <img src={userIcon} alt="User Icon"/>
                            <input
                                type="text"
                                name="firstname"
                                placeholder="Prénom"
                                value={firstname}
                                onChange={(e) => setFirstname(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    {/* Nom */}
                    <div className="form-group">
                        <div className="input-icon">
                            <img src={userIcon} alt="User Icon"/>
                            <input
                                type="text"
                                name="lastname"
                                placeholder="Nom"
                                value={lastname}
                                onChange={(e) => setLastname(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    {/* Email */}
                    <div className="form-group">
                        <div className="input-icon">
                            <img src={mailIcon} alt="Mail Icon"/>
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    {/* Mot de passe */}
                    <div className={`form-group ${shakePassword ? 'shake' : ''}`}>
                        <div className="input-icon">
                            <input
                                type={passwordVisible ? 'text' : 'password'}
                                name="password"
                                value={password}
                                onChange={handlePasswordChange}
                                onFocus={handlePasswordFocus}
                                placeholder="Mot de passe"
                                required
                            />
                            <img
                                src={passwordVisible ? eyeOpenIcon : eyeClosedIcon}
                                alt="Toggle visibility"
                                className="toggle-visibility-password"
                                onClick={togglePasswordVisibility}
                            />
                        </div>
                        {showValidations.password && (
                            <ul className="password-validation">
                                <li className={`${validations.length ? 'valid' : 'invalid'}`}>
                                    {validations.length ? <img src={checkIcon} alt="Check"/> :
                                        <img src={crossIcon} alt="Cross"/>} Minimum 8 caractères
                                </li>
                                <li className={`${validations.number ? 'valid' : 'invalid'}`}>
                                    {validations.number ? <img src={checkIcon} alt="Check"/> :
                                        <img src={crossIcon} alt="Cross"/>} Au moins 1 chiffre
                                </li>
                                <li className={`${validations.uppercase ? 'valid' : 'invalid'}`}>
                                    {validations.uppercase ? <img src={checkIcon} alt="Check"/> :
                                        <img src={crossIcon} alt="Cross"/>} Au moins 1 majuscule
                                </li>
                            </ul>
                        )}
                    </div>
                    {/* Confirmation du mot de passe */}
                    <div className={`form-group ${shakeConfirm ? 'shake' : ''}`}>
                        <div className="input-icon">
                            <input
                                type={confirmPasswordVisible ? 'text' : 'password'}
                                name="confirmPassword"
                                value={confirmPassword}
                                onChange={handleConfirmPasswordChange}
                                onFocus={handleConfirmPasswordFocus}
                                placeholder="Confirmer le mot de passe"
                                required
                            />
                            <img
                                src={confirmPasswordVisible ? eyeOpenIcon : eyeClosedIcon}
                                alt="Toggle visibility"
                                className="toggle-visibility-password"
                                onClick={toggleConfirmPasswordVisibility}
                            />
                        </div>
                        {showValidations.confirmPassword && (
                            <ul className="password-validation">
                                <li className={validations.identical ? 'valid' : 'invalid'}>
                                    {validations.identical ? <img src={checkIcon} alt="Check"/> :
                                        <img src={crossIcon} alt="Cross"/>} Mot de passe identique
                                </li>
                            </ul>
                        )}
                    </div>
                    <button type="submit" className="register-button" disabled={isLoading}>
                        {isLoading ? 'Inscription en cours...' : 'Créer mon compte'}
                    </button>
                </form>
                <div className="register-links">
                    <span>Vous avez déjà un compte ?&nbsp;</span>
                    <a href="/login" className="register-link">
                        Se connecter
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Register;
