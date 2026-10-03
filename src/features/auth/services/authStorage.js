import { tokenService } from "./tokenService";

export const authStorage = {
    saveLoginResponse: (sessionId, userId) => {
        tokenService.setSessionId(sessionId);
        tokenService.setUserId(userId);
    },

    getAuthData: () => {
        return {
            sessionId: tokenService.getSessionId(),
            userId: tokenService.getUserId(),
        };
    },

    isAuthenticated: () => {
        const sessionId = tokenService.getSessionId();
        return !!sessionId;
    },

    clearLoginData: () => {
        tokenService.clear();
    },
};