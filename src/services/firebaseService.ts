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
  orderBy,
  updateDoc,
  deleteDoc,
  addDoc,
  serverTimestamp,
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
 * Get multiple users by their IDs
 */
export const getUsersByIds = async (userIds: string[]) => {
  const users: { [key: string]: string } = {};
  const collections = ['Users', 'users'];
  
  for (const userId of userIds) {
    for (const collName of collections) {
      try {
        const userDocRef = doc(firestore, collName, userId);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const data = userDoc.data();
          users[userId] = data.organizationName || userId;
          break;
        }
      } catch {
        continue;
      }
    }
    if (!users[userId]) {
      users[userId] = userId.substring(0, 8) + '...';
    }
  }
  
  return users;
};

/**
 * Create a new food listing
 */
export const createFoodListing = async (
  donorId: string,
  donorOrganizationName: string,
  foodItemName: string,
  quantity: number,
  expirationTime: Date,
  pickupLocation: string,
  pickupLat?: number,
  pickupLng?: number
) => {
  try {
    const newListing = {
      donorId,
      donorOrganizationName,
      foodItemName,
      quantity,
      expirationTime,
      pickupLocation,
      pickupLat: pickupLat || null,
      pickupLng: pickupLng || null,
      deliveryLat: null,
      deliveryLng: null,
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
        donorOrganizationName: data.donorOrganizationName || '',
        foodItemName: data.foodItemName,
        quantity: data.quantity,
        expirationTime: data.expirationTime,
        pickupLocation: data.pickupLocation,
        pickupLat: data.pickupLat || null,
        pickupLng: data.pickupLng || null,
        deliveryLat: data.deliveryLat || null,
        deliveryLng: data.deliveryLng || null,
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
        donorOrganizationName: data.donorOrganizationName || '',
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
  pickupLocation: string,
  pickupLat?: number,
  pickupLng?: number
) => {
  try {
    const updateData: any = {
      foodItemName,
      quantity,
      expirationTime,
      pickupLocation,
      updatedAt: new Date(),
    };
    
    if (pickupLat !== undefined) updateData.pickupLat = pickupLat;
    if (pickupLng !== undefined) updateData.pickupLng = pickupLng;
    
    await updateDoc(doc(firestore, 'FoodListings', listingId), updateData);
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

/**
 * Get or create a conversation between donor and receiver for a food listing
 */
export const getOrCreateConversation = async (
  donorId: string,
  donorName: string,
  receiverId: string,
  receiverName: string,
  foodListingId: string,
  foodItemName: string
) => {
  try {
    // First try to find existing conversation
    const q = query(
      collection(firestore, 'Conversations'),
      where('foodListingId', '==', foodListingId)
    );
    const snapshot = await getDocs(q);
    
    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      if (
        (data.participants.donorId === donorId && data.participants.receiverId === receiverId) ||
        (data.participants.donorId === receiverId && data.participants.receiverId === donorId)
      ) {
        return { id: docSnap.id, ...data };
      }
    }

    // Create new conversation
    const newConversation = {
      participants: {
        donorId,
        donorName,
        receiverId,
        receiverName,
      },
      foodListingId,
      foodItemName,
      updatedAt: new Date(),
    };

    const docRef = await addDoc(collection(firestore, 'Conversations'), newConversation);
    return { id: docRef.id, ...newConversation };
  } catch (error: any) {
    throw new Error(error.message || 'Error creating conversation');
  }
};

/**
 * Get conversations for a user
 */
export const getConversationsByUserId = async (userId: string): Promise<any[]> => {
  try {
    const q = query(
      collection(firestore, 'Conversations'),
      orderBy('updatedAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .filter((conv: any) => 
        conv.participants?.donorId === userId || conv.participants?.receiverId === userId
      );
  } catch (error: any) {
    throw new Error(error.message || 'Error fetching conversations');
  }
};

/**
 * Send a message in a conversation
 */
export const sendMessage = async (
  conversationId: string,
  senderId: string,
  senderName: string,
  senderRole: 'Donor' | 'Receiver',
  content: string
) => {
  try {
    const message = {
      conversationId,
      senderId,
      senderName,
      senderRole,
      content,
      createdAt: serverTimestamp(),
      read: false,
    };

    const docRef = await addDoc(collection(firestore, 'Messages'), message);

    // Update conversation's last message
    await updateDoc(doc(firestore, 'Conversations', conversationId), {
      lastMessage: content,
      lastMessageAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return { id: docRef.id, ...message };
  } catch (error: any) {
    throw new Error(error.message || 'Error sending message');
  }
};

/**
 * Get messages for a conversation
 */
export const getMessagesByConversationId = async (conversationId: string): Promise<any[]> => {
  try {
    const q = query(
      collection(firestore, 'Messages'),
      where('conversationId', '==', conversationId)
    );
    const snapshot = await getDocs(q);
    const msgs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    // Sort messages by createdAt on client side
    return msgs.sort((a: any, b: any) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
      return dateA.getTime() - dateB.getTime();
    });
  } catch (error: any) {
    throw new Error(error.message || 'Error fetching messages');
  }
};

/**
 * Mark messages as read
 */
export const markMessagesAsRead = async (conversationId: string, userId: string) => {
  try {
    const q = query(
      collection(firestore, 'Messages'),
      where('conversationId', '==', conversationId),
      where('read', '==', false)
    );
    const snapshot = await getDocs(q);
    
    const updatePromises = snapshot.docs
      .filter((doc) => doc.data().senderId !== userId)
      .map((doc) => updateDoc(doc.ref, { read: true }));
    
    await Promise.all(updatePromises);
  } catch (error: any) {
    throw new Error(error.message || 'Error marking messages as read');
  }
};

/**
 * Get unread message count for a user
 */
export const getUnreadMessageCount = async (userId: string) => {
  try {
    const conversations = await getConversationsByUserId(userId);
    let unreadCount = 0;

    for (const conv of conversations) {
      const q = query(
        collection(firestore, 'Messages'),
        where('conversationId', '==', conv.id),
        where('read', '==', false)
      );
      const snapshot = await getDocs(q);
      const messages = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      unreadCount += messages.filter((m: any) => m.senderId !== userId).length;
    }

    return unreadCount;
  } catch (error: any) {
    return 0;
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
  getOrCreateConversation,
  getConversationsByUserId,
  sendMessage,
  getMessagesByConversationId,
  markMessagesAsRead,
  getUnreadMessageCount,
};
