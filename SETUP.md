# FoodBridge Frontend - Implementation Guide

## Project Overview

FoodBridge is a surplus food rescue and redistribution network. This is the React frontend application that provides a user interface for the platform.

## Project Setup

### Prerequisites
- Node.js (v16+)
- npm (v8+)
- Firebase Account

### Installation

1. **Navigate to the project directory:**
```bash
cd foodbridge-frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
   - Copy `.env.example` to `.env`
   - Fill in your Firebase configuration values from Firebase Console

```bash
cp .env.example .env
```

Edit `.env` and add your Firebase project credentials:

```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

4. **Start the development server:**
```bash
npm run dev
```

The application will be available at `http://localhost:5173/`

## Firebase Setup (Required)

1. **Create a Firebase Project:**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Create a new project

2. **Enable Firebase Authentication:**
   - In Firebase Console, go to Authentication > Sign-in method
   - Enable "Email/Password" provider

3. **Create Firestore Database:**
   - In Firebase Console, go to Firestore Database
   - Click "Create database"
   - Choose "Start in production mode"
   - Select your region
   - Create the database

4. **Set Firestore Security Rules:**
   - Go to Firestore Database > Rules
   - Replace the default rules with the content from `firestore.rules` (to be created)
   - Publish the rules

5. **Get Your Credentials:**
   - Go to Project Settings > General
   - Scroll down to "Your apps" section
   - Click the Web app (or create one)
   - Copy the Firebase config object values into your `.env` file

## Project Structure

```
foodbridge-frontend/
├── src/
│   ├── components/
│   │   ├── ErrorBoundary.tsx      - Error handling wrapper
│   │   ├── Layout.tsx              - Main layout with navbar
│   │   └── ProtectedRoute.tsx      - Route protection with RBAC
│   │
│   ├── context/
│   │   └── AuthContext.tsx         - Global authentication state
│   │
│   ├── hooks/
│   │   ├── useAuth.ts              - Auth custom hook
│   │   └── useFirestoreListener.ts - Real-time Firestore listener
│   │
│   ├── pages/
│   │   ├── LandingPage.tsx              - Public landing page
│   │   ├── LoginPage.tsx                - Login form
│   │   ├── RegisterPage.tsx             - Registration with role selection
│   │   ├── UnauthorizedPage.tsx         - 403 error page
│   │   ├── DonorDashboard.tsx           - Donor inventory view
│   │   ├── DonorCreateListing.tsx       - Create food listing
│   │   ├── DonorEditListing.tsx         - Edit food listing
│   │   ├── ReceiverDashboard.tsx        - Live food feed
│   │   ├── ReceiverClaimsHistory.tsx    - Claimed items history
│   │   ├── AdminDashboard.tsx           - Admin overview
│   │   ├── AdminUsers.tsx               - User management
│   │   └── AdminListings.tsx            - Listing management
│   │
│   ├── services/
│   │   └── firebaseService.ts      - Firebase API interactions
│   │
│   ├── types/
│   │   └── index.ts                - TypeScript type definitions
│   │
│   ├── utils/
│   │   └── validators.ts           - Input validation & sanitization
│   │
│   ├── App.tsx                     - Main app component with routing
│   ├── main.tsx                    - Entry point
│   └── index.css                   - Global styles
│
├── .env.example                    - Environment variables template
├── package.json                    - Dependencies
├── vite.config.ts                  - Vite configuration
├── tsconfig.json                   - TypeScript configuration
└── README.md                       - This file
```

## User Roles & Access

### Guest (Unauthenticated)
- ✅ View landing page
- ✅ Access login/register pages
- ❌ View food listings
- ❌ Access dashboards

### Donor (Food Provider)
- ✅ Create food listings
- ✅ View own listings
- ✅ Edit own listings
- ✅ Delete own listings
- ✅ View donor dashboard
- ❌ Claim food
- ❌ Access receiver/admin features

### Receiver (Food Organization)
- ✅ View all available food
- ✅ Claim food items
- ✅ View claims history
- ✅ View receiver dashboard
- ❌ Create listings
- ❌ Access donor/admin features

### Admin (Platform Manager)
- ✅ View all users
- ✅ View all listings
- ✅ Delete users
- ✅ Delete listings
- ✅ View admin dashboard
- ❌ Create or claim food (except for moderation)

## Key Features

