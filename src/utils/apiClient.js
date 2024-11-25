import axios from 'axios';

const apiClient = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
});

apiClient.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    error => Promise.reject(error)
);

apiClient.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refresh_token');
                if (!refreshToken) throw new Error("No refresh token found");

                const { data } = await axios.post(`${process.env.REACT_APP_API_URL}/token/refresh`, {
                    refresh_token: refreshToken,
                });

                localStorage.setItem('token', data.token);

                originalRequest.headers['Authorization'] = `Bearer ${data.token}`;

                return apiClient(originalRequest);
            } catch (refreshError) {
                console.error('Refresh token expired or invalid');
                localStorage.clear();
            }
        }
        if (error.response?.status === 403 || error.response?.status === 401) {
            localStorage.clear();
            window.location.href = '/login';
        }

        return Promise.reject(error);
    }
);

export default apiClient;
