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
  donorOrganizationName?: string;
  foodItemName: string;
  quantity: number;
  expirationTime: Date;
  pickupLocation: string;
  pickupLat?: number;
  pickupLng?: number;
  deliveryLat?: number;
  deliveryLng?: number;
  status: 'Available' | 'Claimed';
  claimedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Route Types
export interface RoutePoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: 'pickup' | 'delivery';
  order: number;
}

export interface OptimizedRoute {
  points: RoutePoint[];
  totalDistance: number;
  estimatedTime: number;
}

// Claims Types
export interface Claim {
  id: string;
  receiverId: string;
  foodListingId: string;
  claimedAt: Date;
}

// Messaging Types
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: 'Donor' | 'Receiver';
  content: string;
  createdAt: Date;
  read: boolean;
}

export interface Conversation {
  id: string;
  participants: {
    donorId: string;
    donorName: string;
    receiverId: string;
    receiverName: string;
  };
  foodListingId: string;
  foodItemName: string;
  lastMessage?: string;
  lastMessageAt?: Date;
  updatedAt: Date;
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
