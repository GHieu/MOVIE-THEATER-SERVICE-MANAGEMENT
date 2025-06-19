import { useEffect, useState } from 'react';
import {
  getShowtimes,
  addShowtime,
  updateShowtime,
  deleteShowtime,
  getShowtimeById,
  countShowtimes,
} from '../../services/ADMINS/apiAdminShowtimes';
import { fetchRoom } from '../../services/ADMINS/apiAdminRooms';
import { fetchMovies } from '../../services/ADMINS/apiAdminMovie';

const useShowtimes = () => {
  const [showtimes, setShowtimes] = useState([]);
  const [newShowtime, setNewShowtime] = useState({
    movie_id: '',
    room_id: '',
    promotion_id: '',
    start_time: '',
    end_time: '',
    price: '',  
  });
  const [movieOptions, setMovieOptions] = useState([]);
  const [roomOptions, setRoomOptions] = useState([]);
  const [editingShowtime, setEditingShowtime] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredShowtimeCount, setFilteredShowtimeCount] = useState(0);
  const [totalShowtimeCount, setTotalShowtimeCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  const fetchShowtimes = async (page = currentPage, keyword = searchQuery) => {
    try {
      setLoading(true);
      // Truyền keyword vào API call theo đúng tham số API
      const response = await getShowtimes(page, limit, keyword);

      // Handle Laravel pagination response structure
      setShowtimes(response.data || []);
      setFilteredShowtimeCount(response.total || 0);
    } catch (err) {
      setError('Không thể tải suất chiếu.');
      console.error('Fetch showtimes error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTotalCount = async () => {
    try {
      const res = await countShowtimes();
      setTotalShowtimeCount(res.total_showtimes || 0);
    } catch (err) {
      console.error('Lỗi fetch count:', err);
    }
  };

  // Fetch movies and rooms options
  const fetchOptions = async () => {
    try {
      const [moviesRes, roomsRes] = await Promise.all([
        fetchMovies(),
        fetchRoom()
      ]);
      
      console.log('Movies response:', moviesRes);
      console.log('Rooms response:', roomsRes);
      
      // Handle different response structures
      const movies = Array.isArray(moviesRes) ? moviesRes : 
                    (moviesRes?.data ? moviesRes.data : []);
      const rooms = Array.isArray(roomsRes) ? roomsRes : 
                   (roomsRes?.data ? roomsRes.data : []);
      
      setMovieOptions(movies);
      setRoomOptions(rooms);
    } catch (err) {
      console.error('Lỗi fetch options:', err);
      setMovieOptions([]);
      setRoomOptions([]);
    }
  };

  // Debounce search để tránh gọi API quá nhiều lần
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      // Reset về trang 1 khi tìm kiếm
      if (searchQuery !== '') {
        setCurrentPage(1);
        fetchShowtimes(1, searchQuery);
      } else {
        fetchShowtimes(currentPage, '');
      }
    }, 500); // Delay 500ms

    return () => clearTimeout(delayedSearch);
  }, [searchQuery]);

  // Fetch showtimes when page changes (không có search)
  useEffect(() => {
    if (searchQuery === '') {
      fetchShowtimes();
    }
  }, [currentPage]);

  useEffect(() => {
    fetchTotalCount();
    fetchOptions();
  }, []);

  // Re-fetch options when they're empty (fallback)
  useEffect(() => {
    if (movieOptions.length === 0 || roomOptions.length === 0) {
      fetchOptions();
    }
  }, [movieOptions.length, roomOptions.length]);

  const handleAddShowtime = async () => {
    try {
      setError('');
      await addShowtime(newShowtime);
      // Refresh current view
      await fetchShowtimes();
      await fetchTotalCount();
      resetForm();
    } catch (err) {
      setError('Thêm suất chiếu thất bại.');
      console.error('Add showtime error:', err);
    }
  };

  const handleUpdateShowtime = async () => {
    try {
      setError('');
      await updateShowtime(editingShowtime.id, editingShowtime);
      // Refresh current view
      await fetchShowtimes();
      await fetchTotalCount();
      resetForm();
    } catch (err) {
      setError('Cập nhật suất chiếu thất bại.');
      console.error('Update showtime error:', err);
    }
  };

  const handleDeleteShowtime = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa suất chiếu này?')) {
      return;
    }
    
    try {
      setError('');
      await deleteShowtime(id);
      // Refresh current view
      await fetchShowtimes();
      await fetchTotalCount();
    } catch (err) {
      setError('Xóa suất chiếu thất bại.');
      console.error('Delete showtime error:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (editingShowtime) {
      setEditingShowtime({ ...editingShowtime, [name]: value });
    } else {
      setNewShowtime({ ...newShowtime, [name]: value });
    }
  };

  const resetForm = () => {
    setNewShowtime({
      movie_id: '',
      room_id: '',
      promotion_id: '',
      start_time: '',
      end_time: '',
      price: '',
    });
    setEditingShowtime(null);
  };

  const currentShowtimes = showtimes;
  const totalPages = Math.ceil(filteredShowtimeCount / limit);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Filter showtimes by search query (client-side filtering)
  const filteredShowtimes = currentShowtimes.filter(showtime => {
    if (!searchQuery) return true;
    const movieTitle = showtime.movie?.title || '';
    return movieTitle.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return {
    movieOptions,
    roomOptions,
    newShowtime,
    editingShowtime,
    setNewShowtime,
    setEditingShowtime,
    showtimes: filteredShowtimes, // Return filtered showtimes
    currentShowtimes: filteredShowtimes,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    filteredShowtimeCount: searchQuery ? filteredShowtimes.length : filteredShowtimeCount,
    totalShowtimeCount,
    currentPage,
    totalPages,
    goToPage,
    handleAddShowtime,
    handleUpdateShowtime,
    handleDeleteShowtime,
    handleInputChange,
    resetForm,
  };
};

export default useShowtimes;