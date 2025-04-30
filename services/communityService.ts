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
import { Community } from '@/data/communities';

const COLLECTION_NAME = 'communities';

// Get all communities from Firestore
export const getCommunities = async (): Promise<Community[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Community[];
  } catch (error) {
    console.error('Error getting communities:', error);
    throw error;
  }
};

// Get a community by ID from Firestore
export const getCommunityById = async (id: string): Promise<Community | null> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as Community;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting community by ID:', error);
    throw error;
  }
};

// Add a new community to Firestore
export const addCommunity = async (community: Omit<Community, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), community);
    return docRef.id;
  } catch (error) {
    console.error('Error adding community:', error);
    throw error;
  }
};

// Update an existing community in Firestore
export const updateCommunity = async (id: string, community: Partial<Community>): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, community);
  } catch (error) {
    console.error('Error updating community:', error);
    throw error;
  }
};

// Delete a community from Firestore
export const deleteCommunity = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting community:', error);
    throw error;
  }
};

// Upload a community image to Firebase Storage
export const uploadCommunityImage = async (uri: string, fileName: string): Promise<string> => {
  try {
    // Create a reference to the file in Firebase Storage
    const storageRef = ref(storage, `communities/${fileName}`);
    
    // Fetch the image from the URI
    const response = await fetch(uri);
    const blob = await response.blob();
    
    // Upload the image to Firebase Storage
    const snapshot = await uploadBytes(storageRef, blob);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading community image:', error);
    throw error;
  }
};

// Search for communities by category
export const searchCommunitiesByCategory = async (category: string): Promise<Community[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME), 
      where('categories', 'array-contains', category)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Community[];
  } catch (error) {
    console.error('Error searching communities by category:', error);
    throw error;
  }
};
