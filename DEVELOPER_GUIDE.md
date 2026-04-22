# FoodBridge - Developer Reference Guide

**Quick lookup for developers working on FoodBridge**

---

## 📖 Architecture Overview

```
┌─────────────────────────────────────────────────┐
│                Browser (React App)              │
├─────────────────────────────────────────────────┤
│  Components          Pages          Hooks       │
│  ├─ Layout           ├─ Landing      ├─ useAuth │
│  ├─ ProtectedRoute   ├─ Login        └─ useFS   │
│  └─ ErrorBoundary    ├─ Register               │
│                      ├─ Donor*                 │
│                      ├─ Receiver*              │
│                      └─ Admin*                 │
├─────────────────────────────────────────────────┤
│  Context API (AuthContext) + Firestore Listeners
├─────────────────────────────────────────────────┤
│           Firebase SDK (firebaseService.ts)     │
│  ├─ Authentication                              │
│  ├─ Firestore Database                          │
│  └─ Firestore Rules (RBAC)                      │
├─────────────────────────────────────────────────┤
│      Firebase Backend (Cloud Services)          │
└─────────────────────────────────────────────────┘

* = Multiple pages per role
```

---

## 🔑 Key Concepts

### Authentication Flow
```
1. User submits form
   ↓
2. Frontend validation (validators.ts)
   ↓
3. Firebase Auth processes (firebaseService.ts)
   ↓
4. Firebase creates User doc in Firestore
   ↓
5. AuthContext updates with user data
   ↓
6. App redirects to appropriate dashboard
```

### Authorization Flow
```
1. User accesses route
   ↓
2. ProtectedRoute checks authentication
   ↓
3. AuthContext provides currentUser
   ↓
4. Role extracted from User doc (Firestore)
   ↓
5. Role compared against allowedRoles
   ↓
6. Access granted or denied
   ↓
7. Firestore Rules also enforce on backend
```

### Real-Time Data Flow
```
1. Component mounts
   ↓
2. useFirestoreListener hook starts listener
   ↓
3. Firestore sends initial snapshot + updates
   ↓
4. Data state updates in component
   ↓
5. React re-renders with new data
   ↓
6. Component unmounts
   ↓
7. Hook unsubscribes from listener
```

---

## 📁 File Organization & Responsibilities

### Components (`src/components/`)

**ErrorBoundary.tsx**
- Wraps entire app
- Catches React errors
- Shows error message
- Prevents white screen of death

**Layout.tsx**
- Main page wrapper
- Navbar with navigation
- User profile menu
- Footer with info
- Consistent styling

**ProtectedRoute.tsx**
- Checks authentication
- Verifies authorization
- Enforces role requirements
- Redirects to login/unauthorized

### Pages (`src/pages/`)

**Authentication Pages**
- `LandingPage.tsx` - Public landing for guests
- `LoginPage.tsx` - Sign-in form
- `RegisterPage.tsx` - Sign-up with role
- `UnauthorizedPage.tsx` - 403 error

**Donor Pages**
- `DonorDashboard.tsx` - Inventory management
- `DonorCreateListing.tsx` - Add food item
- `DonorEditListing.tsx` - Update food item

**Receiver Pages**
- `ReceiverDashboard.tsx` - Food feed
- `ReceiverClaimsHistory.tsx` - Claimed items

**Admin Pages**
- `AdminDashboard.tsx` - Statistics
- `AdminUsers.tsx` - User management
- `AdminListings.tsx` - Listing management

### Services (`src/services/`)

**firebaseService.ts** - All backend interactions
- Authentication methods (signup, signin, logout)
- User CRUD (create, read, update, delete)
- Listing CRUD (create, read, update, delete)
- Claim operations
- Real-time listeners

### Context (`src/context/`)

**AuthContext.tsx**
- Global auth state
- Current user information
- Loading/error states
- Auth methods (signup, login, logout)
- Provides to all components via useAuth

### Hooks (`src/hooks/`)

**useAuth.ts**
- Accesses AuthContext
- Error checking
- Simple wrapper for context consumer

**useFirestoreListener.ts**
- Real-time Firestore listeners
- Generic implementation
- Handles subscriptions
- Auto-cleanup on unmount

### Utils (`src/utils/`)

**validators.ts**
- Email format validation
- Password strength checking
- Number validation (quantity)
- Text validation (name, location)
- Date validation (expiration)
- XSS prevention (DOMPurify)
- Input sanitization

