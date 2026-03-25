import { useState } from "react";

const TOKEN_KEY = "alex_token";
const USER_KEY = "alex_user";

const readToken = () => localStorage.getItem(TOKEN_KEY);

const readUser = () => {
    try {
        return JSON.parse(localStorage.getItem(USER_KEY));
    } catch {
        return null;
    }
};

export default function useAuthSession() {
    const [token, setToken] = useState(() => readToken());
    const [user, setUser] = useState(() => readUser());

    const onAuthSuccess = (newToken, email, displayName, role = "student") => {
        const userData = { email, displayName, role };
        localStorage.setItem(TOKEN_KEY, newToken);
        localStorage.setItem(USER_KEY, JSON.stringify(userData));
        setToken(newToken);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setToken(null);
        setUser(null);
    };

    return {
        token,
        user,
        onAuthSuccess,
        logout,
    };
}
