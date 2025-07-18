import React, { useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useMembership } from "../contexts/MembershipContext";
import SearchBox from "../components/MovieNavbar/SearchBox";
import UserSection from "../components/MovieNavbar/UserSection";
import NavigationLinks from "../components/MovieNavbar/NavigationLinks";
import LoginModal from "../components/MovieNavbar/LoginModal";
import RegisterModal from "../components/MovieNavbar/RegisterModal";
import MobileMenu from "../components/MovieNavbar/MobileMenu";
import MembershipModal from "../components/MembershipModal/MembershipModal";
import MembershipBadge from "../components/MembershipModal/MembershipBadge";
import { BadgeCheck } from 'lucide-react';

export default function Navbar() {
  const { user, loading, refreshUser } = useAuth();
  const { 
    membership, 
    hasMembership, 
    memberType, 
    points, 
    loading: membershipLoading, 
    isUpdatingPoints,
    updatePoints,
    refreshMembership 
  } = useMembership();
  
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showMembershipModal, setShowMembershipModal] = useState(false);
  
  // DEBUG: Thêm console.log để kiểm tra
  console.log('Navbar Debug:', {
    user: !!user,
    loading,
    membershipLoading,
    hasMembership,
    memberType,
    points
  });

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
    setShowMembershipModal(false);
  };

  const handleSwitchToRegister = () => {
    setShowLoginModal(false);
    setShowRegisterModal(true);
  };

  const handleSwitchToLogin = () => {
    setShowRegisterModal(false);
    setShowLoginModal(true);
  };

  // Memoize callback functions
  const handleMembershipClick = useCallback(() => {
    console.log('Membership button clicked!', { user: !!user, hasMembership });
    
    if (!user) {
      // Nếu chưa đăng nhập thì hiện modal login
      setShowLoginModal(true);
      return;
    }

    if (hasMembership) {
      // Nếu đã có membership thì xem profile
      console.log('View membership profile');
    } else {
      // Nếu đã login nhưng chưa có membership thì hiện modal đăng ký
      setShowMembershipModal(true);
    }
  }, [user, hasMembership]);

  const handleMembershipSuccess = useCallback(async (newMembership) => {
    try {
      setShowMembershipModal(false);
      await refreshMembership();
      console.log('Membership registered successfully:', newMembership);
    } catch (error) {
      console.error('Error refreshing membership:', error);
    }
  }, [refreshMembership]);

  const handleGiftExchange = useCallback(async () => {
    await updatePoints();
    console.log('Points updated after gift exchange');
  }, [updatePoints]);

  const handleMobileMenuToggle = useCallback(() => {
    console.log("Mobile menu toggled");
  }, []);

  // Logic hiển thị membership - ĐÃ SỬA
  const shouldShowMembershipBadge = useMemo(() => {
    const result = user && hasMembership && !membershipLoading;
    console.log('shouldShowMembershipBadge:', result);
    return result;
  }, [user, hasMembership, membershipLoading]);

  const shouldShowMembershipButton = useMemo(() => {
    // SỬA: Chỉ cần kiểm tra !user, không cần kiểm tra membershipLoading
    // Vì khi chưa đăng nhập thì luôn hiển thị nút đăng ký
    const result = !user;
    console.log('shouldShowMembershipButton:', result, { user: !!user, membershipLoading });
    return result;
  }, [user]); // Bỏ membershipLoading khỏi dependencies

  // Kiểm tra xem có đang trong quá trình load initial không
  const isInitialLoading = useMemo(() => {
    return loading || (user && membershipLoading);
  }, [loading, user, membershipLoading]);

  if (loading) {
    return (
      <nav className="bg-white text-black shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0">
              <span
                role="button"
                onClick={() => window.location.assign('/homepage')}
                className="text-2xl font-logo text-yellow-400 hover:text-yellow-300 transition-colors duration-200 cursor-pointer"
              >
                AbsoluteCinema
              </span>
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
      <nav className="bg-white text-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center min-h-20">
            {/* Left: Logo + NavigationLinks */}
            <div className="flex items-center">
              <Link 
                to="/homepage" 
                className="text-2xl font-bold text-amber-400 hover:text-amber-300 transition-colors duration-100"
                onClick={(e) => {
                  if (window.location.pathname === '/homepage') return;
                  e.preventDefault();
                  window.location.href = '/homepage';
                }}
              >
                AbsoluteCinema
              </Link>

              <div className="ml-2">
                <NavigationLinks />
              </div>
            </div>

            {/* Right: SearchBox + Membership + User + Mobile */}
            <div className="flex items-center space-x-4">
              <SearchBox />
              
              {/* Membership Section */}
              <div className="membership-section">
                {isInitialLoading ? (
                  // Loading state chung cho cả auth và membership - skeleton cố định kích thước
                  <div key="initial-loading" className="membership-loading-container">
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full min-w-[160px] h-[32px]">
                      <div className="w-5 h-5 border-2 border-gray-300 border-t-amber-500 rounded-full animate-spin flex-shrink-0"></div>
                      <div className="h-4 bg-gray-200 rounded flex-1 animate-pulse"></div>
                    </div>
                  </div>
                ) : shouldShowMembershipBadge ? (
                  // User có membership - hiển thị badge
                  <div key="membership-badge" className="membership-badge-container">
                    <MembershipBadge 
                      memberType={memberType}
                      points={points}
                      onClick={handleMembershipClick}
                      isUpdating={isUpdatingPoints}
                    />
                  </div>
                ) : shouldShowMembershipButton ? (
                  // Chưa đăng nhập - hiển thị nút đăng ký
                  <div key="membership-button" className="membership-button-container">
                    <button
                      onClick={handleMembershipClick}
                      className="flex items-center gap-2 text-black text-sm font-medium border-2 border-amber-500 px-3 py-1 rounded-full hover:bg-amber-400 hover:text-white transition-all duration-200 shadow-sm"
                    >
                      <BadgeCheck className="w-5 h-5 text-yellow-500 fill-red-700" />
                      <span className="text-sm font-medium">
                        Đăng ký starmember
                      </span>
                    </button>
                  </div>
                ) : user && !hasMembership ? (
                  // User đã đăng nhập nhưng chưa có membership - hiển thị nút đăng ký
                  <div key="membership-register" className="membership-register-container">
                    <button
                      onClick={handleMembershipClick}
                      className="flex items-center gap-2 text-black text-sm font-medium border-2 border-amber-500 px-3 py-1 rounded-full hover:bg-amber-400 hover:text-white transition-all duration-200 shadow-sm"
                    >
                      <BadgeCheck className="w-5 h-5 text-yellow-500 fill-red-700" />
                      <span className="text-sm font-medium">
                        Đăng ký membership
                      </span>
                    </button>
                  </div>
                ) : null}
              </div>

              <UserSection 
                user={user}
                onShowLogin={handleShowLogin}
                onShowRegister={handleShowRegister}
              />
              <MobileMenu onToggle={handleMobileMenuToggle} />
            </div>
          </div>
        </div>
      </nav>

      {/* Modals */}
      <LoginModal 
        isOpen={showLoginModal}
        onClose={handleCloseModals}
        onSwitchToRegister={handleSwitchToRegister}
        refreshUser={refreshUser}
      />

      <RegisterModal 
        isOpen={showRegisterModal}
        onClose={handleCloseModals}
        onSwitchToLogin={handleSwitchToLogin}
      />

      <MembershipModal 
        isOpen={showMembershipModal}
        onClose={handleCloseModals}
        onSuccess={handleMembershipSuccess}
      />
    </>
  );
}