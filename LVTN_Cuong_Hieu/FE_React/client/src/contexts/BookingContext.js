// utils/bookingFlow.js
import React from "react";
import useNavigate from "react-router-dom";
export const BOOKING_STEPS = {
  SHOWTIME_SELECTION: 'showtime_selection',
  SEAT_SELECTION: 'seat_selection', 
  FOOD_SELECTION: 'food_selection',
  PAYMENT: 'payment',
  CONFIRMATION: 'confirmation'
};

export const STEP_ORDER = [
  BOOKING_STEPS.SHOWTIME_SELECTION,
  BOOKING_STEPS.SEAT_SELECTION,
  BOOKING_STEPS.FOOD_SELECTION,
  BOOKING_STEPS.PAYMENT,
  BOOKING_STEPS.CONFIRMATION
];

// Tạo booking session token
export const createBookingSession = () => {
  const token = Date.now().toString(36) + Math.random().toString(36).substr(2);
  const sessionData = {
    token,
    startTime: Date.now(),
    currentStep: BOOKING_STEPS.SHOWTIME_SELECTION,
    completedSteps: [],
    expiresAt: Date.now() + (30 * 60 * 1000) // 30 phút
  };
  
  sessionStorage.setItem('bookingSession', JSON.stringify(sessionData));
  return token;
};

// Validate booking session
export const validateBookingSession = (requiredStep) => {
  try {
    const sessionData = JSON.parse(sessionStorage.getItem('bookingSession') || '{}');
    
    if (!sessionData.token) {
      throw new Error('NO_SESSION');
    }
    
    if (Date.now() > sessionData.expiresAt) {
      sessionStorage.removeItem('bookingSession');
      throw new Error('SESSION_EXPIRED');
    }
    
    const requiredStepIndex = STEP_ORDER.indexOf(requiredStep);
    const currentStepIndex = STEP_ORDER.indexOf(sessionData.currentStep);
    
    // Kiểm tra xem có đang ở đúng step hoặc step tiếp theo không
    if (requiredStepIndex > currentStepIndex + 1) {
      throw new Error('INVALID_STEP_ORDER');
    }
    
    // Kiểm tra các step bắt buộc đã hoàn thành chưa
    const requiredPreviousSteps = STEP_ORDER.slice(0, requiredStepIndex);
    const missingSteps = requiredPreviousSteps.filter(step => 
      !sessionData.completedSteps.includes(step)
    );
    
    if (missingSteps.length > 0) {
      throw new Error('MISSING_REQUIRED_STEPS');
    }
    
    return sessionData;
  } catch (error) {
    throw error;
  }
};

// Cập nhật step hiện tại
export const updateBookingStep = (newStep, data = {}) => {
  try {
    const sessionData = JSON.parse(sessionStorage.getItem('bookingSession') || '{}');
    
    if (!sessionData.token) {
      throw new Error('NO_SESSION');
    }
    
    const currentStepIndex = STEP_ORDER.indexOf(sessionData.currentStep);
    const newStepIndex = STEP_ORDER.indexOf(newStep);
    
    // Chỉ cho phép tiến lên step tiếp theo hoặc ở lại step hiện tại
    if (newStepIndex > currentStepIndex + 1) {
      throw new Error('INVALID_STEP_PROGRESSION');
    }
    
    // Đánh dấu step hiện tại đã hoàn thành nếu tiến lên step mới
    if (newStepIndex > currentStepIndex && !sessionData.completedSteps.includes(sessionData.currentStep)) {
      sessionData.completedSteps.push(sessionData.currentStep);
    }
    
    sessionData.currentStep = newStep;
    sessionData.lastUpdated = Date.now();
    
    // Merge data vào session
    if (data) {
      sessionData.data = { ...sessionData.data, ...data };
    }
    
    sessionStorage.setItem('bookingSession', JSON.stringify(sessionData));
    return sessionData;
  } catch (error) {
    throw error;
  }
};

// Xóa booking session
export const clearBookingSession = () => {
  sessionStorage.removeItem('bookingSession');
  sessionStorage.removeItem('bookingData');
  sessionStorage.removeItem('seatHoldStartTime');
  sessionStorage.removeItem('lastBookingInfo');
};

