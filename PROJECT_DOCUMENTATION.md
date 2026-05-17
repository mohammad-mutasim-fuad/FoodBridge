# FoodBridge - Project Documentation

## 📋 Project Overview

**FoodBridge** is a full-stack web application that connects food donors (restaurants, bakeries, event organizers) with verified receiving organizations (NGOs, shelters, community groups) to rescue surplus food and redistribute it to those in need.

### Mission
Minimize food waste, maximize community impact by creating a seamless platform for food donation and distribution.

---

## 🛠 Technologies Used

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.2.5 | UI Framework |
| React Router DOM | 7.14.2 | Client-side routing |
| React Hook Form | 7.73.1 | Form handling |
| React Toastify | 11.1.0 | Notifications |
| MUI (Material UI) | 9.0.0 | UI Component Library |
| Firebase | 12.12.1 | Backend services |
| Axios | 15.1 | HTTP Client |
| DOMPurify | 3.4.0 | HTML Sanitization |

### Development Tools
| Technology | Purpose |
|------------|---------|
| Vite | Build tool & dev server |
| TypeScript | Type safety |
| ESLint | Code linting |

### Backend Services (Firebase)
| Service | Use Case |
|--------|----------|
| Firebase Auth | User authentication |
| Firestore | NoSQL database |
| Firebase Storage (planned) | Image storage |

---

## 📁 Project Structure

```
foodbridge-frontend/
├── src/
│   ├── components/
│   │   ├── ErrorBoundary.tsx    # Error handling wrapper
│   │   ├── Layout.tsx          # App layout with sidebar
│   │   └── ProtectedRoute.tsx   # Route protection
│   ├── context/
│   │   └── AuthContext.tsx       # Authentication context
│   ├── hooks/
│   │   └── useAuth.ts          # Auth hook
│   ├── pages/
│   │   ├── LandingPage.tsx      # Public landing page
│   │   ├── LoginPage.tsx        # User login
│   │   ├── RegisterPage.tsx     # User registration
│   │   ├── UnauthorizedPage.tsx  # Access denied
│   │   ├── DonorDashboard.tsx    # Donor dashboard
│   │   ├── DonorCreateListing.tsx  # Create food listing
│   │   ├── DonorEditListing.tsx   # Edit food listing
│   │   ├── ReceiverDashboard.tsx   # Available food feed
│   │   ├── ReceiverClaimsHistory.tsx # Claimed items
│   │   ├── AdminDashboard.tsx    # Admin stats
│   │   ├── AdminUsers.tsx       # User management
│   │   └── AdminListings.tsx     # Listing management
│   ├── services/
│   │   └── firebaseService.ts   # Firebase operations
│   ├── types/
│   │   └── index.ts           # TypeScript types
│   ├── utils/
│   │   └── validators.ts      # Input validation
│   ├── App.tsx              # Main app component
│   └── main.tsx             # Entry point
├── .env                     # Firebase config
├── firestore.rules          # Firestore security rules
├── package.json             # Dependencies
├── tsconfig.json           # TypeScript config
└── vite.config.ts          # Vite config
```

---

## 🎯 Features

### 1. Authentication System
- **User Registration** with role selection (Donor/Receiver)
- **Email & Password Login**
- **Role-based Access Control**
- **Protected Routes** by role
- **Auto-redirect** to role-specific dashboard after login

### 2. Donor Features
| Feature | Description |
|---------|-------------|
| Create Food Listing | Add new food items with quantity, location, expiration |
| View Dashboard | See all your listings |
| Edit Listing | Modify available listings |
| Delete Listing | Remove listings |
| Track Claims | See who claimed your food |

### 3. Receiver Features
| Feature | Description |
|---------|-------------|
| Food Feed | Browse all available food items |
| Claim Food | Claim items for pickup |
| Claims History | View claimed items |
| Real-time Updates | See new listings as they appear |

### 4. Admin Features
| Feature | Description |
|---------|-------------|
| Dashboard Stats | View total users, donors, receivers, listings |
| User Management | View all users, delete users |
| Listing Management | View all listings, delete listings |

### 5. Public Features
- Landing page with platform information
- Registration flow
- Login flow

---

## 🔐 User Roles

| Role | Access | Collection |
|------|--------|-------------|
| Donor | `/donor/*` routes | Creates food listings |
| Receiver | `/receiver/*` routes | Claims food |
| Admin | `/admin/*` routes | Full platform access |

---

## 🗃 Database Schema

### Users Collection
```typescript
{
  uid: string;           // Firebase Auth UID
  email: string;        // User email
  role: 'Donor' | 'Receiver' | 'Admin';
  organizationName: string;
  organizationType?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### FoodListings Collection
```typescript
{
  id: string;              // Auto-generated
  donorId: string;         // Owner's UID
  foodItemName: string;
  quantity: number;
  expirationTime: Date;
  pickupLocation: string;
  status: 'Available' | 'Claimed';
  claimedBy?: string;       // Receiver's UID if claimed
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 🔧 Fixes Applied During Development

### 1. Login Redirect Issue
**Problem:** After successful login, user stayed on login page.

**Solution:** 
- Modified `AuthContext.tsx` to fetch user data immediately after login
- Added `useEffect` in `LoginPage.tsx` to detect auth state change and redirect
- Navigate to `/donor/dashboard`, `/receiver/dashboard`, or `/admin/dashboard` based on role

### 2. Firestore Collection Naming
**Problem:** User data not found because signup used lowercase `users` but reads queried uppercase `Users`.

**Solution:** 
- Updated all Firestore functions to try both collection names
- Added fallback searches for `Users`/`users` and `FoodListings`/`foodListings`

### 3. MUI v6 Breaking Changes
**Problem:** Grid, Box, and TextField components had deprecated props.

**Solution:**
- Replaced Grid with flexbox using Box
- Changed `display` prop to `sx` prop
- Changed `InputLabelProps` to `slotProps`

### 4. TypeScript Errors
**Problem:** Type mismatches in function return values.

**Solution:**
- Added explicit return types for `getFoodListingsByDonorID`, `getFoodListingsByReceiverID`
- Fixed unused imports

---

## 🚀 How to Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 🔗 Environment Variables

Create `.env` file with:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

---

## 📱 Responsive Design

The app is fully responsive and works on:
- Desktop 💻
- Tablet 📱
- Mobile 📱

---

## 🔒 Security

### Firestore Rules
- Currently: `allow read, write: if true` (open for testing)
- Recommended for production: Role-based access with authentication requirement

### Firebase Auth
- Email/password authentication
- UID stored in Firestore for user identification

---

## 📊 Admin Statistics

The admin dashboard shows:
- Total Users
- Food Donors count
- Receiving Organizations count
- Total Food Listings
- Available Items count
- Claimed Items count

---

## 🎨 UI/UX Features

- Material Design components
- Toast notifications for actions
- Loading spinners during data fetch
- Confirmation dialogs for deletions
- Form validation with error messages
- Role-based navigation sidebar

---

## 📄 License

This project is for educational/demo purposes.

---

## 👏 Credits

Built with React, MUI, and Firebase.