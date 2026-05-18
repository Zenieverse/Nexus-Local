import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, getDocs, writeBatch } from 'firebase/firestore';

interface SettingsState {
  offlineMode: boolean;
  episodicForgetting: boolean;
  encryptedRetrieval: boolean;
  autonomousTools: boolean;
  cloudAugmentation: boolean;
  vramLimit: number;
}

interface SettingsContextType {
  settings: SettingsState;
  updateSetting: (key: keyof SettingsState, value: any) => void;
  purgeMemories: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SettingsState>(() => {
    const saved = localStorage.getItem('nexus_settings');
    return saved ? JSON.parse(saved) : {
      offlineMode: true,
      episodicForgetting: false,
      encryptedRetrieval: true,
      autonomousTools: true,
      cloudAugmentation: false,
      vramLimit: 8,
    };
  });

  useEffect(() => {
    localStorage.setItem('nexus_settings', JSON.stringify(settings));
  }, [settings]);

  const updateSetting = (key: keyof SettingsState, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const purgeMemories = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    try {
      const q = query(collection(db, 'memories'), where('userId', '==', userId));
      const snapshot = await getDocs(q);
      const batch = writeBatch(db);
      snapshot.docs.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
      console.log("Semantic index purged successfully.");
    } catch (e) {
      console.error("Purge failed:", e);
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSetting, purgeMemories }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within SettingsProvider');
  return context;
};
