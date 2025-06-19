import { useEffect, useState, useMemo } from 'react';
import { fetchRoom, updateRoom, countRoom } from '../../services/ADMINS/apiAdminRooms';

const useRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [editingRoom, setEditingRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [totalRoomsCount, setTotalRoomsCount] = useState(0);

  const [currentPage, setCurrentPage] = useState(1);
  const roomsPerPage = 5;

  const getStatusLabel = (status) => {
    switch (Number(status)) {
      case 1: return 'Đang hoạt động';
      case 0: return 'Tạm dừng';
      case 2: return 'Đang bảo trì';
      default: return 'Không xác định';
    }
  };

  const loadRooms = async () => {
    try {
      setLoading(true);
      const data = await fetchRoom();
      const mapped = data.map(room => ({
        ...room,
        statusLabel: getStatusLabel(room.status),
      }));
      setRooms(mapped);
      setTotalRoomsCount(mapped.length); // Cập nhật tổng số phòng
    } catch (err) {
      console.error(err);
      setError('Không thể tải danh sách phòng.');
    } finally {
      setLoading(false);
    }
  };

  const filteredRooms = useMemo(() => {
    if (!searchQuery.trim()) return rooms;
    return rooms.filter(room =>
      room.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [rooms, searchQuery]);

  const filteredRoomsCount = filteredRooms.length;
  const totalPages = Math.ceil(filteredRoomsCount / roomsPerPage);

  const indexOfLastRoom = currentPage * roomsPerPage;
  const indexOfFirstRoom = indexOfLastRoom - roomsPerPage;
  const currentRooms = filteredRooms.slice(indexOfFirstRoom, indexOfLastRoom);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (editingRoom) {
      setEditingRoom(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleUpdateRoom = async () => {
    if (!editingRoom?.id) return;
    try {
      const updated = await updateRoom(editingRoom.id, editingRoom);
      const updatedRoom = {
        ...updated.room,
        statusLabel: getStatusLabel(updated.room.status)
      };
      setRooms(prev => prev.map(r => (r.id === updatedRoom.id ? updatedRoom : r)));
      setEditingRoom(null);
    } catch (err) {
      console.error(err);
      setError('Cập nhật phòng thất bại.');
      setTimeout(() => setError(''), 3000);
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  // Reset trang khi searchQuery thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return {
    rooms,
    editingRoom,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    totalRoomsCount,
    filteredRoomsCount,
    setEditingRoom,
    handleInputChange,
    handleUpdateRoom,
    currentRooms,
    currentPage,
    totalPages,
    goToPage,
  };
};

export default useRooms;
