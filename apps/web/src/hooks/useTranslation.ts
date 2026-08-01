import { useState, useEffect } from 'react';

const esTranslations = {
  // Navigation
  "nav.dashboard": "Dashboard",
  "nav.crm": "CRM Contactos",
  "nav.files": "Archivos y Adjuntos",
  "nav.forms": "Formularios",
  "nav.users": "Usuarios y Roles",
  "nav.emails": "Monitoreo de Correos",
  "nav.customfields": "Campos Personalizados",
  "nav.general": "General",
  
  // Interface common
  "btn.save": "Guardar",
  "btn.cancel": "Cancelar",
  "btn.add": "Añadir",
  "btn.delete": "Eliminar",
  "btn.invite": "Invitar",
  "btn.upload": "Subir",
  "btn.upgrade": "Mejorar Plan",
  
  // Titles / Description
  "theme.selector": "Personalización del SaaS",
  "theme.primary": "Color Primario",
  "theme.secondary": "Color Secundario",
  "dashboard.title": "Tablero de Analíticas"
};

const enTranslations = {
  // Navigation
  "nav.dashboard": "Dashboard",
  "nav.crm": "CRM Contacts",
  "nav.files": "Files & Attachments",
  "nav.forms": "Forms",
  "nav.users": "Users & Roles",
  "nav.emails": "Emails Monitor",
  "nav.customfields": "Custom Fields",
  "nav.general": "General",
  
  // Interface common
  "btn.save": "Save",
  "btn.cancel": "Cancel",
  "btn.add": "Add",
  "btn.delete": "Delete",
  "btn.invite": "Invite",
  "btn.upload": "Upload",
  "btn.upgrade": "Upgrade Plan",
  
  // Titles / Description
  "theme.selector": "SaaS Customization",
  "theme.primary": "Primary Color",
  "theme.secondary": "Secondary Color",
  "dashboard.title": "Analytics Dashboard"
};

export function useTranslation() {
  const [locale, setLocale] = useState<'es' | 'en'>('es');

  useEffect(() => {
    const saved = localStorage.getItem('locale') as 'es' | 'en';
    if (saved) setLocale(saved);
  }, []);

  const changeLanguage = (lang: 'es' | 'en') => {
    setLocale(lang);
    localStorage.setItem('locale', lang);
  };

  const t = (key: keyof typeof esTranslations) => {
    const dict = locale === 'es' ? esTranslations : enTranslations;
    return dict[key] || key;
  };

  return { t, locale, changeLanguage };
}
