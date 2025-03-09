import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

// Import the AuthProvider
import { AuthProvider, useAuth } from './context/AuthContext';

// Layouts
import NavBar from './components/common/NavBar';
import Footer from './components/common/Footer';

// Pages
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CourseList from './pages/CourseList';
import CourseDetail from './pages/CourseDetail';
import LessonDetail from './pages/LessonDetail';
import AssignmentDetail from './pages/AssignmentDetail';
import ProfilePage from './pages/ProfilePage';
import NotFound from './pages/NotFound';

// Protected route component
const ProtectedRoute = ({ children, roles = [] }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <div className="text-center p-5">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // If roles are specified and user's role is not included
  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="d-flex flex-column min-vh-100">
          <NavBar />
          <main className="flex-grow-1">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected routes - any authenticated user */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/courses" 
                element={
                  <ProtectedRoute>
                    <CourseList />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/courses/:id" 
                element={
                  <ProtectedRoute>
                    <CourseDetail />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/lessons/:id" 
                element={
                  <ProtectedRoute>
                    <LessonDetail />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/assignments/:id" 
                element={
                  <ProtectedRoute>
                    <AssignmentDetail />
                  </ProtectedRoute>
                } 
              />
              
              {/* Instructor & Admin routes */}
              <Route 
                path="/courses/create" 
                element={
                  <ProtectedRoute roles={['instructor', 'admin']}>
                    <CourseDetail isCreating={true} />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/courses/:courseId/lessons/create" 
                element={
                  <ProtectedRoute roles={['instructor', 'admin']}>
                    <LessonDetail isCreating={true} />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/courses/:courseId/assignments/create" 
                element={
                  <ProtectedRoute roles={['instructor', 'admin']}>
                    <AssignmentDetail isCreating={true} />
                  </ProtectedRoute>
                } 
              />
              
              {/* Admin only routes */}
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute roles={['admin']}>
                    <Dashboard isAdmin={true} />
                  </ProtectedRoute>
                } 
              />
              
              {/* 404 Not Found */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;