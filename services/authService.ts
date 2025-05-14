import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User as FirebaseUser,
  onAuthStateChanged,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../config/firebase';

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role?: string;
}

/**
 * Register a new user with email and password
 */
export const registerUser = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Create user document in Firestore with role "user"
    await setDoc(doc(db, 'users', user.uid), {
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      role: 'user',
      createdAt: new Date()
    });
    
    return {
      ...mapFirebaseUser(user),
      role: 'user'
    };
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

/**
 * Sign in a user with email and password
 */
export const signInUser = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Get user role from Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const role = userDoc.exists() ? userDoc.data().role : null;
    
    return {
      ...mapFirebaseUser(user),
      role
    };
  } catch (error) {
    console.error('Error signing in user:', error);
    throw error;
  }
};

/**
 * Sign out the current user
 */
export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out user:', error);
    throw error;
  }
};

/**
 * Send a password reset email
 */
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

/**
 * Update user profile (display name and/or photo URL)
 */
export const updateUserProfile = async (displayName?: string, photoURL?: string): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No user is currently signed in');
    }
    
    await updateProfile(user, {
      displayName: displayName || user.displayName,
      photoURL: photoURL || user.photoURL
    });
    
    // Update user document in Firestore
    if (displayName || photoURL) {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        await setDoc(userRef, {
          ...userData,
          displayName: displayName || userData.displayName,
          photoURL: photoURL || userData.photoURL,
          updatedAt: new Date()
        }, { merge: true });
      }
    }
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

/**
 * Upload a user profile image to Firebase Storage and return the download URL
 */
export const uploadUserProfileImage = async (uri: string): Promise<string> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No user is currently signed in');
    }

    // Generate a unique filename using user ID and timestamp
    const fileName = `${user.uid}_${new Date().getTime()}`;
    
    // Convert URI to blob
    const response = await fetch(uri);
    const blob = await response.blob();
    
    // Create a reference to the file location
    const storageRef = ref(storage, `users/${fileName}`);
    
    // Upload the blob
    await uploadBytes(storageRef, blob);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading profile image:', error);
    throw error;
  }
};

/**
 * Update user password
 */
export const updateUserPassword = async (currentPassword: string, newPassword: string): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user || !user.email) {
      throw new Error('No user is currently signed in or user has no email');
    }
    
    // Reauthenticate user before changing password
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    
    // Update password
    await updatePassword(user, newPassword);
  } catch (error) {
    console.error('Error updating password:', error);
    throw error;
  }
};

/**
 * Get the current user
 */
export const getCurrentUser = async (): Promise<User | null> => {
  const user = auth.currentUser;
  if (!user) return null;
  
  try {
    // Get user role from Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const role = userDoc.exists() ? userDoc.data().role : null;
    
    return {
      ...mapFirebaseUser(user),
      role
    };
  } catch (error) {
    console.error('Error getting user data:', error);
    return mapFirebaseUser(user);
  }
};

/**
 * Subscribe to auth state changes
 */
export const onAuthStateChange = (callback: (user: User | null) => void): (() => void) => {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      try {
        // Get user role from Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        const role = userDoc.exists() ? userDoc.data().role : null;
        
        callback({
          ...mapFirebaseUser(firebaseUser),
          role
        });
      } catch (error) {
        console.error('Error getting user data:', error);
        callback(mapFirebaseUser(firebaseUser));
      }
    } else {
      callback(null);
    }
  });
};

/**
 * Get user role
 */
export const getUserRole = async (uid: string): Promise<string | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    return userDoc.exists() ? userDoc.data().role : null;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
};

/**
 * Map Firebase user to our User interface
 */
const mapFirebaseUser = (firebaseUser: FirebaseUser): User => {
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL
  };
};
