import axios from 'axios';

// Créer une instance Axios
const apiClient = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
});

// Intercepteur de réponse pour rafraîchir le token
apiClient.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;

        // Si une erreur 401 est interceptée et que la requête n'a pas déjà été réessayée
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Récupérer le refresh token
                const refreshToken = localStorage.getItem('refresh_token');

                if (!refreshToken) throw new Error("No refresh token found");

                // Demander un nouveau token avec le refresh token
                const { data } = await axios.post(`${process.env.REACT_APP_API_URL}/token/refresh`, {
                    refresh_token: refreshToken,
                });

                // Sauvegarder le nouveau token
                localStorage.setItem('token', data.token);

                // Ajouter le nouveau token à l'en-tête Authorization
                originalRequest.headers['Authorization'] = `Bearer ${data.token}`;

                // Rejouer la requête originale avec le nouveau token
                return apiClient(originalRequest);
            } catch (refreshError) {
                console.error('Refresh token expired or invalid');
                localStorage.clear(); // Nettoyer le localStorage en cas d'échec
                //window.location.href = '/login'; // Rediriger vers login
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;
