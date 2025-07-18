import { useEffect, useState } from 'react';
import {
  getShowtimes,
  getShowtimesWithKeyword,
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
  const [summary, setSummary] = useState({
    total: 0,
    upcoming: 0,
    ongoing: 0,
    finished: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // Filters
  const [filters, setFilters] = useState({
    room_id: '',
    movie_id: '',
    promotion_id: '',
    date: '',
    status: '',
    sort_by: 'start_time',
    sort_dir: 'asc',
  });
  const fetchAllShowtimesNoFilter = async () => {
  try {
    setLoading(true);
    setError('');

    let allShowtimes = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const response = await getShowtimes(
        page,
        100, // số lượng tối đa mỗi trang, tùy theo backend hỗ trợ
        '',  // không keyword
        null, // room_id
        null, // date
        null, // status
        null, // movie_id
        null, // promotion_id
        'start_time',
        'asc'
      );

      const pageData = response?.data?.data || [];

      allShowtimes = allShowtimes.concat(pageData);

      const lastPage = response?.data?.last_page || 1;
      hasMore = page < lastPage;
      page += 1;
    }

    return allShowtimes;
  } catch (err) {
    const errorMessage = err.response?.data?.error || err.message || 'Không thể tải tất cả suất chiếu.';
    setError(errorMessage);
    console.error('fetchAllShowtimesNoFilter error:', err);
    return [];
  } finally {
    setLoading(false);
  }
};

  // Hàm format datetime cho input
  const formatDateTimeForInput = (datetime) => {
    if (!datetime) return '';

    try {
      let dateStr = datetime.toString().trim();
      if (dateStr.includes('+')) {
        dateStr = dateStr.split('+')[0];
      }
      if (dateStr.includes('Z')) {
        dateStr = dateStr.replace('Z', '');
      }
      if (dateStr.includes(' ')) {
        dateStr = dateStr.replace(' ', 'T');
      }
      if (dateStr.includes(':')) {
        const parts = dateStr.split(':');
        if (parts.length > 2) {
          dateStr = `${parts[0]}:${parts[1]}`;
        }
      }
      return dateStr;
    } catch (error) {
      console.error('Error formatting datetime for input:', error);
      return '';
    }
  };

  // Hàm format datetime cho API
  const formatDateTimeForAPI = (datetime) => {
    if (!datetime) return '';

    try {
      const date = new Date(datetime);
      if (isNaN(date.getTime())) {
        console.warn('Invalid datetime for API:', datetime);
        return '';
      }

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = '00';

      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    } catch (error) {
      console.error('Error formatting datetime for API:', error);
      return datetime;
    }
  };

  // Hàm format datetime cho hiển thị
  const formatDisplayTime = (datetime) => {
    if (!datetime) return '';

    try {
      const date = new Date(datetime);
      if (isNaN(date.getTime())) {
        console.warn('Invalid datetime for display:', datetime);
        return '';
      }

      return date.toLocaleString('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      console.error('Error formatting datetime for display:', error);
      return '';
    }
  };

  // Sửa hàm getShowtimeStatus để đồng bộ với summary
  const getShowtimeStatus = (startTime, endTime) => {
    try {
      // Thời gian hiện tại (Asia/Ho_Chi_Minh)
      const now = new Date();
      const nowStr = now.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' });
      const nowDate = new Date(nowStr);

      // Chuẩn hóa startTime và endTime
      const normalizeDateTime = (datetime) => {
        let dateStr = datetime.toString().trim();
        if (dateStr.includes('+')) {
          dateStr = dateStr.split('+')[0];
        }
        if (dateStr.includes('Z')) {
          dateStr = dateStr.replace('Z', '');
        }
        if (dateStr.includes('T')) {
          dateStr = dateStr.replace('T', ' ');
        }
        if (dateStr.split(':').length === 2) {
          dateStr += ':00';
        }
        return new Date(dateStr);
      };

      const startDate = normalizeDateTime(startTime);
      const endDate = normalizeDateTime(endTime);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        console.warn('Invalid datetime for status:', { startTime, endTime });
        return { status: 'Không xác định', color: 'text-gray-600' };
      }

      if (nowDate < startDate) {
        return { status: 'Sắp tới', color: 'text-blue-600' };
      } else if (nowDate >= startDate && nowDate <= endDate) {
        return { status: 'Đang chiếu', color: 'text-green-600' };
      } else {
        return { status: 'Đã kết thúc', color: 'text-gray-600' };
      }
    } catch (error) {
      console.error('Error getting showtime status:', error);
      return { status: 'Không xác định', color: 'text-gray-600' };
    }
  };

  

  const fetchShowtimes = async (page = currentPage, keyword = searchQuery, currentFilters = filters) => {
    try {
      setLoading(true);
      setError('');

      const response = await getShowtimes(
        page,
        perPage,
        keyword,
        currentFilters.room_id || null,
        currentFilters.date || null,
        currentFilters.status || null,
        currentFilters.movie_id || null,
        currentFilters.promotion_id || null,
        currentFilters.sort_by,
        currentFilters.sort_dir
      );

      console.log('API Response:', response);

      if (response && response.data && response.summary) {
        const paginationData = response.data;
        const summaryData = response.summary;

        setShowtimes(paginationData.data || []);
        setCurrentPage(paginationData.current_page || 1);
        setTotalPages(paginationData.last_page || 1);
        setPerPage(paginationData.per_page || 10);
        setFilteredShowtimeCount(paginationData.total || 0);
        setSummary(summaryData);
        setTotalShowtimeCount(summaryData.total || 0);
      } else if (response && response.data) {
        const paginationData = response.data;

        setShowtimes(paginationData.data || []);
        setCurrentPage(paginationData.current_page || 1);
        setTotalPages(paginationData.last_page || 1);
        setPerPage(paginationData.per_page || 10);
        setFilteredShowtimeCount(paginationData.total || 0);
        setTotalShowtimeCount(paginationData.total || 0);
        setSummary({
          total: paginationData.total || 0,
          upcoming: 0,
          ongoing: 0,
          finished: 0,
        });
      } else {
        setShowtimes(Array.isArray(response) ? response : []);
        setFilteredShowtimeCount(Array.isArray(response) ? response.length : 0);
        setTotalShowtimeCount(Array.isArray(response) ? response.length : 0);
        setTotalPages(1);
        setSummary({
          total: Array.isArray(response) ? response.length : 0,
          upcoming: 0,
          ongoing: 0,
          finished: 0,
        });
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Không thể tải suất chiếu.';
      setError(errorMessage);
      console.error('Fetch showtimes error:', err);
      setShowtimes([]);
      setFilteredShowtimeCount(0);
      setTotalShowtimeCount(0);
      setTotalPages(1);
      setSummary({
        total: 0,
        upcoming: 0,
        ongoing: 0,
        finished: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchOptions = async () => {
    try {
      const [moviesRes, roomsRes] = await Promise.all([fetchMovies(), fetchRoom()]);

      console.log('Movies response:', moviesRes);
      console.log('Rooms response:', roomsRes);

      const movies = Array.isArray(moviesRes) ? moviesRes : (moviesRes?.data ? moviesRes.data : []);
      const rooms = Array.isArray(roomsRes) ? roomsRes : (roomsRes?.data ? roomsRes.data : []);

      const activeMovies = movies.filter((movie) => movie.status !== 0);
      const activeRooms = rooms.filter((room) => room.status === 1);

      setMovieOptions(activeMovies);
      setRoomOptions(activeRooms);

      console.log('Filtered active movies:', activeMovies);
      console.log('Filtered active rooms:', activeRooms);
    } catch (err) {
      console.error('Lỗi fetch options:', err);
      setMovieOptions([]);
      setRoomOptions([]);
    }
  };

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchQuery !== '') {
        setCurrentPage(1);
        fetchShowtimes(1, searchQuery, filters);
      } else {
        fetchShowtimes(currentPage, '', filters);
      }
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchQuery]);

  useEffect(() => {
    if (searchQuery === '') {
      fetchShowtimes();
    }
  }, [currentPage]);

  useEffect(() => {
    setCurrentPage(1);
    fetchShowtimes(1, searchQuery, filters);
  }, [filters.room_id, filters.movie_id, filters.promotion_id, filters.date, filters.status, filters.sort_by, filters.sort_dir]);

  useEffect(() => {
    fetchOptions();
  }, []);

  useEffect(() => {
    if (movieOptions.length === 0 || roomOptions.length === 0) {
      fetchOptions();
    }
  }, [movieOptions.length, roomOptions.length]);

  const handleAddShowtime = async () => {
    try {
      setError('');

      // Validate required fields
      if (!newShowtime.movie_id || !newShowtime.room_id || !newShowtime.start_time || !newShowtime.end_time || !newShowtime.price) {
        throw new Error('Vui lòng điền đầy đủ các trường bắt buộc');
      }

      // Validate times
      const startDate = new Date(newShowtime.start_time);
      const endDate = new Date(newShowtime.end_time);

      if (startDate >= endDate) {
        throw new Error('Thời gian kết thúc phải sau thời gian bắt đầu');
      }

      if (startDate < new Date()) {
        throw new Error('Thời gian bắt đầu phải trong tương lai');
      }

      // Chuẩn bị data với thời gian được format đúng
      const showtimeData = {
        ...newShowtime,
        start_time: formatDateTimeForAPI(newShowtime.start_time),
        end_time: formatDateTimeForAPI(newShowtime.end_time),
        price: Number(newShowtime.price),
        movie_id: Number(newShowtime.movie_id),
        room_id: Number(newShowtime.room_id),
        promotion_id: newShowtime.promotion_id ? Number(newShowtime.promotion_id) : null,
      };

      console.log('Sending showtime data:', showtimeData);

      const response = await addShowtime(showtimeData);

      // Refresh current view
      await fetchShowtimes();
      resetForm();

      // Show success message
      if (response.message) {
        alert(response.message);
      } else {
        alert('Thêm suất chiếu thành công!');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Thêm suất chiếu thất bại.';
      setError(errorMessage);
      console.error('Add showtime error:', err);
      throw err;
    }
  };

  const handleUpdateShowtime = async () => {
    try {
      setError('');

      // Validate required fields
      if (!editingShowtime.movie_id || !editingShowtime.room_id || !editingShowtime.start_time || !editingShowtime.end_time || !editingShowtime.price) {
        throw new Error('Vui lòng điền đầy đủ các trường bắt buộc');
      }

      // Validate times
      const startDate = new Date(editingShowtime.start_time);
      const endDate = new Date(editingShowtime.end_time);

      if (startDate >= endDate) {
        throw new Error('Thời gian kết thúc phải sau thời gian bắt đầu');
      }

      // Chuẩn bị data với thời gian được format đúng
      const showtimeData = {
        ...editingShowtime,
        start_time: formatDateTimeForAPI(editingShowtime.start_time),
        end_time: formatDateTimeForAPI(editingShowtime.end_time),
        price: Number(editingShowtime.price),
        movie_id: Number(editingShowtime.movie_id),
        room_id: Number(editingShowtime.room_id),
        promotion_id: editingShowtime.promotion_id ? Number(editingShowtime.promotion_id) : null,
      };

      console.log('Updating showtime data:', showtimeData);

      const response = await updateShowtime(editingShowtime.id, showtimeData);

      // Refresh current view
      await fetchShowtimes();
      resetForm();

      // Show success message
      if (response.message) {
        alert(response.message);
      } else {
        alert('Cập nhật suất chiếu thành công!');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Cập nhật suất chiếu thất bại.';
      setError(errorMessage);
      console.error('Update showtime error:', err);
      throw err;
    }
  };

  const handleDeleteShowtime = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa suất chiếu này?')) {
      return;
    }

    try {
      setError('');
      const response = await deleteShowtime(id);

      // Refresh current view
      await fetchShowtimes();

      // Show success message
      if (response.message) {
        alert(response.message);
      } else {
        alert('Xóa suất chiếu thành công!');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Xóa suất chiếu thất bại.';
      setError(errorMessage);
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

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
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

  const resetFilters = () => {
    setFilters({
      room_id: '',
      movie_id: '',
      promotion_id: '',
      date: '',
      status: '',
      sort_by: 'start_time',
      sort_dir: 'asc',
    });
    setSearchQuery('');
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  

  const getStatusLabel = (status) => {
    switch (status.status) {
      case 'Sắp tới':
        return 'Sắp chiếu';
      case 'Đang chiếu':
        return 'Đang chiếu';
      case 'Đã kết thúc':
        return 'Đã kết thúc';
      default:
        return 'Không xác định';
    }
  };

  return {
    movieOptions,
    roomOptions,
    newShowtime,
    editingShowtime,
    setNewShowtime,
    setEditingShowtime,
    showtimes,
    currentShowtimes: showtimes,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    filteredShowtimeCount,
    totalShowtimeCount,
    summary,
    currentPage,
    totalPages,
    perPage,
    filters,
    goToPage,
    handleAddShowtime,
    handleUpdateShowtime,
    handleDeleteShowtime,
    handleInputChange,
    handleFilterChange,
    resetForm,
    resetFilters,
    formatDateTimeForInput,
    formatDisplayTime,
    getShowtimeStatus,
    getStatusLabel,
    fetchAllShowtimesNoFilter,
  };
};

export default useShowtimes;