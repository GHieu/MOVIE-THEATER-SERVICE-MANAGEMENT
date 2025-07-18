// hooks/useMembership.js
import { useState, useEffect, useCallback } from 'react';
import { addMemberships, getMembershipProfile, checkMembershipStatus } from '../services/apiMemberships';

export const useMembership = () => {
  const [membership, setMembership] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Lấy thông tin membership
  const fetchMembership = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const profile = await getMembershipProfile();
      setMembership(profile);
    } catch (err) {
      if (err.response?.status === 404) {
        setMembership(null);
        setError(null);
      } else {
        setError(err.response?.data?.message || err.message);
        setMembership(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Đăng ký membership
  const registerMembershipCard = async () => {
    try {
      setError(null);
      const result = await addMemberships({ member_type: 'Silver' }); // Gán mặc định Silver
      setMembership(result.membership);
      setTimeout(() => {
        fetchMembership();
      }, 100);
      return {
        success: true,
        message: result.message,
        membership: result.membership
      };
    } catch (err) {
      const errorMessage = err.response?.data?.errors
        ? Object.values(err.response.data.errors).flat().join(', ')
        : err.response?.data?.message || err.message;
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage
      };
    }
  };

  // Refresh membership data
  const refreshMembership = useCallback(() => {
    fetchMembership();
  }, [fetchMembership]);

  useEffect(() => {
    fetchMembership();
  }, [fetchMembership]);

  return {
    membership,
    loading,
    error,
    registerMembershipCard,
    refreshMembership,
    hasMembership: membership !== null,
    memberType: membership?.member_type || null,
    points: membership?.point || 0,
    totalPoints: membership?.total_points || 0
  };
};