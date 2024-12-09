import React, {useState, useRef} from 'react';
import './Login.css';
import logo from '../../../assets/logo/logo-typographique.png';
import background from '../../../assets/images/LoginRegister_img.png';
import mailIcon from '../../../assets/icons/mail.svg';
import eyeOpenIcon from '../../../assets/icons/eye-open.svg';
import eyeClosedIcon from '../../../assets/icons/eye-closed.svg';
import apiClient from '../../../utils/apiClient';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const passwordInputRef = useRef();

    const handleEmailChange = (e) => {
        console.log('Email modifié:', e.target.value); // Debug Email
        setEmail(e.target.value);
    };

    const handlePasswordChange = (e) => {
        console.log('Mot de passe modifié:', e.target.value); // Debug Mot de Passe
        setPassword(e.target.value);
    };

    const togglePasswordVisibility = () => {
        console.log('Visibilité du mot de passe:', !passwordVisible); // Debug Visibilité
        setPasswordVisible(!passwordVisible);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Formulaire soumis'); // Debug Soumission
        setIsLoading(true);
        setErrorMessage('');
        setSuccessMessage('');

        console.log('Validation email et mot de passe...'); // Debug Validation
        if (!/\S+@\S+\.\S+/.test(email)) {
            setErrorMessage('Veuillez entrer un email valide.');
            console.log('Erreur: Email invalide'); // Debug Email invalide
            return;
        }

        if (password.length < 8) {
            setErrorMessage('Le mot de passe doit comporter au moins 8 caractères.');
            console.log('Erreur: Mot de passe trop court'); // Debug Mot de passe invalide
            passwordInputRef.current.focus();
            return;
        }

        try {
            console.log('Envoi des données au backend...'); // Debug Envoi API
            const response = await apiClient.post('/login', {
                email,
                password,
            });

            console.log('Réponse du backend:', response); // Debug Réponse API
            if (response.status === 200) {
                const data = response.data;
                console.log('Connexion réussie, données utilisateur:', data); // Debug Connexion réussie
                localStorage.setItem('token', data.token);
                localStorage.setItem('refresh_token', data.refresh_token);
                localStorage.setItem('userId', data.user.id);
                setSuccessMessage('Connexion réussie !');
                console.log('Redirection vers la page de discussions...'); // Debug Redirection
                navigate('/discussions');
            } else {
                setErrorMessage('Identifiant ou mot de passe incorrect.');
                console.log('Erreur: Identifiants incorrects'); // Debug Identifiants incorrects
                passwordInputRef.current.focus();
            }
        } catch (error) {
            console.error('Erreur lors de la connexion:', error); // Debug Erreur backend
            setErrorMessage('Une erreur est survenue, veuillez réessayer.');
        } finally {
            setIsLoading(false);
            console.log('Fin de la tentative de connexion'); // Debug Fin
        }
    };

    return (
        <div className="login-container">
            <div className="image-container">
                <img src={background} alt="Background" className="background-image" />
            </div>
            <div className="form-container">
                <img src={logo} alt="Logo" className="logo"/>
                <h1>Se connecter</h1>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <div className="input-icon">
                            <img src={mailIcon} alt="Mail Icon"/>
                            <input
                                type="email"
                                name="email"
                                value={email}
                                onChange={handleEmailChange}
                                placeholder="Email"
                                aria-label="Adresse e-mail"
                                required
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <div className="input-icon">
                            <input
                                ref={passwordInputRef}
                                type={passwordVisible ? 'text' : 'password'}
                                name="password"
                                value={password}
                                onChange={handlePasswordChange}
                                placeholder="Mot de passe"
                                aria-label="Mot de passe"
                                required
                            />
                            <img
                                src={passwordVisible ? eyeOpenIcon : eyeClosedIcon}
                                alt="Toggle visibility"
                                className="toggle-visibility-password"
                                onClick={togglePasswordVisibility}
                            />
                        </div>
                    </div>
                    <button type="submit" className="login-button" disabled={isLoading}>
                        {isLoading ? 'Connexion en cours...' : 'Se connecter'}
                    </button>
                </form>

                <div className="login-links">
                    <span>Mot de passe oublié ?&nbsp;</span>
                    <a href="/forgot-password" className="forgot-password-link">
                        Modifier
                    </a>
                    <br/>
                    <span>Vous n'avez pas de compte ?&nbsp;</span>
                    <a href="/register" className="register-link">
                        S'inscrire
                    </a>
                </div>
                {errorMessage && <p className="error-message">{errorMessage}</p>}
                {successMessage && <p className="success-message">{successMessage}</p>}
            </div>
        </div>
    );
};

export default Login;