### Types (`src/types/`)

**index.ts**
- User interface
- FoodListing interface
- Claim interface
- AuthContextType interface

### App (`src/App.tsx`)

Main application component with:
- Material-UI theme setup
- ErrorBoundary wrapper
- AuthProvider wrapper
- Router with 13+ routes
- ToastContainer for notifications

---

## 🔄 Common Development Workflows

### Adding a New Page

1. Create file in `src/pages/NewPage.tsx`
2. Create component function
3. Import required hooks/services
4. Add route to `App.tsx` Router
5. Add link in navbar if needed
6. Wrap route with ProtectedRoute if needed

Example:
```typescript
// src/pages/NewPage.tsx
import { useAuth } from '../hooks/useAuth';

export default function NewPage() {
  const { currentUser } = useAuth();
  
  return (
    <div>
      {/* Your page content */}
    </div>
  );
}

// In App.tsx, add to router:
<Route element={<ProtectedRoute allowedRoles={['Donor']}><NewPage /></ProtectedRoute>} path="/donor/new-page" />
```

### Adding a New Database Collection

1. Define TypeScript interface in `src/types/index.ts`
2. Create service methods in `firebaseService.ts`
3. Add Firestore rules to `firestore.rules`
4. Use `createFoodListing()` pattern for consistency

Example in firestore.rules:
```javascript
match /NewCollections/{docId} {
  allow read: if isAuthenticated();
  allow create: if isAuthenticated() && isOwner(request.data.userId);
  allow update: if isAuthenticated() && isOwner(resource.data.userId);
  allow delete: if isAuthenticated() && getUserRole() == 'Admin';
}
```

### Adding Input Validation

1. Create validator function in `src/utils/validators.ts`
2. Export from validators.ts
3. Import in form component
4. Call validator on form submission
5. Show error message if validation fails

Example:
```typescript
// In validators.ts
export function isValidPhoneNumber(phone: string): boolean {
  return /^\d{10}$/.test(phone.replace(/\D/g, ''));
}

// In form component
import { isValidPhoneNumber } from '../utils/validators';

if (!isValidPhoneNumber(phone)) {
  throw new Error('Invalid phone number');
}
```

### Creating Real-Time Data Subscription

Use the `useFirestoreListener` hook:

```typescript
import { useFirestoreListener } from '../hooks/useFirestoreListener';

function MyComponent() {
  const { data: listings, loading, error } = useFirestoreListener(
    'FoodListings',
    [where('status', '==', 'Available')]
  );

  if (loading) return <Spinner />;
  if (error) return <Error message={error} />;

  return (
    <Table>
      {listings.map(listing => (
        <TableRow key={listing.id}>{/* ... */}</TableRow>
      ))}
    </Table>
  );
}
```

### Adding Error Handling

```typescript
try {
  const result = await firebaseService.createFoodListing({
    // data
  });
  toast.success('Listing created!');
} catch (error: any) {
  console.error('Create failed:', error);
  toast.error(error.message || 'Failed to create listing');
}
```

---

## 🧪 Testing Patterns

### Test Authentication
```typescript
// Register new user
// Login with credentials
// Check dashboard loads
// Logout and verify redirect
```

### Test Authorization
```typescript
// Login as Donor
// Try to access Receiver route
// Verify redirect to /unauthorized
// Repeat for each role
```

### Test Data CRUD
```typescript
// Create: Form submission → Data in Firestore
// Read: Load page → Data displays
// Update: Edit form → Changes saved
// Delete: Confirm dialog → Item removed
```

### Test Real-Time Updates
```typescript
// Open page in 2 tabs
// Create item in tab 1
// Verify appears in tab 2 instantly
// Update in tab 1
// Verify updates in tab 2 instantly
```

---

## 🔧 Common Tasks

### Restart Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Check for TypeScript Errors
```bash
npm run build  # Shows all TS errors
```

### Clear Node Modules
```bash
rm -r node_modules package-lock.json
npm install
```

### View Build Bundle Size
```bash
npm run build
# Check dist/ folder
```

### Debug Firebase Calls
In `firebaseService.ts`, add console.log:
```typescript
const result = await firestore.collection('Users').add(userData);
console.log('Created user:', result);
```

### View Firestore Data
Go to Firebase Console → Firestore Database → Collections

### Check Firestore Rules
Go to Firebase Console → Firestore Database → Rules → Test

