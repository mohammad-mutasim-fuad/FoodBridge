// User Types
export interface User {
  uid: string;
  email: string;
  role: 'Donor' | 'Receiver' | 'Admin';
  organizationName: string;
  organizationType?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Food Listing Types
export interface FoodListing {
  id: string;
  donorId: string;
  foodItemName: string;
  quantity: number;
  expirationTime: Date;
  pickupLocation: string;
  status: 'Available' | 'Claimed';
  claimedBy?: string; // receiverId if claimed
  createdAt: Date;
  updatedAt: Date;
}

// Claims Types
export interface Claim {
  id: string;
  receiverId: string;
  foodListingId: string;
  claimedAt: Date;
}

// Auth Context Types
export interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  signup: (email: string, password: string, role: 'Donor' | 'Receiver', organizationName: string, organizationType?: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}
