import { useState, useEffect } from 'react';
import { getMembership, addMemberships, updateMembership } from '../../services/ADMINS/apiAdminMemberships';

export const useAdminMembership = () => {
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Function to determine member type based on total_points - CẬP NHẬT THEO BE MỚI
  const getMemberTypeByPoints = (points) => {
    if (points >= 1000) {
      return 'Diamond';
    } else if (points >= 300) {
      return 'Gold';
    } else {
      return 'Silver';
    }
  };

  // Fetch all memberships
  const fetchMemberships = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMembership();
      setMemberships(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch memberships');
    } finally {
      setLoading(false);
    }
  };

  // Add new membership - Backend sẽ tự động tính member_type
  const addMembership = async (membershipData) => {
    try {
      setLoading(true);
      setError(null);
      
      const dataToSend = {
        customer_id: membershipData.customer_id,
        point: membershipData.point,
        total_points: membershipData.total_points || membershipData.point // Sử dụng total_points nếu có, không thì dùng point
      };
      
      console.log('Adding membership:', dataToSend);
      
      const newMembership = await addMemberships(dataToSend);
      console.log('Add response:', newMembership);
      
      // Fetch lại data để đảm bảo có data mới nhất từ backend
      await fetchMemberships();
      
      return { 
        success: true, 
        data: newMembership,
        autoCalculated: true
      };
    } catch (err) {
      const errorMsg = err.response?.data?.errors || err.response?.data?.message || 'Failed to add membership';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Update membership - Backend sẽ tự động tính lại member_type
  const updateMembershipData = async (id, membershipData) => {
    try {
      setLoading(true);
      setError(null);
      
      const dataToSend = {
        point: membershipData.point
      };
      
      // Nếu cần cập nhật total_points
      if (membershipData.updateTotalPoints) {
        dataToSend.total_points = membershipData.point;
      }
      
      console.log('Updating membership:', { id, dataToSend });
      
      const updatedMembership = await updateMembership(id, dataToSend);
      console.log('Update response:', updatedMembership);
      
      // Delay một chút để backend xử lý xong
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Fetch lại data để đảm bảo đồng bộ với backend
      await fetchMemberships();
      
      return { 
        success: true, 
        data: updatedMembership,
        backendProcessed: true
      };
    } catch (err) {
      console.error('Update error:', err);
      const errorMsg = err.response?.data?.errors || err.response?.data?.message || 'Failed to update membership';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Utility function to get tier info - CẬP NHẬT THEO BE MỚI
  const getTierInfo = (points) => {
  const totalPoints = points || 0;
  const memberType = getMemberTypeByPoints(totalPoints);
  let nextTier = null;
  let pointsToNext = 0;
  let progress = 0;

  if (totalPoints < 300) {
    nextTier = 'Gold';
    pointsToNext = 300 - totalPoints;
    progress = (totalPoints / 300) * 100;
  } else if (totalPoints < 1000) {
    nextTier = 'Diamond';
    pointsToNext = 1000 - totalPoints;
    progress = ((totalPoints - 300) / (1000 - 300)) * 100;
  } else {
    progress = 100; // Đã đạt tier cao nhất
  }

  return {
    currentTier: memberType,
    nextTier,
    pointsToNext,
    progress: Math.min(progress, 100)
  };
};

  // Load memberships on mount
  useEffect(() => {
    fetchMemberships();
  }, []);

  // Debug: Log memberships khi có thay đổi
  useEffect(() => {
    if (memberships.length > 0) {
      console.log('Current memberships:', memberships.map(m => ({
        id: m.id,
        points: m.total_points || m.point,
        member_type: m.member_type,
        calculated_type: getMemberTypeByPoints(m.total_points || m.point || 0)
      })));
    }
  }, [memberships]);

  return {
    memberships,
    loading,
    error,
    fetchMemberships,
    addMembership,
    updateMembership: updateMembershipData,
    setError,
    getMemberTypeByPoints,
    getTierInfo
  };
};