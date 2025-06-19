import React, { useState } from "react";
import { Link } from "react-router-dom"; // ✅ THÊM: Import Link từ react-router-dom
import { useAuth } from "../hooks/useAuth";
import SearchBox from "../components/MovieNavbar/SearchBox";
import UserSection from "../components/MovieNavbar/UserSection";
import NavigationLinks from "../components/MovieNavbar/NavigationLinks";
import LoginModal from "../components/MovieNavbar/LoginModal";
import RegisterModal from "../components/MovieNavbar/RegisterModal";
import MobileMenu from "../components/MovieNavbar/MobileMenu";

export default function Navbar() {
  const { user, loading, refreshUser } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const handleShowLogin = () => {
    setShowRegisterModal(false);
    setShowLoginModal(true);
  };

  const handleShowRegister = () => {
    setShowLoginModal(false);
    setShowRegisterModal(true);
  };

  const handleCloseModals = () => {
    setShowLoginModal(false);
    setShowRegisterModal(false);
  };

  const handleSwitchToRegister = () => {
    setShowLoginModal(false);
    setShowRegisterModal(true);
  };

  const handleSwitchToLogin = () => {
    setShowRegisterModal(false);
    setShowLoginModal(true);
  };

  const handleMobileMenuToggle = () => {
    // Implement mobile menu toggle logic here
    console.log("Mobile menu toggled");
  };

  if (loading) {
    return (
      <nav className="bg-gray-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0">
              {/* ✅ SỬA: Thay a tag bằng Link và href bằng to */}
              <Link to="/homepage" className="text-2xl font-bold text-yellow-400">
                AbsoluteCinema
              </Link>
            </div>
            <div className="animate-pulse">
              <div className="h-4 bg-gray-600 rounded w-24"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
      <nav className="bg-gray-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              {/* ✅ SỬA: Thay a tag bằng Link và href="/homepage" */}
              <Link 
                to="/homepage" 
                className="text-2xl font-bold text-yellow-400 hover:text-yellow-300 transition-colors duration-200"
                onClick={(e) => {
                  // Nếu đang ở trang homepage, không cần làm gì
                  if (window.location.pathname === '/homepage') {
                    return;
                  }
                  
                  // Force reload trang homepage
                  e.preventDefault();
                  window.location.href = '/homepage';
                }}
              >
                AbsoluteCinema
              </Link>
            </div>

            {/* Navigation Links */}
            <NavigationLinks />

            <div className="flex items-center space-x-4">
              {/* Search Section */}
              <SearchBox />

              {/* User Section */}
              <UserSection 
                user={user}
                onShowLogin={handleShowLogin}
                onShowRegister={handleShowRegister}
              />

              {/* Mobile menu button */}
              <MobileMenu onToggle={handleMobileMenuToggle} />
            </div>
          </div>
        </div>
      </nav>

      {/* Login Modal */}
      <LoginModal 
        isOpen={showLoginModal}
        onClose={handleCloseModals}
        onSwitchToRegister={handleSwitchToRegister}
        refreshUser={refreshUser}
      />

      {/* Register Modal */}
      <RegisterModal 
        isOpen={showRegisterModal}
        onClose={handleCloseModals}
        onSwitchToLogin={handleSwitchToLogin}
      />
    </>
  );
}