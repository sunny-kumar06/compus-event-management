import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("joy_hub_user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem("joy_hub_token") || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem("joy_hub_token");
      if (savedToken) {
        try {
          const res = await api.get("/auth/me");
          if (res.success && res.user) {
            setUser(res.user);
            localStorage.setItem("joy_hub_user", JSON.stringify(res.user));
          }
        } catch (err) {
          console.error("Auth initialization failed:", err.message);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    if (res.success && res.token) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem("joy_hub_token", res.token);
      localStorage.setItem("joy_hub_user", JSON.stringify(res.user));
      return res.user;
    }
    throw new Error(res.message || "Login failed.");
  };

  const register = async (formData) => {
    const res = await api.post("/auth/register", formData);
    if (res.success && res.token) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem("joy_hub_token", res.token);
      localStorage.setItem("joy_hub_user", JSON.stringify(res.user));
      return res.user;
    }
    throw new Error(res.message || "Registration failed.");
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("joy_hub_token");
    localStorage.removeItem("joy_hub_user");
  };

  const updateUser = (updatedUserData) => {
    setUser(updatedUserData);
    localStorage.setItem("joy_hub_user", JSON.stringify(updatedUserData));
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAdmin: user?.role === "admin",
    isTeacher: user?.role === "teacher",
    isStudent: user?.role === "student"
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
