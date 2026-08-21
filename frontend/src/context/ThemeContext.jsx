import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);
const themes = ['light', 'dark', 'system'];
const accents = {
    blue: '#2563eb',
    purple: '#7c3aed',
    cyan: '#0891b2',
    green: '#16a34a',
    orange: '#ea580c',
    rose: '#e11d48',
};

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
    const [accentColor, setAccentColor] = useState(() => localStorage.getItem('accentColor') || 'blue');

    useEffect(() => {
        localStorage.setItem('theme', theme);
        localStorage.setItem('accentColor', accentColor);
        document.documentElement.dataset.theme = theme;
        document.documentElement.style.setProperty('--accent-primary', accents[accentColor]);
        document.documentElement.style.setProperty('--accent-light', `${accents[accentColor]}22`);
    }, [theme, accentColor]);

    return <ThemeContext.Provider value={{ theme, setTheme, accentColor, setAccentColor, themes, accents }}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
