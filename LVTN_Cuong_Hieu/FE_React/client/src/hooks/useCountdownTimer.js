import { useState, useEffect, useRef, useCallback } from 'react';

const useCountdownTimer = (initialTime = 5 * 60, onExpired, dependencies = []) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isExpired, setIsExpired] = useState(false);
  const timerRef = useRef(null);
  const timeRef = useRef(initialTime); 
  const isInitialMount = useRef(true);
  const onExpiredRef = useRef(onExpired);

  // Update callback ref khi onExpired thay đổi
  useEffect(() => {
    onExpiredRef.current = onExpired;
  }, [onExpired]);

  // Hàm xử lý khi hết thời gian
  const handleTimeExpired = useCallback(() => {
    console.log('Timer expired, calling onExpired callback');
    setIsExpired(true);
    
    if (onExpiredRef.current) {
      // Delay nhỏ để đảm bảo state đã update
      setTimeout(() => {
        onExpiredRef.current();
      }, 100);
    }
    
    // Xóa thông tin booking cũ
    sessionStorage.removeItem('lastBookingInfo');
  }, []);

  // Clean up timer function
  const cleanupTimer = useCallback(() => {
    if (timerRef.current) {
      console.log('Cleaning up timer');
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Start timer function
  const startTimer = useCallback(() => {
    if (timerRef.current || timeRef.current <= 0) {
      return; // Timer đã chạy hoặc đã hết giờ
    }

    console.log('Starting timer with time:', timeRef.current);
    
    timerRef.current = setInterval(() => {
      timeRef.current -= 1;
      
      if (timeRef.current <= 0) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        setTimeLeft(0);
        handleTimeExpired();
      } else {
        setTimeLeft(timeRef.current);
      }
    }, 1000);
  }, [handleTimeExpired]);

  // Reset timer dựa trên dependencies
  useEffect(() => {
    const [showtimeId, selectedSeats] = dependencies;

    if (isInitialMount.current) {
      isInitialMount.current = false;
      const initialBookingInfo = `${showtimeId || ''}-${selectedSeats?.join(',') || ''}`;
      sessionStorage.setItem('lastBookingInfo', initialBookingInfo);
      return;
    }

    if (!showtimeId || !selectedSeats || !Array.isArray(selectedSeats)) {
      console.log('Invalid dependencies, resetting timer');
      cleanupTimer();
      timeRef.current = initialTime;
      setTimeLeft(initialTime);
      setIsExpired(false);
      sessionStorage.setItem('lastBookingInfo', '');
      return;
    }

    const currentBookingInfo = `${showtimeId}-${selectedSeats.join(',')}`;
    const lastBookingInfo = sessionStorage.getItem('lastBookingInfo');

    console.log('Checking booking info change:', {
      current: currentBookingInfo,
      last: lastBookingInfo
    });

    if (lastBookingInfo !== currentBookingInfo) {
      console.log('Booking changed, resetting timer');
      
      // Reset timer cho booking mới
      cleanupTimer();
      sessionStorage.setItem('lastBookingInfo', currentBookingInfo);
      timeRef.current = initialTime;
      setTimeLeft(initialTime);
      setIsExpired(false);
      
      // Start timer sau khi reset
      setTimeout(startTimer, 100);
    }
  }, [dependencies, initialTime, cleanupTimer, startTimer]);

  // Khởi động timer lần đầu
  useEffect(() => {
    if (timeRef.current > 0 && !isExpired && !timerRef.current) {
      const timeoutId = setTimeout(startTimer, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [startTimer, isExpired]);

  // Cập nhật khi initialTime thay đổi
  useEffect(() => {
    if (initialTime !== timeRef.current && initialTime > 0) {
      console.log('Initial time changed:', initialTime);
      cleanupTimer();
      timeRef.current = initialTime;
      setTimeLeft(initialTime);
      setIsExpired(false);
      
      // Restart timer nếu cần
      setTimeout(startTimer, 100);
    }
  }, [initialTime, cleanupTimer, startTimer]);

  // Cleanup khi component unmount
  useEffect(() => {
    return () => {
      cleanupTimer();
    };
  }, [cleanupTimer]);

  // Xử lý khi isExpired thay đổi từ bên ngoài
  useEffect(() => {
    if (isExpired && timerRef.current) {
      cleanupTimer();
    }
  }, [isExpired, cleanupTimer]);

  // Debug logging
  useEffect(() => {
    console.log('Timer state:', {
      timeLeft,
      isExpired,
      hasTimer: !!timerRef.current,
      timeRef: timeRef.current
    });
  }, [timeLeft, isExpired]);

  return { 
    timeLeft, 
    isExpired,
    // Expose methods for manual control if needed
    resetTimer: useCallback(() => {
      cleanupTimer();
      timeRef.current = initialTime;
      setTimeLeft(initialTime);
      setIsExpired(false);
      setTimeout(startTimer, 100);
    }, [cleanupTimer, initialTime, startTimer])
  };
};

export default useCountdownTimer;