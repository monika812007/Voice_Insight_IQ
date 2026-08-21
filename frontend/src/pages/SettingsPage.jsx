import React, { useState } from 'react';
import { Bell, Check, LogOut, Moon, Palette, Settings, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const SettingsPage = () => {
    const { theme, setTheme, accentColor, setAccentColor } = useTheme();
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [priceAlerts, setPriceAlerts] = useState(true);
    const [dealAlerts, setDealAlerts] = useState(true);
    const [searchHistory, setSearchHistory] = useState(true);
    const accents = [{ id: 'blue', label: 'Blue', color: '#2563eb' }, { id: 'purple', label: 'Purple', color: '#7c3aed' }, { id: 'cyan', label: 'Cyan', color: '#0891b2' }, { id: 'green', label: 'Green', color: '#16a34a' }, { id: 'orange', label: 'Orange', color: '#ea580c' }, { id: 'rose', label: 'Rose', color: '#e11d48' }];
    const options = [{ id: 'light', label: 'Light', icon: Sun }, { id: 'dark', label: 'Dark', icon: Moon }, { id: 'system', label: 'System', icon: Settings }];
    const toggle = (value, setter) => <button type="button" onClick={() => setter(!value)} className={`switch ${value ? 'on' : ''}`} aria-pressed={value}><span /></button>;

    return <div className="page-shell settings-page"><div className="section-heading"><div><p className="eyebrow">Personalize your workspace</p><h1>SETTINGS</h1><p>Control appearance, alerts, and account preferences.</p></div></div><section className="settings-panel"><div className="settings-section"><div className="settings-title"><Palette size={20} /><h2>Appearance</h2></div><h3>Theme</h3><div className="theme-options">{options.map(({ id, label, icon: Icon }) => <button type="button" key={id} onClick={() => setTheme(id)} className={`theme-option ${theme === id ? 'selected' : ''}`}><Icon size={18} />{label}{theme === id && <Check size={16} />}</button>)}</div><h3>Accent Color</h3><div className="accent-options">{accents.map((accent) => <button type="button" key={accent.id} onClick={() => setAccentColor(accent.id)} className={`accent-swatch ${accentColor === accent.id ? 'selected' : ''}`} style={{ '--swatch': accent.color }} aria-label={`Use ${accent.label} accent`} title={accent.label}><span />{accentColor === accent.id && <Check size={15} />}</button>)}</div></div><div className="settings-section"><div className="settings-title"><Bell size={20} /><h2>Notifications</h2></div><div className="setting-row"><div><strong>Price Drop Alerts</strong><span>Notify me when tracked prices fall.</span></div>{toggle(priceAlerts, setPriceAlerts)}</div><div className="setting-row"><div><strong>Deal Alerts</strong><span>Show relevant store deals and offers.</span></div>{toggle(dealAlerts, setDealAlerts)}</div></div><div className="settings-section"><div className="settings-title"><Settings size={20} /><h2>Privacy</h2></div><div className="setting-row"><div><strong>Search History</strong><span>Allow searches to be stored for your account.</span></div>{toggle(searchHistory, setSearchHistory)}</div></div><div className="settings-section account-actions"><button type="button" className="secondary-button" onClick={() => navigate('/profile')}>Profile</button><button type="button" className="secondary-button danger-hover" onClick={() => { logout(); navigate('/login'); }}><LogOut size={16} /> Logout</button></div></section></div>;
};
