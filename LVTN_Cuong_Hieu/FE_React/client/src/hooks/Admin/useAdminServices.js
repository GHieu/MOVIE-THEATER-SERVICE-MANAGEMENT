import { useEffect, useState, useMemo } from 'react';
import {
  getAllServices,
  createService,
  updateService,
  deleteService,
} from '../../services/ADMINS/apiAdminServices';

const defaultForm = {
  name: '',
  description: '',
  price: '',
  image: '',
  status: 0,
};

export default function useAdminServices() {
  const [services, setServices] = useState([]);
  const [formData, setFormData] = useState(defaultForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const BASE_URL = 'http://127.0.0.1:8000/storage/';
  const servicesPerPage = 5;

  const totalPages = Math.ceil(services.length / servicesPerPage);
  const currentServices = useMemo(() => {
    return services.slice(
      (currentPage - 1) * servicesPerPage,
      currentPage * servicesPerPage
    );
  }, [services, currentPage]);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const loadServices = async () => {
    try {
      setLoading(true);
      const data = await getAllServices();
      const formatted = data.map(service => ({
        ...service,
        image: service.image ? `${BASE_URL}${service.image}` : null,
        status: Number(service.status) === 1 ? 1 : 0,
      }));
      setServices(formatted);
    } catch (error) {
      console.error('Load services error:', error);
      setError('Không thể tải dịch vụ');
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    const inputValue =
      type === 'checkbox' ? (checked ? 1 : 0)
      : type === 'file' ? files[0]
      : value;

    setFormData((prev) => ({
      ...prev,
      [name]: inputValue,
    }));
  };

  const createFormData = (data) => {
    const form = new FormData();
    form.append('name', data.name || '');
    form.append('description', data.description || '');
    form.append('price', data.price || 0);
    form.append('status', data.status === 1 ? 1 : 0);
    if (data.image instanceof File) {
      form.append('image', data.image);
    }
    return form;
  };

  const handleAddService = async () => {
    try {
      const form = createFormData(formData);
      const added = await createService(form);
      setServices(prev => [
        ...prev,
        {
          ...added,
          image: added.image ? `${BASE_URL}${added.image}` : null,
          status: Number(added.status) === 1 ? 1 : 0,
        }
      ]);
      resetForm();
    } catch (error) {
      console.error('Create service error:', error);
      setError('Không thể thêm dịch vụ');
    }
  };

  const handleUpdateService = async () => {
    try {
      const form = createFormData(formData);
      const updated = await updateService(editingId, form);
      setServices(prev =>
        prev.map(s =>
          s.id === updated.id
            ? {
                ...updated,
                image: updated.image ? `${BASE_URL}${updated.image}` : null,
                status: Number(updated.status) === 1 ? 1 : 0,
              }
            : s
        )
      );
      resetForm();
    } catch (error) {
      console.error('Update service error:', error);
      setError('Không thể cập nhật dịch vụ');
    }
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa dịch vụ này?')) return;
    try {
      await deleteService(id);
      setServices(prev => prev.filter(s => s.id !== id));
    } catch (error) {
      console.error('Delete service error:', error);
      setError('Không thể xóa dịch vụ');
    }
  };

  const handleEditService = (service) => {
  setFormData({
    ...service,
    image: service.image || '', // giữ nguyên link ảnh để hiển thị
    status: Number(service.status) === 1 ? 1 : 0,
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
