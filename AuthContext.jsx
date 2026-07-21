import { createContext, useContext, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("skillsphere_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const login = async (email, password) => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/auth/login", { email, password });

      if (data.twoFactorRequired) {
        return data; // { twoFactorRequired: true, preAuthToken } — caller redirects to /verify-2fa
      }

      localStorage.setItem("skillsphere_user", JSON.stringify(data));
      setUser(data);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (idToken) => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/auth/google", { idToken });

      if (data.twoFactorRequired) {
        return data;
      }

      localStorage.setItem("skillsphere_user", JSON.stringify(data));
      setUser(data);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || "Google sign-in failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const completeTwoFactorLogin = async (preAuthToken, token) => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/auth/2fa/verify", { preAuthToken, token });
      localStorage.setItem("skillsphere_user", JSON.stringify(data));
      setUser(data);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || "Invalid code");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData) => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/auth/register", formData);
      localStorage.setItem("skillsphere_user", JSON.stringify(data));
      setUser(data);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("skillsphere_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, loginWithGoogle, completeTwoFactorLogin, loading, error }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
