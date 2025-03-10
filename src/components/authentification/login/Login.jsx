import React, {useState, useRef, useEffect} from 'react';
import './Login.css';
import logo from '../../../assets/logo/logo-typographique.png';
import background from '../../../assets/images/LoginRegister_img.png';
import mailIcon from '../../../assets/icons/mail.svg';
import eyeOpenIcon from '../../../assets/icons/eye-open.svg';
import eyeClosedIcon from '../../../assets/icons/eye-closed.svg';
import apiClient from '../../../utils/apiClient';
import {Link, useNavigate} from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const passwordInputRef = useRef();

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
    };

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    useEffect(() => {
        if (!localStorage.getItem('token') && !localStorage.getItem('refresh_token')) {
            localStorage.removeItem('token');
            localStorage.removeItem('refresh_token');
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        if (!/\S+@\S+\.\S+/.test(email)) {
            toast.warn('Veuillez entrer un email valide.');
            setIsLoading(false);
            return;
        }

        if (password.length < 8) {
            toast.error('Le mot de passe doit comporter au moins 8 caractères.');
            passwordInputRef.current.focus();
            setIsLoading(false);
            return;
        }

        try {
            const response = await apiClient.post('/login', {
                email,
                password,
            });

            if (response.status === 200) {
                const data = response.data;
                localStorage.setItem('token', data.token);
                localStorage.setItem('refresh_token', data.refresh_token);
                localStorage.setItem('userId', data.user.id);

                toast.success('Connexion réussie !');
                navigate('/discussions')
            }
        } catch (error) {
            toast.error('Identifiant ou mot de passe incorrect.');
            passwordInputRef.current.focus();
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                limit={3}
            />
            <Link to="/" className="back-to-landing">⬅ Retour sur le site</Link>
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
                    <br />
                    <span>Vous n'avez pas de compte ?&nbsp;</span>
                    <Link to="/register" className="register-link">
                        S'inscrire
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
