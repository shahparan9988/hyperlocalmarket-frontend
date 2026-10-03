const SESSION_ID_KEY = "hlm_session_id";
const USER_ID_KEY = "hlm_user_id";

export const tokenService = {
  setSessionId: (sessionId) => {
    localStorage.setItem(SESSION_ID_KEY, sessionId);
  },

  getSessionId: () => {
    return localStorage.getItem(SESSION_ID_KEY);
  }, 
  
  setUserId: (userId) => {
    localStorage.setItem(USER_ID_KEY, userId);
  },

  getUserId: () => {
    return localStorage.getItem(USER_ID_KEY);
  },
  
  clear: () => {
    localStorage.removeItem(SESSION_ID_KEY);
    localStorage.removeItem(USER_ID_KEY);
  }
};