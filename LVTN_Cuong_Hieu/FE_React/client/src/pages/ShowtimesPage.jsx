import React, { useState, useMemo, useEffect } from 'react';
import useShowtimes from '../hooks/useShowtimes';
import useMoviesUser from '../hooks/useMovieUser';
import useRatingMovies from '../hooks/useRatingMovies';
import ShowtimeCard from '../components/Showtimepage/ShowtimeCard';
import DateTabs from '../components/Showtimepage/DateTabs';
import LoadingSpinner from '../components/Showtimepage/LoadingSpinner';
import ErrorMessage from '../components/Showtimepage/ErrorMessage';
import EmptyState from '../components/Showtimepage/EmptyState';

export default function MovieSchedulePage() {
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    
    // Sử dụng CÙNG LOGIC như trong DateTabs để tạo date string
    const todayString = today.getFullYear() + '-' + 
      String(today.getMonth() + 1).padStart(2, '0') + '-' + 
      String(today.getDate()).padStart(2, '0');
    
    console.log('MovieSchedulePage - Initial selected date:', todayString);
    return todayString;
  });
  
  const { 
    showtimes, 
    loading: showtimesLoading, 
    error: showtimesError, 
    loadShowtimes, 
    filterShowtimesByDate 
  } = useShowtimes();

  const {
    nowShowing,
    comingSoon,
    loading: moviesLoading,
    error: moviesError
  } = useMoviesUser();

  // Fetch reviews
  const { reviews, fetchReviews } = useRatingMovies();

  useEffect(() => {
    loadShowtimes();
    fetchReviews(); // Fetch reviews when component mounts
  }, [loadShowtimes]);
  
  const allMoviesData = useMemo(() => {
    const combined = [...nowShowing, ...comingSoon];
    return combined.reduce((acc, movie) => {
      acc[movie.id] = movie;
      return acc;
    }, {});
  }, [nowShowing, comingSoon]);

  // Fix: Ensure all movies have proper poster URLs
 // Cập nhật phần movieShowtimes trong MovieSchedulePage.jsx
// Chỉ hiển thị phim đang chiếu

const movieShowtimes = useMemo(() => {
  const filteredShowtimes = filterShowtimesByDate(selectedDate);
  
  // Tạo Set các ID phim đang chiếu để check nhanh
  const nowShowingIds = new Set(nowShowing.map(movie => movie.id));
  
  const grouped = filteredShowtimes.reduce((acc, showtime) => {
    const movie = showtime.movie;
    if (!movie) return acc;
    
    const movieId = movie.id;
    
    // Chỉ xử lý nếu phim có trong danh sách "Đang chiếu"
    if (!nowShowingIds.has(movieId)) {
      console.log(`Bỏ qua phim "${movie.title}" vì không có trong danh sách đang chiếu`);
      return acc;
    }
    
    // Lấy dữ liệu đã xử lý từ allMoviesData
    const enhancedMovie = allMoviesData[movieId] || movie;
    
    if (!acc[movieId]) {
      acc[movieId] = {
        movie: enhancedMovie,
        showtimes: []
      };
    }
    acc[movieId].showtimes.push(showtime);
    return acc;
  }, {});
  
  return Object.values(grouped);
}, [selectedDate, filterShowtimesByDate, nowShowing, allMoviesData]);
  
  // Debug: Log movie data to console
  useEffect(() => {
    console.log('Movie Showtimes:', movieShowtimes);
    movieShowtimes.forEach(({ movie }) => {
      console.log(`Movie: ${movie.title}, Poster: ${movie.poster}`);
    });
  }, [movieShowtimes]);
  // Thêm vào MovieSchedulePage.jsx để debug chi tiết

useEffect(() => {
  console.log('=== DEBUG SHOWTIME DATA ===');
  console.log('Selected Date:', selectedDate);
  console.log('All Showtimes:', showtimes);
  
  const today = new Date().toISOString().split('T')[0];
  console.log('Today:', today);
  
  // Kiểm tra từng showtime
  showtimes.forEach((showtime, index) => {
    console.log(`Showtime ${index}:`, {
      id: showtime.id,
      movie: showtime.movie?.title,
      start_time: showtime.start_time,
      show_date: showtime.show_date,
      formatted_date: showtime.start_time ? new Date(showtime.start_time).toISOString().split('T')[0] : 'N/A'
    });
  });
  
  // Kiểm tra kết quả filter
  const filtered = filterShowtimesByDate(selectedDate);
  console.log('Filtered Showtimes:', filtered);
  console.log('Filtered Count:', filtered.length);
  
}, [showtimes, selectedDate, filterShowtimesByDate]);
  // Handle loading state
  if (showtimesLoading || moviesLoading) {
    return <LoadingSpinner message="Đang tải lịch chiếu..." />;
  }

  // Handle error state
  if (showtimesError || moviesError) {
    return (
      <ErrorMessage 
        error={showtimesError || moviesError} 
        onRetry={loadShowtimes}
      />
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Date Tabs */}
      <DateTabs 
        selectedDate={selectedDate} 
        onDateChange={setSelectedDate} 
      />

      <div className="h-1 bg-amber-400 rounded mb-6"></div>

      <div className="space-y-4">
        {movieShowtimes.length === 0 ? (
          <EmptyState />
        ) : (
          movieShowtimes.map(({ movie, showtimes }) => {
            const reviewsForMovie = reviews.filter((r) => r.movie_id === movie.id);
            return (
              <ShowtimeCard 
                key={movie.id} 
                movie={movie} 
                showtimes={showtimes}
                selectedDate={selectedDate}
                reviews={reviewsForMovie}
              />
            );
          })
        )}
      </div>
    </div>
  );
}