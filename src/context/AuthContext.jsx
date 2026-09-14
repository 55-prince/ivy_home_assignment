import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { ivyApi } from "../api/ivyApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    restoreSession();
  }, []);

  async function restoreSession() {
    try {
      const response = await ivyApi.getCurrentUser();

      // Backend returns:
      // { user: { email: "..." } }
      setUser(response?.user ?? null);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function login(email, password) {
    const response = await ivyApi.login(
      email,
      password
    );

    // Backend login response already contains
    // the authenticated user.
    const currentUser =
      response?.user ?? null;

    setUser(currentUser);

    return currentUser;
  }

  async function logout() {
    try {
      await ivyApi.logout();
    } finally {
      setUser(null);
    }
  }

  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    login,
    logout,
    restoreSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}