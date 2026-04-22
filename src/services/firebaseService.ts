import { initializeApp } from 'firebase/app';
import {
  getAuth,
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  Firestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  deleteDoc,
  DocumentData,
  Query,
} from 'firebase/firestore';

// TODO: Replace with your actual Firebase configuration
// Get this from your Firebase Console -> Project Settings
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || 'YOUR_API_KEY',
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || 'YOUR_AUTH_DOMAIN',
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || 'YOUR_PROJECT_ID',
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || 'YOUR_STORAGE_BUCKET',
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || 'YOUR_MESSAGING_SENDER_ID',
  appId: process.env.REACT_APP_FIREBASE_APP_ID || 'YOUR_APP_ID',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth: Auth = getAuth(app);

// Initialize Firestore
export const firestore: Firestore = getFirestore(app);

// ============ Auth Functions ============

/**
 * Sign up a new user with email and password, then create user document
 */
export const signUp = async (
  email: string,
  password: string,
  role: 'Donor' | 'Receiver',
  organizationName: string,
  organizationType?: string
): Promise<FirebaseUser> => {
  try {
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Create user document in Firestore
    await setDoc(doc(firestore, 'Users', user.uid), {
      uid: user.uid,
      email: user.email,
      role,
      organizationName,
      organizationType: organizationType || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return user;
  } catch (error: any) {
    throw new Error(error.message || 'Error creating user account');
  }
};

/**
 * Sign in an existing user with email and password
 */
export const signIn = async (email: string, password: string): Promise<FirebaseUser> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    throw new Error(error.message || 'Error signing in');
  }
};

/**
 * Sign out the current user
 */
export const logout = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error: any) {
    throw new Error(error.message || 'Error signing out');
  }
};

/**
 * Send password reset email
 */
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    throw new Error(error.message || 'Error sending password reset email');
  }
};

/**
 * Listen to authentication state changes
 */
export const onAuthChange = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// ============ Firestore Functions ============

/**
 * Get user document by UID
 */
export const getUserByUID = async (uid: string) => {
  try {
    const userDoc = await getDoc(doc(firestore, 'Users', uid));
    return userDoc.exists() ? userDoc.data() : null;
  } catch (error: any) {
    throw new Error(error.message || 'Error fetching user');
  }
};

/**
 * Create a new food listing
 */
export const createFoodListing = async (
  donorId: string,
  foodItemName: string,
  quantity: number,
  expirationTime: Date,
  pickupLocation: string
) => {
  try {
    const newListing = {
      donorId,
      foodItemName,
      quantity,
      expirationTime,
      pickupLocation,
      status: 'Available',
      claimedBy: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = doc(collection(firestore, 'FoodListings'));
    await setDoc(docRef, newListing);
    return { id: docRef.id, ...newListing };
  } catch (error: any) {
    throw new Error(error.message || 'Error creating food listing');
  }
};

/**
 * Get all food listings
 */
export const getAllFoodListings = async () => {
  try {
    const querySnapshot = await getDocs(collection(firestore, 'FoodListings'));
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error: any) {
    throw new Error(error.message || 'Error fetching food listings');
  }
};

/**
 * Get available food listings (for receivers)
 */
export const getAvailableFoodListings = async () => {
  try {
    const q = query(collection(firestore, 'FoodListings'), where('status', '==', 'Available'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error: any) {
    throw new Error(error.message || 'Error fetching available food listings');
  }
};

/**
 * Get food listings by donor ID
 */
export const getFoodListingsByDonorID = async (donorId: string) => {
  try {
    const q = query(collection(firestore, 'FoodListings'), where('donorId', '==', donorId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error: any) {
    throw new Error(error.message || 'Error fetching donor listings');
  }
};

/**
 * Get food listings by receiver ID (claimed by)
 */
export const getFoodListingsByReceiverID = async (receiverId: string) => {
  try {
    const q = query(collection(firestore, 'FoodListings'), where('claimedBy', '==', receiverId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error: any) {
    throw new Error(error.message || 'Error fetching receiver claimed listings');
  }
};

/**
 * Update food listing status (e.g., claim food)
 */
export const updateFoodListingStatus = async (
  listingId: string,
  status: 'Available' | 'Claimed',
  claimedBy?: string
) => {
  try {
    const updateData: any = {
      status,
      updatedAt: new Date(),
    };
    if (claimedBy) {
      updateData.claimedBy = claimedBy;
    }

    await updateDoc(doc(firestore, 'FoodListings', listingId), updateData);
  } catch (error: any) {
    throw new Error(error.message || 'Error updating food listing');
  }
};

/**
 * Update food listing details
 */
export const updateFoodListing = async (
  listingId: string,
  foodItemName: string,
  quantity: number,
  expirationTime: Date,
  pickupLocation: string
) => {
  try {
    await updateDoc(doc(firestore, 'FoodListings', listingId), {
      foodItemName,
      quantity,
      expirationTime,
      pickupLocation,
      updatedAt: new Date(),
    });
  } catch (error: any) {
    throw new Error(error.message || 'Error updating food listing');
  }
};

/**
 * Delete food listing
 */
export const deleteFoodListing = async (listingId: string) => {
  try {
    await deleteDoc(doc(firestore, 'FoodListings', listingId));
  } catch (error: any) {
    throw new Error(error.message || 'Error deleting food listing');
  }
};

/**
 * Delete user (admin only)
 */
export const deleteUser = async (userId: string) => {
  try {
    // Delete user document
    await deleteDoc(doc(firestore, 'Users', userId));
    // Note: Firebase Auth user deletion requires current user auth, implement from client-side auth context
  } catch (error: any) {
    throw new Error(error.message || 'Error deleting user');
  }
};

/**
 * Get all users (admin only)
 */
export const getAllUsers = async () => {
  try {
    const querySnapshot = await getDocs(collection(firestore, 'Users'));
    return querySnapshot.docs.map((doc) => ({
      uid: doc.id,
      ...doc.data(),
    }));
  } catch (error: any) {
    throw new Error(error.message || 'Error fetching users');
  }
};

/**
 * Create a claim record
 */
export const createClaim = async (receiverId: string, foodListingId: string) => {
  try {
    const newClaim = {
      receiverId,
      foodListingId,
      claimedAt: new Date(),
    };

    const docRef = doc(collection(firestore, 'Claims'));
    await setDoc(docRef, newClaim);
    return { id: docRef.id, ...newClaim };
  } catch (error: any) {
    throw new Error(error.message || 'Error creating claim');
  }
};

/**
 * Get claims by receiver ID
 */
export const getClaimsByReceiverID = async (receiverId: string) => {
  try {
    const q = query(collection(firestore, 'Claims'), where('receiverId', '==', receiverId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error: any) {
    throw new Error(error.message || 'Error fetching claims');
  }
};

export default {
  auth,
  firestore,
  signUp,
  signIn,
  logout,
  resetPassword,
  onAuthChange,
  getUserByUID,
  createFoodListing,
  getAllFoodListings,
  getAvailableFoodListings,
  getFoodListingsByDonorID,
  getFoodListingsByReceiverID,
  updateFoodListingStatus,
  updateFoodListing,
  deleteFoodListing,
  deleteUser,
  getAllUsers,
  createClaim,
  getClaimsByReceiverID,
};
