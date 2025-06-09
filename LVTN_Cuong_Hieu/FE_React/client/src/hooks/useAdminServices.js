import { useEffect, useState } from 'react';
import {
  getAllServices,
  createService,
  updateService,
  deleteService,
} from '../services/ADMINS/apiAdminServices';

const defaultForm = {
  name: '',
  description: '',
  price: '',
  image: '', // URL chuỗi
  status: false,
};

export default function useAdminServices() {
  const [services, setServices] = useState([]);
  const [formData, setFormData] = useState(defaultForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const servicesPerPage = 5;

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      const data = await getAllServices();
      setServices(data);
    } catch (error) {
      console.error('Load services error:', error);
      setError('Không thể tải dịch vụ');
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const currentServices = services.slice(
    (currentPage - 1) * servicesPerPage,
    currentPage * servicesPerPage
  );
  const totalPages = Math.ceil(services.length / servicesPerPage);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAddService = async () => {
    try {
      await createService(formData);
      resetForm();
      await loadServices();
    } catch (error) {
      console.error('Create service error:', error);
      setError('Không thể thêm dịch vụ');
    }
  };

  const handleUpdateService = async () => {
    try {
      await updateService(editingId, formData);
      resetForm();
      await loadServices();
    } catch (error) {
      console.error('Update service error:', error);
      setError('Không thể cập nhật dịch vụ');
    }
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa dịch vụ này?')) return;
    try {
      await deleteService(id);
      await loadServices();
    } catch (error) {
      console.error('Delete service error:', error);
      setError('Không thể xóa dịch vụ');
    }
  };

  const handleEditService = (service) => {
    setFormData({
      ...service,
      status: !!service.status,
    });
    setEditingId(service.id);
  };

  const resetForm = () => {
    setFormData(defaultForm);
    setEditingId(null);
  };

  return {
    services,
    currentServices,
    currentPage,
    totalPages,
    goToPage,
    formData,
    editingId,
    loading,
    error,
    handleInputChange,
    handleAddService,
    handleUpdateService,
    handleDeleteService,
    handleEditService,
    setFormData,
    setEditingId,
    resetForm,
  };
}
