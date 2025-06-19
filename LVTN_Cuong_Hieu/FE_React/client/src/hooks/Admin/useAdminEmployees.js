import { useState, useEffect, useMemo } from 'react';
import {
  fetchEmployees,
  addEmployee,
  updateEmployee
} from '../../services/ADMINS/apiAdminEmployee';

const defaultEmployee = {
  name: '',
  phone: '',
  position: '',
  description: '',
  image: ''
};

const BASE_URL = 'http://127.0.0.1:8000/storage/';

const useAdminEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [newEmployee, setNewEmployee] = useState(defaultEmployee);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Server-side pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [perPage, setPerPage] = useState(10);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Tạo FormData từ employee object
  const createFormData = (employee) => {
    const formData = new FormData();
    formData.append('name', employee.name || '');
    formData.append('phone', employee.phone || '');
    formData.append('position', employee.position || '');
    formData.append('description', employee.description || '');

    if (employee.image instanceof File) {
      formData.append('image', employee.image);
    }

    return formData;
  };

  // Lấy danh sách nhân viên với phân trang server-side
  const loadEmployees = async (page = currentPage, search = searchQuery) => {
    setLoading(true);
    try {
      // Tạo params cho API
      const params = new URLSearchParams();
      params.append('page', page);
      if (search.trim()) {
        params.append('search', search.trim());
      }

      const response = await fetchEmployees(params.toString());
      
      // Kiểm tra cấu trúc response từ API
      const { data, current_page, last_page, total, per_page } = response;
      
      const list = Array.isArray(data) ? data : [];
      const formatted = list.map(emp => ({
        ...emp,
        image: emp.image ? `${BASE_URL}${emp.image}` : null
      }));

      setEmployees(formatted);
      setCurrentPage(current_page);
      setTotalPages(last_page);
      setTotalEmployees(total);
      setPerPage(per_page);

    } catch (err) {
      console.error(err);
      setError('Không thể tải danh sách nhân viên.');
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  // Thêm nhân viên
  const handleAddEmployee = async () => {
    try {
      const formData = createFormData(newEmployee);
      const added = await addEmployee(formData);

      // Reload lại trang hiện tại để cập nhật danh sách
      await loadEmployees(currentPage, searchQuery);
      setNewEmployee(defaultEmployee);
      
    } catch (err) {
      console.error(err);
      setError('Thêm nhân viên thất bại.');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Cập nhật nhân viên
  const handleUpdateEmployee = async () => {
    if (!editingEmployee?.id) return;
    try {
      const formData = createFormData(editingEmployee);
      await updateEmployee(editingEmployee.id, formData);

      // Reload lại trang hiện tại để cập nhật danh sách
      await loadEmployees(currentPage, searchQuery);
      setEditingEmployee(null);
      
    } catch (err) {
      console.error(err);
      setError('Cập nhật nhân viên thất bại.');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Xử lý thay đổi input
  const handleInputChange = (e) => {
    const { name, value, files, type } = e.target;
    const updateValue = type === 'file' ? files[0] : value;

    if (editingEmployee) {
      setEditingEmployee(prev => ({ ...prev, [name]: updateValue }));
    } else {
      setNewEmployee(prev => ({ ...prev, [name]: updateValue }));
    }
  };

  // Xử lý tìm kiếm
  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset về trang đầu khi tìm kiếm
  };

  // Load employees khi component mount
  useEffect(() => {
    loadEmployees(1, '');
  }, []);

  // Load employees khi thay đổi trang hoặc tìm kiếm
  useEffect(() => {
    loadEmployees(currentPage, searchQuery);
  }, [currentPage, searchQuery]);

  return {
    employees,
    newEmployee,
    editingEmployee,
    loading,
    error,

    // Pagination info
    currentPage,
    totalPages,
    totalEmployees,
    perPage,
    goToPage,

    // Search
    searchQuery,
    setSearchQuery: handleSearch,

    setNewEmployee,
    setEditingEmployee,
    handleAddEmployee,
    handleUpdateEmployee,
    handleInputChange,
    loadEmployees
  };
};

export default useAdminEmployees;