import React, { useState, useRef } from 'react';
import './Login.css';
import logo from '../../assets/logo/logo-typographique.png';
import background from '../../assets/images/LoginRegister_img.png';
import mailIcon from '../../assets/icons/mail.svg';
import lockIcon from '../../assets/icons/lock.svg';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const passwordInputRef = useRef();

    // Validation du champ email
    const handleEmailChange = (e) => {
        setEmail(e.target.value);
    };

    // Validation du champ password
    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
    };

    // Soumission du formulaire
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage('');
        setSuccessMessage('');

        // Validation basique avant soumission
        if (!/\S+@\S+\.\S+/.test(email)) {
            setErrorMessage('Veuillez entrer un email valide.');
            return;
        }

        if (password.length < 8) {
            setErrorMessage('Le mot de passe doit comporter au moins 8 caractères.');
            passwordInputRef.current.focus();
            return;
        }

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setSuccessMessage('Connexion réussie !');
                // Stocker le token JWT dans le localStorage
                localStorage.setItem('token', data.token);
                // Rediriger l'utilisateur vers la page suivante
                navigate('/ProchainePage');
            } else if (response.status === 401) {
                setErrorMessage('Identifiant ou mot de passe incorrect.');
                passwordInputRef.current.focus();
            } else {
                setErrorMessage('Une erreur est survenue, veuillez réessayer.');
            }
        } catch (error) {
            setErrorMessage('Erreur de réseau ou serveur indisponible. Nous travaillons à résoudre le problème.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="image-container">
                <img src={background} alt="Background" className="background-image" />
            </div>
            <div className="form-container">
                <img src={logo} alt="Logo" className="logo" />
                <h1>Se connecter</h1>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <div className="input-icon">
                            <img src={mailIcon} alt="Mail Icon" />
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
                            <img src={lockIcon} alt="Lock Icon"/>
                            <input
                                ref={passwordInputRef}
                                type="password"
                                name="password"
                                value={password}
                                onChange={handlePasswordChange}
                                placeholder="Mot de passe"
                                aria-label="Mot de passe"
                                required
                            />
                        </div>
                    </div>
                    <button type="submit" className="login-button" disabled={isLoading}>
                        {isLoading ? 'Connexion en cours...' : 'Se connecter'}
                    </button>
                    {errorMessage && <p className="error-message">{errorMessage}</p>}
                    {successMessage && <p className="success-message">{successMessage}</p>}
                </form>
            </div>
        </div>
    );
};

export default Login;
