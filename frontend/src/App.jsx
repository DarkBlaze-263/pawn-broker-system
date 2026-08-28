import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';

// Import AuthContext and ThemeContext
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Import components
import LoginForm from './components/Auth/LoginForm';
import MainLayout from './components/Layout/MainLayout';

// Lazy load pages for code splitting
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const NewBillPage = lazy(() => import('./pages/NewBillPage'));
const UpdateBillPage = lazy(() => import('./pages/UpdateBillPage'));
const CloseBillPage = lazy(() => import('./pages/CloseBillPage'));
const ManageDatabasePage = lazy(() => import('./pages/ManageDatabasePage'));
const DownloadBillsPage = lazy(() => import('./pages/DownloadBillsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<LoginForm />} />
            
            {/* Protected routes with MainLayout */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={
                <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>}>
                  <DashboardPage />
                </Suspense>
              } />
            </Route>
            <Route
              path="/bills/new"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={
                <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>}>
                  <NewBillPage />
                </Suspense>
              } />
            </Route>
            <Route
              path="/bills/update"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={
                <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>}>
                  <UpdateBillPage />
                </Suspense>
              } />
            </Route>
            <Route
              path="/bills/close"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={
                <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>}>
                  <CloseBillPage />
                </Suspense>
              } />
            </Route>
            <Route
              path="/database"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={
                <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>}>
                  <ManageDatabasePage />
                </Suspense>
              } />
            </Route>
            <Route
              path="/download-bills"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={
                <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>}>
                  <DownloadBillsPage />
                </Suspense>
              } />
            </Route>
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={
                <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>}>
                  <SettingsPage />
                </Suspense>
              } />
            </Route>
            
            {/* 404 route */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
