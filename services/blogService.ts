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
import { Blog } from '@/data/blogs';

const COLLECTION_NAME = 'blogs';

// Get all blogs from Firestore
export const getBlogs = async (): Promise<Blog[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Blog[];
  } catch (error) {
    console.error('Error getting blogs:', error);
    throw error;
  }
};

// Get a blog by ID from Firestore
export const getBlogById = async (id: string): Promise<Blog | null> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as Blog;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting blog by ID:', error);
    throw error;
  }
};

// Add a new blog to Firestore
export const addBlog = async (blog: Omit<Blog, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), blog);
    return docRef.id;
  } catch (error) {
    console.error('Error adding blog:', error);
    throw error;
  }
};

// Update an existing blog in Firestore
export const updateBlog = async (id: string, blog: Partial<Blog>): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, blog);
  } catch (error) {
    console.error('Error updating blog:', error);
    throw error;
  }
};

// Delete a blog from Firestore
export const deleteBlog = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting blog:', error);
    throw error;
  }
};

// Upload a blog image to Firebase Storage
export const uploadBlogImage = async (uri: string, fileName: string): Promise<string> => {
  try {
    // Create a reference to the file in Firebase Storage
    const storageRef = ref(storage, `blogs/${fileName}`);
    
    // Fetch the image from the URI
    const response = await fetch(uri);
    const blob = await response.blob();
    
    // Upload the image to Firebase Storage
    const snapshot = await uploadBytes(storageRef, blob);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading blog image:', error);
    throw error;
  }
};

// Search for blogs by category
export const searchBlogsByCategory = async (category: string): Promise<Blog[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME), 
      where('categories', 'array-contains', category)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Blog[];
  } catch (error) {
    console.error('Error searching blogs by category:', error);
    throw error;
  }
};
