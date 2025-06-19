// contexts/BookingContext.js
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Initial state
const initialState = {
  // Movie info
  movieId: null,
  movieInfo: null,
  
  // Showtime info
  selectedDate: null,
  selectedTime: null,
  currentShowtime: null,
  
  // Seats
  selectedSeats: [],
  seatPrices: {},
  
  // Services
  selectedServices: {},
  serviceTotal: 0,
  
  // Totals
  ticketTotal: 0,
  finalTotal: 0,
  
  // Timer
  sessionStartTime: null,
  timeLeft: 0,
  sessionActive: false, // Add this flag
  
  // Flow state
  currentStep: 'movie-selection', // 'movie-selection' | 'seat-selection' | 'food-selection' | 'payment' | 'completed'
  
  // Validation
  isValid: false
};

// Action types
const BOOKING_ACTIONS = {
  // Movie actions
  SET_MOVIE: 'SET_MOVIE',
  
  // Showtime actions
  SET_SHOWTIME: 'SET_SHOWTIME',
  
  // Seat actions
  SET_SELECTED_SEATS: 'SET_SELECTED_SEATS',
  ADD_SEAT: 'ADD_SEAT',
  REMOVE_SEAT: 'REMOVE_SEAT',
  CLEAR_SEATS: 'CLEAR_SEATS',
  
  // Service actions
  SET_SERVICE_QUANTITY: 'SET_SERVICE_QUANTITY',
  CLEAR_SERVICES: 'CLEAR_SERVICES',
  
  // Timer actions
  START_SESSION: 'START_SESSION',
  UPDATE_TIME_LEFT: 'UPDATE_TIME_LEFT',
  EXPIRE_SESSION: 'EXPIRE_SESSION',
  
  // Flow actions
  SET_STEP: 'SET_STEP',
  CALCULATE_TOTALS: 'CALCULATE_TOTALS',
  
  // Reset
  RESET_BOOKING: 'RESET_BOOKING'
};

// Reducer
const bookingReducer = (state, action) => {
  switch (action.type) {
    case BOOKING_ACTIONS.SET_MOVIE:
      return {
        ...state,
        movieId: action.payload.id,
        movieInfo: action.payload,
        currentStep: 'seat-selection'
      };
      
    case BOOKING_ACTIONS.SET_SHOWTIME:
      return {
        ...state,
        selectedDate: action.payload.date,
        selectedTime: action.payload.time,
        currentShowtime: action.payload.showtime,
        // Clear seats when showtime changes
        selectedSeats: [],
        seatPrices: {}
      };
      
    case BOOKING_ACTIONS.SET_SELECTED_SEATS:
      return {
        ...state,
        selectedSeats: action.payload.seats,
        seatPrices: action.payload.prices
      };
      
    case BOOKING_ACTIONS.ADD_SEAT:
      return {
        ...state,
        selectedSeats: [...state.selectedSeats, action.payload.seatId],
        seatPrices: {
          ...state.seatPrices,
          [action.payload.seatId]: action.payload.price
        }
      };
      
    case BOOKING_ACTIONS.REMOVE_SEAT:
      const newSeats = state.selectedSeats.filter(seat => seat !== action.payload);
      const newPrices = { ...state.seatPrices };
      delete newPrices[action.payload];
      
      return {
        ...state,
        selectedSeats: newSeats,
        seatPrices: newPrices
      };
      
    case BOOKING_ACTIONS.CLEAR_SEATS:
      return {
        ...state,
        selectedSeats: [],
        seatPrices: {}
      };
      
    case BOOKING_ACTIONS.SET_SERVICE_QUANTITY:
      const newServices = { ...state.selectedServices };
      if (action.payload.quantity <= 0) {
        delete newServices[action.payload.serviceId];
      } else {
        newServices[action.payload.serviceId] = action.payload.quantity;
      }
      
      return {
        ...state,
        selectedServices: newServices
      };
      
    case BOOKING_ACTIONS.CLEAR_SERVICES:
      return {
        ...state,
        selectedServices: {},
        serviceTotal: 0
      };
      
    case BOOKING_ACTIONS.START_SESSION:
      return {
        ...state,
        sessionStartTime: Date.now(),
        timeLeft: action.payload.duration || 300, // 5 minutes default
        sessionActive: true, // Mark session as active
        currentStep: 'seat-selection'
      };
      
    case BOOKING_ACTIONS.UPDATE_TIME_LEFT:
      return {
        ...state,
        timeLeft: Math.max(0, action.payload)
      };
      
    case BOOKING_ACTIONS.EXPIRE_SESSION:
      return {
        ...initialState,
        movieId: state.movieId,
        movieInfo: state.movieInfo
      };
      
    case BOOKING_ACTIONS.SET_STEP:
      return {
        ...state,
        currentStep: action.payload
      };
      
    case BOOKING_ACTIONS.CALCULATE_TOTALS:
      const ticketTotal = Object.values(state.seatPrices).reduce((sum, price) => sum + price, 0);
      const serviceTotal = action.payload.serviceTotal || 0;
      
      return {
        ...state,
        ticketTotal,
        serviceTotal,
        finalTotal: ticketTotal + serviceTotal,
        isValid: state.selectedSeats.length > 0 && state.currentShowtime
      };
      
    case BOOKING_ACTIONS.RESET_BOOKING:
      return initialState;
      
    default:
      return state;
  }
};

