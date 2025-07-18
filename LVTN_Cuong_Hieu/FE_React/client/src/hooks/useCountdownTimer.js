import { useState, useEffect, useRef, useCallback } from 'react';

const useCountdownTimer = (initialTime = 5 * 60, onExpired, dependencies = [], stopCountdown = false) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isExpired, setIsExpired] = useState(false);
  const timerRef = useRef(null);
  const timeRef = useRef(initialTime); 
  const isInitialMount = useRef(true);
  const onExpiredRef = useRef(onExpired);
  const stopCountdownRef = useRef(stopCountdown); // ✅ Thêm ref cho stopCountdown
  const hasExpiredRef = useRef(false);

  // ✅ Cập nhật stopCountdown ref
  useEffect(() => {
    stopCountdownRef.current = stopCountdown;
  }, [stopCountdown]);

  // Update callback ref khi onExpired thay đổi
  useEffect(() => {
    onExpiredRef.current = onExpired;
  }, [onExpired]);

  // Hàm xử lý khi hết thời gian
  const handleTimeExpired = useCallback(() => {
    // ✅ Kiểm tra stopCountdown trước khi gọi callback
    if (stopCountdownRef.current) {
      console.log('Timer expired but countdown is stopped, skipping callback');
      return;
    }
    
    console.log('Timer expired, calling onExpired callback');
    setIsExpired(true);
    
    if (onExpiredRef.current) {
      setTimeout(() => {
        // ✅ Kiểm tra lại lần nữa trước khi gọi callback
        if (!stopCountdownRef.current) {
          onExpiredRef.current();
        }
      }, 100);
    }
    if (hasExpiredRef.current) return;
        hasExpiredRef.current = true;
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
    if (timerRef.current || timeRef.current <= 0 || stopCountdownRef.current) {
      return; // ✅ Sử dụng ref thay vì state
    }

    console.log('Starting timer with time:', timeRef.current);
    
    timerRef.current = setInterval(() => {
      // ✅ Kiểm tra stopCountdown trong mỗi tick
      if (stopCountdownRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        console.log('Timer stopped due to stopCountdown');
        return;
      }
      
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

    // console.log('Checking booking info change:', {
    //   current: currentBookingInfo,
    //   last: lastBookingInfo
    // });

    if (lastBookingInfo !== currentBookingInfo) {
      console.log('Booking changed, resetting timer');
      
      cleanupTimer();
      sessionStorage.setItem('lastBookingInfo', currentBookingInfo);
      timeRef.current = initialTime;
      setTimeLeft(initialTime);
      setIsExpired(false);
      
      // ✅ Kiểm tra stopCountdown trước khi start
      if (!stopCountdownRef.current) {
        setTimeout(startTimer, 100);
      }
    }
  }, [dependencies, initialTime, cleanupTimer, startTimer]);

  // Khởi động timer lần đầu
  useEffect(() => {
    if (timeRef.current > 0 && !isExpired && !timerRef.current && !stopCountdownRef.current) {
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
      
      // ✅ Kiểm tra stopCountdown trước khi restart
      if (!stopCountdownRef.current) {
        setTimeout(startTimer, 100);
      }
    }
  }, [initialTime, cleanupTimer, startTimer]);

  // ✅ Effect chính để xử lý khi stopCountdown thay đổi
  useEffect(() => {
    if (stopCountdown) {
      console.log('🛑 stopCountdown được bật - dừng timer');
      cleanupTimer();
    } else if (!stopCountdown && timeRef.current > 0 && !isExpired && !timerRef.current) {
      console.log('🟢 stopCountdown được tắt - khởi động lại timer');
      setTimeout(startTimer, 100);
    }
  }, [stopCountdown, cleanupTimer, startTimer, isExpired]);

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

  // // ✅ Debug logging - chỉ log khi cần thiết, không log liên tục
  // useEffect(() => {
  //   if (process.env.NODE_ENV === 'development') {
  //     console.log('Timer state changed:', {
  //       timeLeft,
  //       isExpired,
  //       stopCountdown,
  //       hasTimer: !!timerRef.current,
  //       timeRef: timeRef.current
  //     });
  //   }
  // }, [timeLeft, isExpired, stopCountdown]);

  return { 
    timeLeft, 
    isExpired,
    resetTimer: useCallback(() => {
      if (stopCountdownRef.current) return;
      
      cleanupTimer();
      timeRef.current = initialTime;
      setTimeLeft(initialTime);
      setIsExpired(false);
      setTimeout(startTimer, 100);
    }, [cleanupTimer, initialTime, startTimer])
  };
};

export default useCountdownTimer;