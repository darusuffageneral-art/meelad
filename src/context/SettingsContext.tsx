import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppSettings, subscribeSettings } from '../services/settingsService';

const defaultSettings: AppSettings = {
  appName: 'SPRING MEELAD ART FEST',
  teamAName: 'Cairo',
  teamBName: 'Cordoba'
};

const SettingsContext = createContext<AppSettings>(defaultSettings);

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  useEffect(() => {
    const unsubscribe = subscribeSettings((newSettings) => {
      setSettings(newSettings);
    });
    return () => unsubscribe();
  }, []);

  return (
    <SettingsContext.Provider value={settings}>
      {children}
    </SettingsContext.Provider>
  );
};
