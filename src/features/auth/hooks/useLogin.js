import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { authStorage } from '../services/authStorage';
import { useAuthStore } from '../state/authStore';

export function useLogin() {

    const navigate = useNavigate();
    const setAuth = useAuthStore((state) => state.setAuth);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const login = async (credentials) => {
        try {
            setIsLoading(true);
            setError("");

            const response = await authApi.login(credentials);
            authStorage.saveLoginResponse(response.data);

            setAuth({
                userId: response.data.userId,
            });

            navigate("/");
        } catch (err) {
            setError(err.response?.data?.message || "Login failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return {
        login,
        isLoading,
        error,
    };
}