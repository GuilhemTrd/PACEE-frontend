import { jwtDecode } from 'jwt-decode';

const useAuth = () => {
    const token = localStorage.getItem('token');

    if (!token) {
        return { isAdmin: false, roles: [] };
    }

    try {
        const decodedToken = jwtDecode(token);
        const roles = decodedToken.roles || [];
        const isAdmin = roles.includes('ROLE_ADMIN');

        return { isAdmin, roles };
    } catch (error) {
        console.error('Erreur lors du décodage du token JWT:', error);
        return { isAdmin: false, roles: [] };
    }
};

export default useAuth;