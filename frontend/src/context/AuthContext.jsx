import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";
import { mockUsers } from "../services/mockData";

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
      const savedUser = localStorage.getItem("joy_hub_user");

      if (savedToken) {
        // If logged in via demo fallback token
        if (savedToken.startsWith("joy_demo_token_") && savedUser) {
          try {
            setUser(JSON.parse(savedUser));
          } catch {}
          setLoading(false);
          return;
        }

        try {
          const res = await api.get("/auth/me");
          if (res.success && res.user) {
            setUser(res.user);
            localStorage.setItem("joy_hub_user", JSON.stringify(res.user));
          }
        } catch (err) {
          console.warn("Auth initialization failed:", err.message);
          if (!savedUser) logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post("/auth/login", { email, password });
      if (res.success && res.token) {
        setToken(res.token);
        setUser(res.user);
        localStorage.setItem("joy_hub_token", res.token);
        localStorage.setItem("joy_hub_user", JSON.stringify(res.user));
        return res.user;
      }
      throw new Error(res.message || "Login failed.");
    } catch (err) {
      // If backend is offline or unattached on static cloud host (e.g. 404, 405, Network Error), provide instant demo login!
      const isUnreachable =
        err.message?.includes("404") ||
        err.message?.includes("405") ||
        err.message?.includes("Network Error") ||
        err.message?.includes("HTML");

      if (isUnreachable) {
        const cleanEmail = (email || "").trim().toLowerCase();
        const demo = mockUsers[cleanEmail];
        if (demo) {
          console.info(`[JOY Hub] Backend server offline. Activated demo evaluation session for ${cleanEmail}.`);
          const fakeToken = "joy_demo_token_" + Date.now();
          setToken(fakeToken);
          setUser(demo);
          localStorage.setItem("joy_hub_token", fakeToken);
          localStorage.setItem("joy_hub_user", JSON.stringify(demo));
          return demo;
        }
      }
      throw err;
    }
  };

  const register = async (formData) => {
    try {
      const res = await api.post("/auth/register", formData);
      if (res.success && res.token) {
        setToken(res.token);
        setUser(res.user);
        localStorage.setItem("joy_hub_token", res.token);
        localStorage.setItem("joy_hub_user", JSON.stringify(res.user));
        return res.user;
      }
      throw new Error(res.message || "Registration failed.");
    } catch (err) {
      const isUnreachable =
        err.message?.includes("404") ||
        err.message?.includes("405") ||
        err.message?.includes("Network Error");

      if (isUnreachable) {
        const mockStudent = {
          _id: "demo_new_student_" + Date.now(),
          name: formData.name || "New JOY Student",
          email: formData.email,
          role: "student",
          phone: formData.phone || "+91 98765 00000"
        };
        const fakeToken = "joy_demo_token_" + Date.now();
        setToken(fakeToken);
        setUser(mockStudent);
        localStorage.setItem("joy_hub_token", fakeToken);
        localStorage.setItem("joy_hub_user", JSON.stringify(mockStudent));
        return mockStudent;
      }
      throw err;
    }
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
