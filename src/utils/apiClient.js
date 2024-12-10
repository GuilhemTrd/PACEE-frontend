import axios from 'axios';

const apiClient = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    timeout: 10000, // Délai maximum pour une requête
});

apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refresh_token');
                if (!refreshToken) {
                    console.error('Aucun refresh token trouvé. Déconnexion en cours.');
                    localStorage.clear();
                    window.location.href = '/login';
                    return Promise.reject(error);
                }

                const { data } = await axios.post(`${process.env.REACT_APP_API_URL}/token/refresh`, {
                    refresh_token: refreshToken,
                });

                localStorage.setItem('token', data.token);
                originalRequest.headers['Authorization'] = `Bearer ${data.token}`;
                return apiClient(originalRequest);
            } catch (refreshError) {
                console.error('Le refresh token est expiré ou invalide. Déconnexion.');
                localStorage.clear();
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        if ([401, 403].includes(error.response?.status)) {
            console.error('Erreur d\'authentification ou accès refusé. Déconnexion.');
            localStorage.clear();
            window.location.href = '/login';
            return Promise.reject(error);
        }

        if (!error.response) {
            console.error('Le serveur est injoignable ou ne répond pas.');
            window.location.href = '/login';
            return Promise.reject(error);
        }

        return Promise.reject(error);
    }
);

export default apiClient;
