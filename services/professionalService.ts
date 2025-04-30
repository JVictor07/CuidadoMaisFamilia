import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { Professional } from '@/data/professionals';

const COLLECTION_NAME = 'professionals';

/**
 * Get all professionals from Firestore
 */
export const getAllProfessionals = async (): Promise<Professional[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Professional));
  } catch (error) {
    console.error('Error getting professionals:', error);
    throw error;
  }
};

/**
 * Get a professional by ID
 */
export const getProfessionalById = async (id: string): Promise<Professional | null> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as Professional;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting professional:', error);
    throw error;
  }
};

/**
 * Add a new professional to Firestore
 */
export const addProfessional = async (professional: Omit<Professional, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), professional);
    return docRef.id;
  } catch (error) {
    console.error('Error adding professional:', error);
    throw error;
  }
};

/**
 * Update a professional in Firestore
 */
export const updateProfessional = async (id: string, data: Partial<Professional>): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, data);
  } catch (error) {
    console.error('Error updating professional:', error);
    throw error;
  }
};

/**
 * Delete a professional from Firestore
 */
export const deleteProfessional = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting professional:', error);
    throw error;
  }
};

/**
 * Upload an image to Firebase Storage and return the download URL
 */
export const uploadProfessionalImage = async (uri: string, fileName: string): Promise<string> => {
  try {
    // Convert URI to blob
    const response = await fetch(uri);
    const blob = await response.blob();
    
    // Create a reference to the file location
    const storageRef = ref(storage, `professionals/${fileName}`);
    
    // Upload the blob
    await uploadBytes(storageRef, blob);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

/**
 * Search professionals by specialty in the specialties array
 */
export const searchProfessionalsBySpecialty = async (specialty: string): Promise<Professional[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME), 
      where("specialties", "array-contains", specialty)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Professional));
  } catch (error) {
    console.error('Error searching professionals by specialties:', error);
    throw error;
  }
};
