import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Participant, Team } from '../types';

const PARTICIPANTS_COLLECTION = 'participants';

export const addParticipant = async (
  data: Omit<Participant, 'id' | 'createdAt'>
): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, PARTICIPANTS_COLLECTION), {
      ...data,
      createdAt: new Date().toISOString(),
      timestamp: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding participant:', error);
    throw error;
  }
};

export const updateParticipant = async (
  id: string,
  data: Partial<Omit<Participant, 'id'>>
): Promise<void> => {
  try {
    const docRef = doc(db, PARTICIPANTS_COLLECTION, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating participant:', error);
    throw error;
  }
};

export const deleteParticipant = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, PARTICIPANTS_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting participant:', error);
    throw error;
  }
};

export const updateAttendanceStatus = async (
  id: string,
  status: 'Present' | 'Pending'
): Promise<void> => {
  try {
    const docRef = doc(db, PARTICIPANTS_COLLECTION, id);
    await updateDoc(docRef, {
      attendanceStatus: status,
      arrivedAt: status === 'Present' ? new Date().toISOString() : null,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating attendance status:', error);
    throw error;
  }
};

export const assignCompetitionToParticipant = async (
  participant: Participant,
  newCompetition: string
): Promise<void> => {
  try {
    const currentAssigned = Array.isArray(participant.assignedCompetitions)
      ? [...participant.assignedCompetitions]
      : participant.competitionName
      ? [participant.competitionName]
      : [];

    if (currentAssigned.includes(newCompetition)) {
      return; // Already assigned, avoid duplicate
    }

    const updatedAssigned = [...currentAssigned, newCompetition];
    const docRef = doc(db, PARTICIPANTS_COLLECTION, participant.id);

    await updateDoc(docRef, {
      assignedCompetitions: updatedAssigned,
      competitionName: updatedAssigned[0] || newCompetition,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error assigning competition:', error);
    throw error;
  }
};

export const removeCompetitionFromParticipant = async (
  participant: Participant,
  compToRemove: string
): Promise<void> => {
  try {
    const currentAssigned = Array.isArray(participant.assignedCompetitions)
      ? participant.assignedCompetitions
      : participant.competitionName
      ? [participant.competitionName]
      : [];

    const updatedAssigned = currentAssigned.filter((c) => c !== compToRemove);
    const docRef = doc(db, PARTICIPANTS_COLLECTION, participant.id);

    await updateDoc(docRef, {
      assignedCompetitions: updatedAssigned,
      competitionName: updatedAssigned[0] || '',
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error removing competition:', error);
    throw error;
  }
};

export const subscribeParticipants = (
  teamFilter: Team | 'All',
  callback: (participants: Participant[]) => void
) => {
  const colRef = collection(db, PARTICIPANTS_COLLECTION);
  let q = query(colRef);

  if (teamFilter !== 'All') {
    q = query(colRef, where('team', '==', teamFilter));
  }

  return onSnapshot(
    q,
    (snapshot) => {
      const participants: Participant[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        const shortDocId = doc.id.slice(-5).toUpperCase();
        return {
          id: doc.id,
          studentName: data.studentName || '',
          class: data.class || '',
          category: data.category || 'Junior',
          gender: data.gender || 'Boys',
          competitionName: data.competitionName || (Array.isArray(data.assignedCompetitions) && data.assignedCompetitions[0] ? data.assignedCompetitions[0] : ''),
          assignedCompetitions: Array.isArray(data.assignedCompetitions)
            ? data.assignedCompetitions
            : (data.competitionName ? [data.competitionName] : []),
          team: data.team || 'Cairo',
          codeLetter: data.codeLetter || '',
          photoUrl: data.photoUrl || '',
          registrationNumber: data.registrationNumber || (data.codeLetter ? `REG-${data.codeLetter}` : `REG-${shortDocId}`),
          attendanceStatus: data.attendanceStatus || 'Pending',
          arrivedAt: data.arrivedAt || undefined,
          createdAt: data.createdAt || new Date().toISOString()
        };
      });

      // Sort client-side by student name or creation date
      participants.sort((a, b) => a.studentName.localeCompare(b.studentName));
      callback(participants);
    },
    (error) => {
      console.error('Error listening to participants:', error);
    }
  );
};

export const seedSampleData = async (): Promise<number> => {
  const sampleStudents: Omit<Participant, 'id' | 'createdAt'>[] = [
    {
      studentName: 'Aarav Sharma',
      class: 'Class 5',
      category: 'Sub Junior',
      gender: 'Boys',
      competitionName: 'Pencil Drawing',
      team: 'Cairo'
    },
    {
      studentName: 'Ananya Patel',
      class: 'Class 4',
      category: 'Sub Junior',
      gender: 'Girls',
      competitionName: 'Water Color',
      team: 'Cairo'
    },
    {
      studentName: 'Rohan Verma',
      class: 'Class 7',
      category: 'Junior',
      gender: 'Boys',
      competitionName: 'Oil Painting',
      team: 'Cairo'
    },
    {
      studentName: 'Diya Nair',
      class: 'Class 8',
      category: 'Junior',
      gender: 'Girls',
      competitionName: 'Clay Modeling',
      team: 'Cairo'
    },
    {
      studentName: 'Vikram Sengupta',
      class: 'Class 10',
      category: 'Senior',
      gender: 'Boys',
      competitionName: 'Digital Art',
      team: 'Cairo'
    },
    {
      studentName: 'Ishani Roy',
      class: 'Class 11',
      category: 'Senior',
      gender: 'Girls',
      competitionName: 'Calligraphy',
      team: 'Cairo'
    },
    // Cordoba
    {
      studentName: 'Kabir Khan',
      class: 'Class 5',
      category: 'Sub Junior',
      gender: 'Boys',
      competitionName: 'Pencil Drawing',
      team: 'Cordoba'
    },
    {
      studentName: 'Meera Rao',
      class: 'Class 3',
      category: 'Sub Junior',
      gender: 'Girls',
      competitionName: 'Collage Making',
      team: 'Cordoba'
    },
    {
      studentName: 'Siddharth Joshi',
      class: 'Class 7',
      category: 'Junior',
      gender: 'Boys',
      competitionName: 'Oil Painting',
      team: 'Cordoba'
    },
    {
      studentName: 'Priya Sundaram',
      class: 'Class 8',
      category: 'Junior',
      gender: 'Girls',
      competitionName: 'Water Color',
      team: 'Cordoba'
    },
    {
      studentName: 'Aditya Gupta',
      class: 'Class 12',
      category: 'Senior',
      gender: 'Boys',
      competitionName: 'Poster Designing',
      team: 'Cordoba'
    },
    {
      studentName: 'Tara Deshmukh',
      class: 'Class 11',
      category: 'Senior',
      gender: 'Girls',
      competitionName: 'Clay Modeling',
      team: 'Cordoba'
    }
  ];

  let addedCount = 0;
  for (const student of sampleStudents) {
    await addParticipant(student);
    addedCount++;
  }
  return addedCount;
};
