import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";
import { defaultInstitution } from "../config/institution";

const InstitutionContext = createContext(null);

export const InstitutionProvider = ({ children }) => {
  const [institution, setInstitution] = useState(defaultInstitution);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const res = await api.get("/settings");
      if (res.success && res.data) {
        setInstitution((prev) => ({
          ...prev,
          name: res.data.institutionName || prev.name,
          shortName: res.data.shortName || prev.shortName,
          productName: res.data.productName || prev.productName,
          tagline: res.data.tagline || prev.tagline,
          logo: res.data.logo || prev.logo,
          favicon: res.data.favicon || prev.favicon,
          website: res.data.website || prev.website,
          email: res.data.email || prev.email,
          phone: res.data.phone || prev.phone,
          address: res.data.address || prev.address,
          footerText: res.data.footerText || prev.footerText,
          theme: {
            ...prev.theme,
            primaryColor: res.data.primaryColor || prev.theme.primaryColor,
            secondaryColor: res.data.secondaryColor || prev.theme.secondaryColor,
            accentColor: res.data.accentColor || prev.theme.accentColor
          },
          certificateSigners: res.data.certificateSigners || []
        }));
      }
    } catch (err) {
      console.warn("Using default institution configuration:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <InstitutionContext.Provider
      value={{
        institution,
        departments: defaultInstitution.departments,
        academicYears: defaultInstitution.academicYears,
        categories: defaultInstitution.categories,
        refreshSettings: fetchSettings,
        loading
      }}
    >
      {children}
    </InstitutionContext.Provider>
  );
};

export const useInstitution = () => {
  const context = useContext(InstitutionContext);
  if (!context) {
    throw new Error("useInstitution must be used within an InstitutionProvider");
  }
  return context;
};
