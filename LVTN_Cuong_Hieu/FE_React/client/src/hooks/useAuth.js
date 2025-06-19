import { useState, useEffect, useCallback } from 'react';
import { getCurrentUser, refreshUserData, isAuthenticated, getUser } from '../services/authService';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Hàm load user data
  const loadUser = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // ✅ SỬA: Kiểm tra localStorage trước
      const localUser = getUser();
      
      if (localUser && isAuthenticated()) {
        setUser(localUser);
        
        // Thử refresh data từ server
        try {
          const refreshedUser = await getCurrentUser();
          setUser(refreshedUser);
        } catch (refreshError) {
          console.warn('Không thể refresh user data:', refreshError);
          // Giữ user data từ localStorage nếu refresh thất bại
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Lỗi khi load user:', error);
      setError(error.message);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Hàm refresh user data
  const refreshUser = useCallback(async () => {
    try {
      if (isAuthenticated()) {
        const refreshedUser = await getCurrentUser();
        setUser(refreshedUser);
        return refreshedUser;
      } else {
        setUser(null);
        return null;
      }
    } catch (error) {
      console.error('Lỗi khi refresh user:', error);
      // Nếu refresh lỗi (token hết hạn), clear user
      setUser(null);
      throw error;
    }
  }, []);

  // Hàm logout
  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

  // Effect để load user khi component mount
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // Effect để listen localStorage changes (multi-tab support)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'user' || e.key === 'token') {
        loadUser();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [loadUser]);

  return {
    user,
    loading,
    error,
    refreshUser,
    logout,
    isAuthenticated: !!user && isAuthenticated(),
  };
};