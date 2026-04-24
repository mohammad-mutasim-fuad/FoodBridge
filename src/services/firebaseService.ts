import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  type Auth,
  type User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  type Firestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';

// Firebase Configuration
// Get these values from your Firebase Console > Project Settings
// Store them in .env file with VITE_ prefix
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Validate that all required config values are present
if (
  !firebaseConfig.apiKey ||
  !firebaseConfig.authDomain ||
  !firebaseConfig.projectId ||
  !firebaseConfig.appId
) {
  console.error(
    'Firebase configuration is incomplete. Please ensure all VITE_FIREBASE_* environment variables are set in .env file.'
  );
}



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
    const userData = {
      uid: user.uid,
      email: user.email,
      role,
      organizationName,
      organizationType: organizationType || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    // Use lowercase 'users' collection
    console.log('Creating user doc in "users" (lowercase) with UID:', user.uid);
    const userDocRef = doc(firestore, 'users', user.uid);
    await setDoc(userDocRef, userData);

    return user;
  } catch (error: any) {
    console.error('Signup error:', error);
    throw new Error(error.message || 'Error creating user account');
  }
};

/**
 * Sign in an existing user with email and password
 */
export const signIn = async (email: string, password: string): Promise<FirebaseUser> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('Signed in user UID:', userCredential.user.uid);
    return userCredential.user;
  } catch (error: any) {
    console.error('Sign in error:', error);
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

export type { FirebaseUser };

// ============ Firestore Functions ============

/**
 * Get user document by UID - try both uppercase and lowercase collection names
 */
export const getUserByUID = async (uid: string) => {
  // First, try getting by UID from both collections
  const collections = ['Users', 'users'];
  
  for (const collName of collections) {
    try {
      console.log(`Trying collection "${collName}" with UID:`, uid);
      const userDocRef = doc(firestore, collName, uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const data = userDoc.data();
        console.log(`Found user in "${collName}":`, data);
        return data;
      }
    } catch (e: any) {
      console.log(`Error reading from "${collName}":`, e.message);
    }
  }
  
  // If not found, query by email from both collections
  console.log('Not found by UID, trying to query by email:', uid);
  for (const collName of collections) {
    try {
      console.log(`Querying collection "${collName}" by email...`);
      const q = query(collection(firestore, collName), where('email', '==', uid));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        console.log(`Found user by email in "${collName}":`, snapshot.docs[0].data());
        return snapshot.docs[0].data();
      }
    } catch (e: any) {
      console.log(`Query by email failed in "${collName}":`, e.message);
    }
  }
  
  console.log('User document NOT found in any collection');
  return null;
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
 * Get all food listings - try both FoodListings and foodListings collections
 */
export const getAllFoodListings = async () => {
  try {
    // Try 'FoodListings' collection first
    let querySnapshot = await getDocs(collection(firestore, 'FoodListings'));
    if (!querySnapshot.empty) {
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    }
    
    // Try 'foodListings' collection
    querySnapshot = await getDocs(collection(firestore, 'foodListings'));
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error: any) {
    console.error('Error fetching food listings:', error);
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
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        donorId: data.donorId,
        foodItemName: data.foodItemName,
        quantity: data.quantity,
        expirationTime: data.expirationTime,
        pickupLocation: data.pickupLocation,
        status: data.status,
        claimedBy: data.claimedBy,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      };
    });
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
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        donorId: data.donorId,
        foodItemName: data.foodItemName,
        quantity: data.quantity,
        expirationTime: data.expirationTime,
        pickupLocation: data.pickupLocation,
        status: data.status,
        claimedBy: data.claimedBy,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      };
    });
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
 * Delete food listing - try both collections
 */
export const deleteFoodListing = async (listingId: string) => {
  try {
    try {
      await deleteDoc(doc(firestore, 'FoodListings', listingId));
    } catch {
      await deleteDoc(doc(firestore, 'foodListings', listingId));
    }
  } catch (error: any) {
    throw new Error(error.message || 'Error deleting food listing');
  }
};

/**
 * Delete user (admin only) - try both collections
 */
export const deleteUser = async (userId: string) => {
  try {
    try {
      await deleteDoc(doc(firestore, 'Users', userId));
    } catch {
      await deleteDoc(doc(firestore, 'users', userId));
    }
  } catch (error: any) {
    throw new Error(error.message || 'Error deleting user');
  }
};

/**
 * Get all users (admin only) - try both Users and users collections
 */
export const getAllUsers = async () => {
  try {
    // Try 'Users' collection first
    let querySnapshot = await getDocs(collection(firestore, 'Users'));
    if (!querySnapshot.empty) {
      return querySnapshot.docs.map((doc) => ({
        uid: doc.id,
        ...doc.data(),
      }));
    }
    
    // Try 'users' collection
    querySnapshot = await getDocs(collection(firestore, 'users'));
    return querySnapshot.docs.map((doc) => ({
      uid: doc.id,
      ...doc.data(),
    }));
  } catch (error: any) {
    console.error('Error fetching users:', error);
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
