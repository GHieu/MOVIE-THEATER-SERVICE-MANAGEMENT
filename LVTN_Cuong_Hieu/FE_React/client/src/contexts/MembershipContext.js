import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { getMembershipProfile } from '../services/apiMemberships';
import { useAuth } from '../hooks/useAuth';

const MembershipContext = createContext();

export const MembershipProvider = ({ children }) => {
  const { user } = useAuth();

  const [point, setPoint] = useState(0);
  const [membership, setMembership] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true); // Chỉ loading lần đầu
  const [isUpdatingPoints, setIsUpdatingPoints] = useState(false); // Riêng cho việc update points

  const fetchMembership = async (isInitial = false) => {
    if (isInitial) setInitialLoading(true);
    try {
      const data = await getMembershipProfile();
      console.log('Membership fetched:', data);
      setPoint(data.point);
      setMembership(data);
    } catch (err) {
      console.error('Lỗi khi lấy membership:', err);
      setMembership(null);
    } finally {
      if (isInitial) setInitialLoading(false);
    }
  };

  // Hàm update points mà không làm loading toàn bộ component
  const updatePoints = useCallback(async () => {
    if (!user || !membership) return;
    
    setIsUpdatingPoints(true);
    try {
      const data = await getMembershipProfile();
      setPoint(data.point);
      // Chỉ update point và total_points, không thay đổi loading state
      setMembership(prev => ({
        ...prev,
        point: data.point,
        total_points: data.total_points
      }));
    } catch (err) {
      console.error('Lỗi khi update points:', err);
    } finally {
      setIsUpdatingPoints(false);
    }
  }, [user, membership]);

  // Hàm refresh toàn bộ membership (dùng khi cần)
  const refreshMembership = useCallback(() => {
    fetchMembership(false); // Không set initialLoading
  }, []);

  useEffect(() => {
    if (user) fetchMembership(true); // Set initialLoading = true
  }, [user]);

  // Gộp tất cả value vào memo để tránh re-render không cần thiết
  const value = useMemo(() => ({
    point,
    setPoint,
    membership,
    hasMembership: !!membership,
    points: membership?.point || 0,
    totalPoints: membership?.total_points || 0,
    memberType: membership?.member_type || 'Silver',
    loading: initialLoading, // Chỉ loading lần đầu
    isUpdatingPoints, // Thêm state này để biết khi nào đang update points
    updatePoints, // Hàm update chỉ points
    refreshMembership, // Hàm refresh toàn bộ
    refetchMembership: refreshMembership, // Giữ lại để backward compatible
  }), [point, membership, initialLoading, isUpdatingPoints, updatePoints, refreshMembership]);

  return (
    <MembershipContext.Provider value={value}>
      {children}
    </MembershipContext.Provider>
  );
};

export const useMembership = () => {
  const context = useContext(MembershipContext);
  if (!context) {
    throw new Error('useMembership phải được dùng trong MembershipProvider');
  }
  return context;
};