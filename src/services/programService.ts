import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Program } from '../types';

const PROGRAMS_COLLECTION = 'programs';

export const DEFAULT_PROGRAMS: Omit<Program, 'id'>[] = [
  { name: 'Pencil Drawing', category: 'All', gender: 'All' },
  { name: 'Oil Painting', category: 'All', gender: 'All' },
  { name: 'Water Color', category: 'All', gender: 'All' },
  { name: 'Clay Modeling', category: 'All', gender: 'All' },
  { name: 'Calligraphy', category: 'All', gender: 'All' },
  { name: 'Digital Art', category: 'All', gender: 'All' },
  { name: 'Poster Designing', category: 'All', gender: 'All' },
  { name: 'Collage Making', category: 'All', gender: 'All' },
  { name: 'Caricature Drawing', category: 'All', gender: 'All' },
  { name: 'Craft & Origami', category: 'All', gender: 'All' },
  { name: 'Light Music', category: 'All', gender: 'All' },
  { name: 'Classical Song', category: 'All', gender: 'All' },
  { name: 'Elocution', category: 'All', gender: 'All' },
  { name: 'Recitation', category: 'All', gender: 'All' },
  { name: 'Mime', category: 'All', gender: 'All' },
  { name: 'Monoact', category: 'All', gender: 'All' }
];

export const addProgram = async (programData: Omit<Program, 'id' | 'createdAt'>): Promise<string> => {
  try {
    const cleanData: Record<string, any> = {
      name: programData.name,
      category: programData.category || 'All',
      gender: programData.gender || 'All',
      createdAt: new Date().toISOString(),
      timestamp: serverTimestamp()
    };
    if (programData.codePrefix) {
      cleanData.codePrefix = programData.codePrefix;
    }

    const docRef = await addDoc(collection(db, PROGRAMS_COLLECTION), cleanData);
    return docRef.id;
  } catch (error) {
    console.error('Error adding program:', error);
    throw error;
  }
};

export const deleteProgram = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, PROGRAMS_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting program:', error);
    throw error;
  }
};

export const subscribePrograms = (callback: (programs: Program[]) => void) => {
  const colRef = collection(db, PROGRAMS_COLLECTION);
  const q = query(colRef);

  return onSnapshot(
    q,
    async (snapshot) => {
      const customPrograms: Program[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || '',
          category: data.category || 'All',
          gender: data.gender || 'All',
          codePrefix: data.codePrefix || '',
          createdAt: data.createdAt || new Date().toISOString()
        };
      });

      // Merge defaults with custom programs, ensuring no duplicates by name
      const allProgramNames = new Set(customPrograms.map((p) => p.name.toLowerCase()));
      const defaultsToAdd: Program[] = DEFAULT_PROGRAMS.filter(
        (def) => !allProgramNames.has(def.name.toLowerCase())
      ).map((def) => ({
        ...def,
        id: `default_${def.name.toLowerCase().replace(/\s+/g, '_')}`
      }));

      const merged = [...customPrograms, ...defaultsToAdd];
      merged.sort((a, b) => a.name.localeCompare(b.name));
      callback(merged);
    },
    (error) => {
      console.error('Error listening to programs:', error);
      // Fallback to default programs on error
      callback(
        DEFAULT_PROGRAMS.map((def) => ({
          ...def,
          id: `default_${def.name.toLowerCase().replace(/\s+/g, '_')}`
        }))
      );
    }
  );
};
