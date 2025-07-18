import { useState, useEffect, useCallback } from 'react';
import { fetchServices } from '../services/apiServicesMovie';

const useServicesMovie = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ✅ Khởi tạo selectedServices từ sessionStorage nếu có
  const [selectedServices, setSelectedServices] = useState(() => {
    const stored = sessionStorage.getItem("bookingData");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return parsed.services || {};
      } catch (err) {
        return {};
      }
    }
    return {};
  });

  const BASE_URL = 'http://127.0.0.1:8000/storage/'; // Base URL cho ảnh

  useEffect(() => {
    const loadServices = async () => {
      try {
        setLoading(true);
        const response = await fetchServices();
        if (!Array.isArray(response)) {
          throw new Error('Dữ liệu dịch vụ không phải mảng.');
        }

        const servicesWithUrls = response.map(service => ({
          ...service,
          image: service.image
            ? `${BASE_URL}${service.image}`
            : 'https://via.placeholder.com/120x120?text=Service',
          price: parseFloat(service.price)
        }));

        setServices(servicesWithUrls);
      } catch (err) {
        console.error('Lỗi khi tải dịch vụ:', err.message || err);
        setError('Không thể tải danh sách dịch vụ.');
        setServices([]);
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, []);

  // ✅ Cập nhật lại sessionStorage khi selectedServices thay đổi
  useEffect(() => {
    const stored = sessionStorage.getItem("bookingData");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        parsed.services = selectedServices;
        sessionStorage.setItem("bookingData", JSON.stringify(parsed));
      } catch (err) {
        console.error("Lỗi khi cập nhật selectedServices vào sessionStorage:", err);
      }
    }
  }, [selectedServices]);

  // Xử lý thay đổi số lượng dịch vụ
  const handleServiceChange = useCallback((serviceId, delta, isExpired = false) => {
    if (isExpired) return;

    setSelectedServices((prev) => {
      const newCount = (prev[serviceId] || 0) + delta;
      if (newCount <= 0) {
        const { [serviceId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [serviceId]: newCount };
    });
  }, []);

  // Tính tổng tiền services
  const calculateServiceTotal = useCallback(() => {
    return Object.entries(selectedServices).reduce((sum, [serviceId, count]) => {
      const service = services.find((s) => s.id === parseInt(serviceId));
      return sum + (service ? service.price * count : 0);
    }, 0);
  }, [selectedServices, services]);

  // Reset
  const resetSelectedServices = useCallback(() => {
    setSelectedServices({});
  }, []);

  return {
    services,
    loading,
    error,
    selectedServices,
    handleServiceChange,
    calculateServiceTotal,
    resetSelectedServices
  };
};

export default useServicesMovie;