### Authentication
- Secure email/password registration
- Role-based user creation (Donor/Receiver)
- Persistent sessions using Firebase Auth
- Protected routes with RBAC

### Donor Features
- Create new food listings with details (name, quantity, location, expiration)
- Real-time dashboard showing current listings
- Edit listing details
- Delete listings
- View status of food (Available/Claimed)

### Receiver Features
- Real-time feed of all available food
- Search/filter functionality
- One-click claim mechanism
- Claims history tracking
- View food details and pickup locations

### Admin Features
- Platform statistics dashboard
- User management (view, delete)
- Listing management (view, delete)
- Moderation tools for content removal

### Security
- Input validation (email, password, quantity, text)
- XSS prevention with DOMPurify
- Firestore-level RBAC enforcement
- Protected routes with role checking
- Password strength validation

## Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Hot Module Replacement (HMR)
The application supports HMR - changes to your code will automatically refresh the browser without losing state.

## Firestore Database Schema

### Users Collection
```json
{
  "uid": "string (document ID)",
  "email": "string",
  "role": "Donor | Receiver | Admin",
  "organizationName": "string",
  "organizationType": "string",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### FoodListings Collection
```json
{
  "id": "string (document ID)",
  "donorId": "string (uid reference)",
  "foodItemName": "string",
  "quantity": "number",
  "expirationTime": "timestamp",
  "pickupLocation": "string",
  "status": "Available | Claimed",
  "claimedBy": "string | null (receiver uid)",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### Claims Collection (Audit Trail)
```json
{
  "id": "string (document ID)",
  "receiverId": "string (uid)",
  "foodListingId": "string (listing id)",
  "claimedAt": "timestamp"
}
```

## Deployment

### Deploy to Firebase Hosting

1. **Install Firebase CLI:**
```bash
npm install -g firebase-tools
```

2. **Initialize Firebase:**
```bash
firebase init hosting
```

3. **Build the project:**
```bash
npm run build
```

4. **Deploy:**
```bash
firebase deploy
```

### Deploy to Other Platforms
The `npm run build` command creates an optimized production build in the `dist/` directory, which can be deployed to:
- Vercel
- Netlify
- AWS Amplify
- GitHub Pages
- Any static hosting service

## Troubleshooting

### Firebase Configuration Issues
- Ensure `.env` file contains all required Firebase credentials
- Verify credentials match your Firebase project settings
- Check that Firebase project has Auth and Firestore enabled

### Authentication Not Working
- Ensure email/password sign-in is enabled in Firebase Console
- Check Firestore Rules allow user document creation
- Verify network requests in browser DevTools

### Real-time Updates Not Working
- Check that Firestore listeners are properly set up
- Verify Firestore Rules permit read access for the user's role
- Check browser console for Firestore errors

### Build Errors
- Run `npm install` to ensure all dependencies are installed
- Delete `node_modules` and reinstall if issues persist
- Check TypeScript configuration in `tsconfig.json`

## Code Quality

### TypeScript
All code is written in TypeScript for type safety. Each component and function has proper typing.

### Component Structure
- Functional components with React Hooks
- Custom hooks for reusable logic
- Proper error handling and loading states
- Accessibility considerations (ARIA labels, semantic HTML)

### State Management
- React Context API for global auth state
- Component-level state with useState
- Firestore real-time listeners for data synchronization

## Testing (To be implemented)

```bash
# Run unit tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Create a pull request
5. Code review and merge

## Security Notes

### Frontend Security
- Passwords are never stored locally (handled by Firebase)
- All user inputs are validated and sanitized
- XSS prevention with HTML sanitization
- HTTPS required for production

### Backend Security (Firestore)
- Implement Firestore Security Rules
- Role-based access control at database level
- Validate all inputs server-side
- Never trust client-side validation alone

## Performance Optimization

### Implemented
- Lazy loading of pages with React Router
- Code splitting with dynamic imports
- Optimized re-renders with React.memo
- Real-time data with Firestore listeners (not polling)

### Future Improvements
- Image optimization and lazy loading
- Service Worker caching
- Progressive Web App (PWA) features
- Performance monitoring

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Resources

- [React Documentation](https://react.dev)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Material-UI Documentation](https://mui.com)
- [Vite Documentation](https://vitejs.dev)

## License

This project is proprietary to FoodBridge. All rights reserved.

## Contact & Support

For issues, questions, or feature requests, please contact the development team.

---

**Last Updated:** April 21, 2026
**Version:** 1.0.0