---

## 📊 Database Schema

### Users Collection
```typescript
{
  uid: string;              // Firebase Auth UID
  email: string;            // User's email
  role: 'Donor' | 'Receiver' | 'Admin';
  organizationName: string; // e.g., "Tech Restaurant"
  organizationType: string; // e.g., "Restaurant"
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### FoodListings Collection
```typescript
{
  id: string;               // Document ID
  donorId: string;          // UID of donor
  foodItemName: string;     // e.g., "Fresh Vegetables"
  quantity: number;         // e.g., 50 kg
  expirationTime: Timestamp;
  pickupLocation: string;   // Full address
  status: 'Available' | 'Claimed';
  claimedBy?: string;       // UID of receiver
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Claims Collection
```typescript
{
  id: string;               // Document ID
  receiverId: string;       // UID of receiver
  foodListingId: string;    // ID of listing
  claimedAt: Timestamp;
}
```

---

## 🔒 Security Checklist

- [ ] All routes wrapped with ProtectedRoute
- [ ] Role validation on sensitive pages
- [ ] Input validation before submission
- [ ] XSS prevention on all text inputs
- [ ] Error messages don't leak sensitive info
- [ ] .env file excluded from git
- [ ] Firebase credentials never hardcoded
- [ ] Firestore rules deployed
- [ ] Delete operations have confirmations
- [ ] Password validation enforces strength

---

## 📚 Code Style Guide

### Naming Conventions
- Components: PascalCase (`DonorDashboard.tsx`)
- Functions: camelCase (`getUserData()`)
- Constants: UPPER_CASE (`MAX_QUANTITY = 10000`)
- Types: PascalCase (`User`, `FoodListing`)
- Files: Match export name

### Imports Order
1. React imports
2. Third-party libraries
3. Local components
4. Local services
5. Local hooks
6. Local types/utils

Example:
```typescript
import { useEffect, useState } from 'react';
import { collection, query, where } from 'firebase/firestore';
import Layout from '../components/Layout';
import { useAuth } from '../hooks/useAuth';
import { firebaseService } from '../services/firebaseService';
import { User } from '../types';
import { isValidEmail } from '../utils/validators';
```

### Comments
- Use JSDoc for functions
- Explain WHY, not WHAT
- Keep comments brief
- Update comments when code changes

Example:
```typescript
/**
 * Validates email format and checks Firebase
 * @param email - User's email address
 * @returns true if valid, false otherwise
 */
function isValidEmail(email: string): boolean {
  // Simple regex for basic validation
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
```

---

## 🚀 Performance Tips

1. **Use useCallback** for memoization
2. **Lazy load pages** with React.lazy
3. **Minimize re-renders** with React.memo
4. **Avoid listeners in loops** (not applicable here)
5. **Clean up listeners** in useEffect cleanup
6. **Paginate large lists** if > 100 items
7. **Index Firestore queries** for speed

---

## 🐛 Debugging Tips

### Console Logging
```typescript
console.log('User:', currentUser);
console.error('Error:', error);
console.warn('Warning:', message);
```

### React DevTools
- Install React DevTools extension
- View component tree
- Check props/state
- Profile performance

### Firebase Console
- View Firestore collections
- Check rules
- Monitor usage
- View authentication

### Network Tab
- Check API calls
- Monitor Firebase requests
- Check response payloads
- Identify slow queries

---

## 📖 Reference Commands

```bash
# Setup
npm install
npm run dev

# Build
npm run build
npm run preview

# Linting
npm run lint

# Firebase
firebase init
firebase deploy
firebase emulate

# Git
git add .
git commit -m "message"
git push origin main
```

---

## 🔗 Important Links

- [Firebase Console](https://console.firebase.google.com)
- [Material-UI Docs](https://mui.com)
- [React Docs](https://react.dev)
- [TypeScript Docs](https://www.typescriptlang.org)
- [Firestore Docs](https://firebase.google.com/docs/firestore)

---

## 📝 Notes

- Always test in Chrome DevTools mobile view
- Use DOMPurify for any user-generated HTML
- Always wrap async operations in try-catch
- Use React.memo only when needed
- Profile performance before optimizing
- Keep components under 300 lines
- Write tests for business logic

---

*Last Updated: April 21, 2026*  
*Version: 1.0.0*

For questions, refer to the main [README.md](./README.md) or [SETUP.md](./SETUP.md)