// Context
const BookingContext = createContext();

// Provider component
export const BookingProvider = ({ children }) => {
  const [state, dispatch] = useReducer(bookingReducer, initialState);
  const navigate = useNavigate();

  // Timer effect
  useEffect(() => {
    if (state.sessionActive && state.sessionStartTime && state.timeLeft > 0) {
      const timer = setInterval(() => {
        const elapsed = Math.floor((Date.now() - state.sessionStartTime) / 1000);
        const remaining = Math.max(0, 300 - elapsed); // 5 minutes = 300 seconds
        
        dispatch({ 
          type: BOOKING_ACTIONS.UPDATE_TIME_LEFT, 
          payload: remaining 
        });
        
        if (remaining <= 0) {
          handleSessionExpired();
        }
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [state.sessionActive, state.sessionStartTime, state.timeLeft]);

  // Session expired handler
  const handleSessionExpired = () => {
    alert('Thời gian giữ ghế đã hết! Vui lòng đặt vé lại.');
    dispatch({ type: BOOKING_ACTIONS.EXPIRE_SESSION });
    navigate('/movies');
  };

  // Action creators
  const actions = {
    // Movie actions
    setMovie: (movieData) => {
      dispatch({ 
        type: BOOKING_ACTIONS.SET_MOVIE, 
        payload: movieData 
      });
    },
    
    // Showtime actions
    setShowtime: (date, time, showtime) => {
      dispatch({ 
        type: BOOKING_ACTIONS.SET_SHOWTIME, 
        payload: { date, time, showtime } 
      });
      // Start session when showtime is selected
      dispatch({ 
        type: BOOKING_ACTIONS.START_SESSION, 
        payload: { duration: 300 } 
      });
    },
    
    // Seat actions
    toggleSeat: (seatId, price) => {
      if (state.selectedSeats.includes(seatId)) {
        dispatch({ 
          type: BOOKING_ACTIONS.REMOVE_SEAT, 
          payload: seatId 
        });
      } else {
        dispatch({ 
          type: BOOKING_ACTIONS.ADD_SEAT, 
          payload: { seatId, price } 
        });
      }
    },
    
    clearSeats: () => {
      dispatch({ type: BOOKING_ACTIONS.CLEAR_SEATS });
    },
    
    // Service actions
    setServiceQuantity: (serviceId, quantity) => {
      dispatch({ 
        type: BOOKING_ACTIONS.SET_SERVICE_QUANTITY, 
        payload: { serviceId, quantity } 
      });
    },
    
    updateServiceQuantity: (serviceId, delta) => {
      const currentQuantity = state.selectedServices[serviceId] || 0;
      const newQuantity = Math.max(0, currentQuantity + delta);
      actions.setServiceQuantity(serviceId, newQuantity);
    },
    
    // Flow actions
    setStep: (step) => {
      dispatch({ 
        type: BOOKING_ACTIONS.SET_STEP, 
        payload: step 
      });
    },
    
    calculateTotals: (serviceTotal = 0) => {
      dispatch({ 
        type: BOOKING_ACTIONS.CALCULATE_TOTALS, 
        payload: { serviceTotal } 
      });
    },
    
    // Navigation helpers
    goToSeatSelection: () => {
      actions.setStep('seat-selection');
      navigate(`/booking/${state.movieId}?date=${state.selectedDate}&time=${state.selectedTime}`);
    },
    
    goToFoodSelection: () => {
      if (state.selectedSeats.length === 0) {
        alert('Vui lòng chọn ghế trước!');
        return;
      }
      actions.setStep('food-selection');
      navigate('/food');
    },
    
    goToPayment: () => {
      actions.setStep('payment');
      navigate('/payment');
    },
    
    // Reset
    reset: () => {
      dispatch({ type: BOOKING_ACTIONS.RESET_BOOKING });
    }
  };

  // Validation helpers
  const validators = {
    canProceedToFood: () => {
      return state.selectedSeats.length > 0 && state.currentShowtime && state.timeLeft > 0;
    },
    
    canProceedToPayment: () => {
      return validators.canProceedToFood() && state.finalTotal > 0;
    },
    
    isSessionValid: () => {
      // If no session started yet, it's still valid (user can start booking)
      if (!state.sessionActive) return true;
      // If session started, check if time is still left
      return state.timeLeft > 0 && state.sessionStartTime;
    },
    
    isSessionExpired: () => {
      return state.sessionActive && state.timeLeft <= 0;
    }
  };

  const value = {
    // State
    ...state,
    
    // Actions
    ...actions,
    
    // Validators
    ...validators,
    
    // Raw dispatch for custom actions
    dispatch
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
};

// Custom hook
export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};

// HOC for protected routes
export const withBookingValidation = (Component, requiredStep) => {
  return (props) => {
    const { currentStep, isSessionValid } = useBooking();
    const navigate = useNavigate();
    
    useEffect(() => {
      if (!isSessionValid()) {
        navigate('/movies');
        return;
      }
      
      // Add step validation logic here if needed
    }, [currentStep, navigate]);
    
    if (!isSessionValid()) {
      return <div>Redirecting...</div>;
    }
    
    return <Component {...props} />;
  };
};