// Kiểm tra tính hợp lệ của booking data
export const validateBookingData = (step, data) => {
  switch (step) {
    case BOOKING_STEPS.SEAT_SELECTION:
      return data.movieId && data.showtimeId && data.selectedSeats?.length > 0;
    
    case BOOKING_STEPS.FOOD_SELECTION:
      return data.movieId && data.showtimeId && data.selectedSeats?.length > 0 && data.bookingTotal > 0;
    
    case BOOKING_STEPS.PAYMENT:
      return data.movieId && data.showtimeId && data.selectedSeats?.length > 0 && data.finalTotal > 0;
    
    case BOOKING_STEPS.CONFIRMATION:
      return data.finalTotal > 0 && data.ticketId;
    
    default:
      return true;
  }
};

// Hook để sử dụng booking security
export const useBookingSecurity = (currentStep) => {
  const navigate = useNavigate();
  
  const checkAccess = React.useCallback(() => {
    try {
      const sessionData = validateBookingSession(currentStep);
      const bookingData = JSON.parse(sessionStorage.getItem('bookingData') || '{}');
      
      if (!validateBookingData(currentStep, bookingData)) {
        throw new Error('INVALID_BOOKING_DATA');
      }
      
      return { isValid: true, sessionData, bookingData };
    } catch (error) {
      console.error('Booking access denied:', error.message);
      
      // Xử lý các loại lỗi khác nhau
      switch (error.message) {
        case 'NO_SESSION':
        case 'SESSION_EXPIRED':
          clearBookingSession();
          navigate('/movies', { replace: true });
          break;
        
        case 'INVALID_STEP_ORDER':
        case 'MISSING_REQUIRED_STEPS':
        case 'INVALID_BOOKING_DATA':
          // Chuyển về step trước đó hợp lệ
          const validStep = findValidStep();
          if (validStep) {
            navigate(getStepPath(validStep), { replace: true });
          } else {
            clearBookingSession();
            navigate('/movies', { replace: true });
          }
          break;
        
        default:
          clearBookingSession();
          navigate('/movies', { replace: true });
      }
      
      return { isValid: false, error: error.message };
    }
  }, [currentStep, navigate]);
  
  const findValidStep = () => {
    try {
      const sessionData = JSON.parse(sessionStorage.getItem('bookingSession') || '{}');
      const bookingData = JSON.parse(sessionStorage.getItem('bookingData') || '{}');
      
      // Tìm step hợp lệ cuối cùng
      for (let i = STEP_ORDER.length - 1; i >= 0; i--) {
        const step = STEP_ORDER[i];
        if (sessionData.completedSteps.includes(step) && validateBookingData(step, bookingData)) {
          return step;
        }
      }
      
      return BOOKING_STEPS.SHOWTIME_SELECTION;
    } catch {
      return BOOKING_STEPS.SHOWTIME_SELECTION;
    }
  };
  
  const getStepPath = (step) => {
    const bookingData = JSON.parse(sessionStorage.getItem('bookingData') || '{}');
    
    switch (step) {
      case BOOKING_STEPS.SHOWTIME_SELECTION:
        return `/movie/${bookingData.movieId}`;
      case BOOKING_STEPS.SEAT_SELECTION:
        return `/booking/${bookingData.movieId}`;
      case BOOKING_STEPS.FOOD_SELECTION:
        return '/food';
      case BOOKING_STEPS.PAYMENT:
        return '/payment';
      default:
        return '/movies';
    }
  };
  
  return { checkAccess, updateStep: updateBookingStep, clearSession: clearBookingSession };
};

// Component bảo vệ route
export const BookingSecurityGuard = ({ children, step }) => {
  const { checkAccess } = useBookingSecurity(step);
  const [isChecking, setIsChecking] = React.useState(true);
  const [isValid, setIsValid] = React.useState(false);
  
  React.useEffect(() => {
    const result = checkAccess();
    setIsValid(result.isValid);
    setIsChecking(false);
  }, [checkAccess]);
  
  if (isChecking) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }
  
  return isValid ? children : null;
};