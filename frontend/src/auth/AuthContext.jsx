import { useEffect, useState } from "react";
import axios from "axios";
import api from "../api/axios";

import { AuthContext } from "./authContext";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const setTokens = ({ access, refresh }) => {
    if (access) localStorage.setItem("access_token", access);
    if (refresh) localStorage.setItem("refresh_token", refresh);
  };

  const clearTokens = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  };

  const refreshMe = async () => {
    const response = await api.get("auth/me/");
    setUser(response.data);
    return response.data;
  };

  const login = async ({ email, password }) => {
    const baseURL =
      import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/";
    const response = await axios.post(`${baseURL}token/`, { email, password });
    setTokens({ access: response.data.access, refresh: response.data.refresh });
    if (response.data.user) {
      setUser(response.data.user);
      return response.data.user;
    }
    return refreshMe();
  };

  const register = async ({ email, password, full_name, role, department, phone }) => {
    const response = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/"}auth/register/`,
      { email, password, full_name, role, department, phone }
    );
    setTokens({ access: response.data.access, refresh: response.data.refresh });
    setUser(response.data.user);
    return response.data.user;
  };

  const logout = () => {
    clearTokens();
    setUser(null);
  };

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        await refreshMe();
      } catch {
        clearTokens();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const value = { user, loading, login, register, logout, refreshMe };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
