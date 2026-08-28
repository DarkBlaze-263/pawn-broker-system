# JWT Authentication System - Setup Guide

## Overview

Complete JWT-based authentication system has been implemented for the Pawn Broker Management System with secure password hashing, token generation, and frontend integration.

## Backend Implementation

### Files Created

1. **`src/utils/passwordHash.js`**
   - `hashPassword()` - Hash passwords with bcrypt (10 salt rounds)
   - `comparePassword()` - Compare plain text with hashed password
   - `validatePasswordStrength()` - Validate password (min 8 chars, 1 uppercase, 1 number, 1 special char)

2. **`src/utils/tokenGenerator.js`**
   - `generateToken()` - Generate JWT token with 24h expiration
   - `verifyToken()` - Verify and decode JWT token
   - `decodeToken()` - Decode token without verification (debugging)

3. **`src/middleware/authMiddleware.js`**
   - `authenticateToken()` - Verify Bearer token from Authorization header
   - `optionalAuth()` - Optional authentication (doesn't require token)
   - Attaches user info to request object
   - Returns 401/403 for invalid/expired tokens

4. **`src/controllers/authController.js`**
   - `login()` - Validate credentials, generate token
   - `logout()` - Handle logout (client-side token removal)
   - `verifyToken()` - Verify current token validity
   - `getProfile()` - Get current user profile

5. **`src/routes/authRoutes.js`**
   - POST `/api/auth/login` - User login
   - POST `/api/auth/logout` - User logout
   - POST `/api/auth/verify-token` - Verify token
   - GET `/api/auth/profile` - Get user profile

6. **`src/database/seed-admin.js`**
   - Creates default admin user (username: admin, password: admin123)

### API Endpoints

#### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "username": "admin",
      "email": "admin@pawnbroker.com",
      "fullName": "System Administrator",
      "phone": "9876543210",
      "themePreference": "light"
    }
  }
}
```

#### Verify Token
```bash
POST /api/auth/verify-token
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Token is valid",
  "data": {
    "user": { ... }
  }
}
```

#### Logout
```bash
POST /api/auth/logout
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Logout successful"
}
```

## Frontend Implementation

### Files Created

1. **`src/context/AuthContext.js`**
   - Manages authentication state (user, token, loading, isAuthenticated)
   - Provides `login()`, `logout()`, `updateUser()`, `refreshUser()` functions
   - Automatically verifies token on app load
   - Persists token in localStorage

2. **`src/utils/authHelper.js`**
   - `getToken()` / `setToken()` / `clearToken()` - Token management
   - `getUserData()` / `setUserData()` / `clearUserData()` - User data management
   - `isAuthenticated()` - Check auth status
   - `clearAuthData()` - Clear all auth data
   - `getAuthHeader()` - Get Authorization header for API calls
   - `decodeToken()` - Decode JWT token (client-side)
   - `isTokenExpired()` - Check if token is expired
   - `getTokenExpirationTime()` - Get time until expiration
   - `formatExpirationTime()` - Format expiration for display

3. **`src/components/Auth/LoginForm.jsx`**
   - Material-UI login form with username/password fields
   - Form validation with error messages
   - Password visibility toggle
   - Loading state during submission
   - Success/error alerts
   - Auto-redirect to dashboard on successful login
   - Uses AuthContext for authentication

### Updated Files

1. **`src/App.jsx`**
   - Wrapped routes with `AuthProvider`
   - Updated `ProtectedRoute` to use AuthContext
   - Integrated `LoginForm` component
   - Added loading state for auth check

2. **`src/services/api.js`**
   - Axios interceptors for automatic token injection
   - Automatic redirect to login on 401 errors

## Setup Instructions

### 1. Initialize Database

```bash
cd backend
npm run init-db
```

### 2. Seed Admin User

```bash
npm run seed-admin
```

This creates a default admin user:
- **Username:** admin
- **Password:** admin123
- **Email:** admin@pawnbroker.com

⚠️ **Important:** Change the default password after first login!

### 3. Configure Environment

Ensure `.env` file has:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/pawn_broker_db
JWT_SECRET=your_secure_jwt_secret_here
PORT=5000
FRONTEND_URL=http://localhost:3000
```

### 4. Start Backend Server

```bash
npm start
# Or for development:
npm run dev
```

Backend will run on `http://localhost:5000`

### 5. Start Frontend

```bash
cd frontend
npm start
```

Frontend will run on `http://localhost:3000`

## Usage

### Login Flow

1. User navigates to `/login`
2. Enters username and password
3. Form validates input
4. API call to `/api/auth/login`
5. On success, token stored in localStorage
6. User redirected to `/dashboard`

### Protected Routes

All routes except `/login` are protected:
- User must be authenticated
- Token verified on each request
- Invalid/expired tokens redirect to login
- Loading state shown during auth check

### Using Auth Context

```jsx
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();

  if (!isAuthenticated) {
    return <div>Please login</div>;
  }

  return (
    <div>
      Welcome, {user.fullName}!
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Using API with Auth

```jsx
import api from '../services/api';

// Token automatically added to requests
const response = await api.get('/api/customers');
```

## Security Features

1. **Password Hashing**
   - All passwords hashed with bcrypt (10 salt rounds)
   - Plain text passwords never stored

2. **JWT Tokens**
   - 24-hour expiration
   - Signed with JWT_SECRET
   - Payload contains userId and username only

3. **Input Validation**
   - Password strength validation (min 8 chars, 1 uppercase, 1 number, 1 special)
   - Server-side validation on all inputs
   - SQL injection prevention via parameterized queries

4. **Token Management**
   - Tokens stored in localStorage
   - Automatic token injection via axios interceptors
   - Automatic redirect on 401 errors
   - Token verification on app load

5. **Protected Routes**
   - All protected routes require valid token
   - Middleware verifies token on each request
   - Expired/invalid tokens rejected

## Testing

### Test Login

1. Navigate to `http://localhost:3000/login`
2. Enter credentials:
   - Username: `admin`
   - Password: `admin123`
3. Click "Sign In"
4. Should redirect to dashboard

### Test API Endpoints

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Verify token (replace TOKEN with actual token)
curl -X POST http://localhost:5000/api/auth/verify-token \
  -H "Authorization: Bearer TOKEN"

# Get profile
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer TOKEN"
```

## Troubleshooting

### "Token has expired"
- Token expires after 24 hours
- User must login again to get new token

### "Invalid token"
- Token may be corrupted
- Clear localStorage and login again

### "Account is deactivated"
- User account has been deactivated
- Contact administrator to reactivate

### Database connection errors
- Check DATABASE_URL in `.env`
- Ensure PostgreSQL is running
- Verify database exists

## Next Steps

1. Implement user registration endpoint
2. Add password reset functionality
3. Implement refresh tokens for better security
4. Add role-based access control (RBAC)
5. Implement two-factor authentication (optional)
6. Add session management for concurrent logins
