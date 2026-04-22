# FoodBridge Frontend - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Firebase Setup (First Time Only)
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project named "FoodBridge"
3. Enable **Email/Password Authentication** under Authentication > Sign-in method
4. Create **Firestore Database** (choose "production mode")
5. Copy your Firebase config from Project Settings > General

### Step 2: Environment Configuration
1. In `foodbridge-frontend/` directory, create `.env` file:
```bash
cp .env.example .env
```

2. Add your Firebase credentials to `.env`:
```
REACT_APP_FIREBASE_API_KEY=YOUR_VALUE_HERE
REACT_APP_FIREBASE_AUTH_DOMAIN=YOUR_VALUE_HERE
REACT_APP_FIREBASE_PROJECT_ID=YOUR_VALUE_HERE
REACT_APP_FIREBASE_STORAGE_BUCKET=YOUR_VALUE_HERE
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=YOUR_VALUE_HERE
REACT_APP_FIREBASE_APP_ID=YOUR_VALUE_HERE
```

### Step 3: Install & Run
```bash
cd foodbridge-frontend
npm install
npm run dev
```

The app will open at `http://localhost:5173/`

### Step 4: Deploy Firestore Rules
1. In Firebase Console, go to **Firestore Database > Rules**
2. Replace the default rules with content from `firestore.rules`
3. Click **"Publish"**

## 🧪 Test the Application

### Create Test Accounts

**Donor Account:**
- Email: `donor@example.com`
- Password: `TestPassword123!`
- Organization: Test Restaurant

**Receiver Account:**
- Email: `receiver@example.com`
- Password: `TestPassword123!`
- Organization: Test NGO

**Admin Account (Requires Firebase Manual Setup):**
- Email: `admin@example.com`
- Password: `AdminPassword123!`
- Manually update user role to "Admin" in Firestore

### Test Workflows

1. **Donor Workflow:**
   - Register as Donor
   - Create food listing
   - View dashboard
   - Edit/delete listing

2. **Receiver Workflow:**
   - Register as Receiver
   - View food feed
   - Claim an item
   - Check claims history

3. **Admin Workflow:**
   - View all users
   - View all listings
   - Delete inappropriate content

## 📁 Project Structure Overview

```
foodbridge-frontend/
├── src/
│   ├── components/      ← UI components (Layout, ProtectedRoute, etc)
│   ├── pages/          ← Full page components
│   ├── services/       ← Firebase API calls
│   ├── context/        ← Global state (Auth)
│   ├── hooks/          ← Custom React hooks
│   ├── utils/          ← Validation & helpers
│   ├── types/          ← TypeScript definitions
│   └── App.tsx         ← Main routing
├── .env                ← Environment variables (SECURE)
├── .env.example        ← Environment template
├── SETUP.md            ← Detailed setup guide
├── firestore.rules     ← Firestore security rules
└── package.json        ← Dependencies
```

## 🔐 Security Features

✅ Password validation (8+ chars, special chars required)
✅ Input sanitization (XSS prevention)
✅ Role-based access control
✅ Protected routes
✅ Firebase authentication
✅ Firestore security rules

## 🛠️ Available Commands

```bash
npm run dev         # Start development server
npm run build       # Build for production
npm run preview     # Preview production build
npm run lint        # Run linter
```

## 📚 Key Files Explained

| File | Purpose |
|------|---------|
| `App.tsx` | Main app component with routing |
| `services/firebaseService.ts` | All Firebase interactions |
| `context/AuthContext.tsx` | Global authentication state |
| `components/ProtectedRoute.tsx` | Role-based route protection |
| `utils/validators.ts` | Input validation & sanitization |
| `firestore.rules` | Database security rules |

## ⚠️ Important Notes

1. **Never commit `.env` file** - It contains sensitive credentials
2. **Always use Firestore Rules** - They provide database-level security
3. **Test role access** - Try accessing routes with wrong role to verify RBAC
4. **Validate all inputs** - Both frontend and Firestore rules
5. **Keep dependencies updated** - Run `npm update` periodically

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| "Cannot find module" errors | Run `npm install` |
| Blank page on startup | Check Firebase config in `.env` |
| Can't login/register | Verify Email/Password auth enabled in Firebase |
| Real-time updates not working | Check Firestore Rules are published |
| TypeScript errors | Run `npm run build` to see detailed errors |

## 📖 Learn More

- [React Docs](https://react.dev)
- [Firebase Docs](https://firebase.google.com/docs)
- [Material-UI Docs](https://mui.com)
- [TypeScript Docs](https://www.typescriptlang.org)

## 📞 Next Steps

1. ✅ Complete Firebase setup (Step 1-4 above)
2. ✅ Create test accounts
3. ✅ Test all user workflows
4. ✅ Deploy Firestore rules
5. 🔜 Deploy to Firebase Hosting (or Vercel/Netlify)
6. 🔜 Implement additional features (email notifications, messaging, etc)

---

**Happy Coding! 🚀**

For detailed setup instructions, see [SETUP.md](./SETUP.md)
