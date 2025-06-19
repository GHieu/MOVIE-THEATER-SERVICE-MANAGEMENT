import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

import HomePage from './pages/HomePage';
import MoviesPage from './pages/MoviesPage';
import MovieDetailPage from './pages/MovieDetailPage';
import SeatPage from './pages/BookingPage';
import FoodPage from './pages/FoodPage';
import PaymentPage from './pages/PaymentPage';
import ConfirmationPage from './pages/ConfirmationPage';
import SearchPage from './pages/SearchPage';
import BlogDetailPage from './pages/BlogDetailPage';
import ProfilePage from './pages/ProfilePage';
import BlogsPage from './pages/BlogsPage';

import ScrollToTop from './components/another/ScrollToTop';
import Navbar from './pages/Navbar';
import Footer from './pages/Footer';

import AdminLayout from './pages/admin/AdminLayout';
import AdminLogin from './pages/admin/AdminLogin';
import AdminPrivateRoute from './pages/admin/AdminPrivateRoute';

import { BookingProvider } from './contexts/BookingContext';

function App() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check admin login status on app load
  useEffect(() => {
    const checkAdminAuth = () => {
      const token = localStorage.getItem('adminToken');
      const adminLoggedIn = localStorage.getItem('adminLoggedIn');
      
      if (token && adminLoggedIn === 'true') {
        setIsAdminLoggedIn(true);
      } else {
        setIsAdminLoggedIn(false);
        // Clean up invalid tokens
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminLoggedIn');
      }
      
      setIsLoading(false);
    };

    checkAdminAuth();
  }, []);

  const handleAdminLogin = () => {
    console.log('Admin login successful, updating state');
    setIsAdminLoggedIn(true);
  };

  const handleAdminLogout = () => {
    console.log('Admin logout, clearing state');
    setIsAdminLoggedIn(false);
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminLoggedIn');
  };

  // Check if current path is admin route
  const isAdminRoute = window.location.pathname.startsWith('/admin');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="ml-3 text-gray-600">Đang tải...</p>
      </div>
    );
  }

  return (
    <Router>
      <ScrollToTop />
      
      {/* Wrap toàn bộ app với BookingProvider */}
      <BookingProvider>
        {/* User UI: Navbar + Footer (only show for non-admin routes) */}
        {!isAdminRoute && <Navbar />}

        <Routes>
          {/* Root redirect */}
          <Route path="/" element={<Navigate to="/homepage" replace />} />
          
          {/* USER ROUTES */}
          <Route path="/homepage" element={<HomePage />} />
          <Route path="/movies" element={<MoviesPage />} />
          <Route path="/movies/:id" element={<MovieDetailPage />} />
          <Route path="/booking/:movieId" element={<SeatPage />} />
          <Route path="/food" element={<FoodPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/order-success" element={<ConfirmationPage />} />
          <Route path="/blogs" element={<BlogsPage />} />
          <Route path="/blogs/:id" element={<BlogDetailPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          
          {/* ADMIN ROUTES */}
          <Route
            path="/admin/login"
            element={
              isAdminLoggedIn ? (
                <Navigate to="/admin" replace />
              ) : (
                <AdminLogin onLogin={handleAdminLogin} />
              )
            }
          />
          
          <Route
            path="/admin"
            element={
              <AdminPrivateRoute isAuthenticated={isAdminLoggedIn}>
                <AdminLayout onLogout={handleAdminLogout} />
              </AdminPrivateRoute>
            }
          />
          
          {/* Redirect any other admin routes to main admin */}
          <Route path="/admin/*" element={<Navigate to="/admin" replace />} />
          
          {/* 404 Page */}
          <Route 
            path="*" 
            element={
              <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                  <h1 className="text-6xl font-bold text-gray-400">404</h1>
                  <p className="text-xl text-gray-600 mt-4">Trang không tồn tại</p>
                  <button 
                    onClick={() => window.history.back()}
                    className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Quay lại
                  </button>
                </div>
              </div>
            } 
          />
        </Routes>

        {/* Footer for user routes only */}
        {!isAdminRoute && <Footer />}
      </BookingProvider>
    </Router>
  );
}

export default App;