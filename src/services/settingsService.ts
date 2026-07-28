import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

const SETTINGS_DOC_ID = 'general';
const SETTINGS_COLLECTION = 'settings';

export interface AppSettings {
  appName: string;
  teamAName: string;
  teamBName: string;
}

const defaultSettings: AppSettings = {
  appName: 'SPRING MEELAD ART FEST',
  teamAName: 'Cairo',
  teamBName: 'Cordoba'
};

export const getSettings = async (): Promise<AppSettings> => {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as AppSettings;
    } else {
      await setDoc(docRef, defaultSettings);
      return defaultSettings;
    }
  } catch (error) {
    console.error('Error fetching settings:', error);
    return defaultSettings;
  }
};

export const updateSettings = async (settings: AppSettings): Promise<void> => {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
    await setDoc(docRef, settings, { merge: true });
  } catch (error) {
    console.error('Error updating settings:', error);
    throw error;
  }
};

export const subscribeSettings = (callback: (settings: AppSettings) => void) => {
  const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data() as AppSettings);
      } else {
        callback(defaultSettings);
      }
    },
    (error) => {
      console.error('Error listening to settings:', error);
      callback(defaultSettings);
    }
  );
};
