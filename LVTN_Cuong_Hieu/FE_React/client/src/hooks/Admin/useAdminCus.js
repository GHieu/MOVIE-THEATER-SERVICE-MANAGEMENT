import { useState, useCallback } from 'react';
import {
  fetchCustomers,
  fetchCustomerDetail,
  updateCustomer,
  deleteCustomer,
  fetchCustomerTicketHistory,
  fetchCustomerReviewHistory,
  updateCustomerPoints,
  fetchCustomerStatistics,
  searchCustomers,
  getCustomersByMemberType,
  getCustomersSorted,
} from '../../services/ADMINS/apiAdminCus';

export const useAdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [customerDetail, setCustomerDetail] = useState(null);
  const [ticketHistory, setTicketHistory] = useState([]);
  const [reviewHistory, setReviewHistory] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    perPage: 10,
  });

  const getCustomers = useCallback(async (page = 1, filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchCustomers(page, filters);
      if (response.customers && response.customers.data) {
        const formattedCustomers = response.customers.data.map(customer => ({
          ...customer,
          member_type: customer.membership && customer.membership.member_type ? customer.membership.member_type : 'Không có',
          points: customer.membership ? customer.membership.point : 0,
        }));
        setCustomers(formattedCustomers);
        setPagination({
          currentPage: response.customers.current_page || 1,
          totalPages: response.customers.last_page || 1,
          totalItems: response.customers.total || 0,
          perPage: response.customers.per_page || 10,
        });
        if (response.filters) {
          setFilters(response.filters);
        }
      } else {
        setCustomers([]);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi lấy danh sách khách hàng');
    } finally {
      setLoading(false);
    }
  }, []);

  const getCustomerDetail = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchCustomerDetail(id);
      setCustomerDetail({
        ...response.customer,
        member_type: response.customer.membership && response.customer.membership.member_type ? response.customer.membership.member_type : 'Không có',
        points: response.customer.membership ? response.customer.membership.point : 0,
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi lấy chi tiết khách hàng');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCustomerInfo = useCallback(async (id, data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await updateCustomer(id, data);
      const updatedCustomer = {
        ...response.customer,
        member_type: response.customer.membership && response.customer.membership.member_type ? response.customer.membership.member_type : 'Không có',
        points: response.customer.membership ? response.customer.membership.point : 0,
      };
      setCustomers(prev =>
        prev.map(customer =>
          customer.id === id ? updatedCustomer : customer
        )
      );
      if (customerDetail && customerDetail.id === id) {
        setCustomerDetail(updatedCustomer);
      }
      return response;
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật thông tin khách hàng');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [customers, customerDetail]);

  const removeCustomer = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await deleteCustomer(id);
      setCustomers(prev => prev.filter(customer => customer.id !== id));
      if (customerDetail && customerDetail.id === id) {
        setCustomerDetail(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi xóa khách hàng');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [customerDetail]);

  const getCustomerTicketHistory = useCallback(async (id, page = 1, filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchCustomerTicketHistory(id, page, filters);
      console.log('Ticket History Response:', response);
      setTicketHistory(response.tickets?.data || []);
    } catch (err) {
        console.error('Ticket History Error:', err.response?.data);
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi lấy lịch sử đặt vé');
    } finally {
      setLoading(false);
    }
  }, []);

  const getCustomerReviewHistory = useCallback(async (id, page = 1, filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchCustomerReviewHistory(id, page, filters);
      setReviewHistory(response.reviews?.data || []);
      console.log('Review History Response:', response);
    } catch (err) {
        console.error('Review History Error:', err.response?.data);
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi lấy lịch sử đánh giá');
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePoints = useCallback(async (id, data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await updateCustomerPoints(id, {
        point: data.points,
        total_points: data.points + (customerDetail?.membership?.total_points || 0),
        reason: 'Cập nhật thủ công bởi admin'
      });
      const updatedCustomer = {
        ...customerDetail,
        membership: response.membership,
        member_type: response.membership && response.membership.member_type ? response.membership.member_type : 'Không có',
        points: response.membership ? response.membership.point : 0,
      };
      setCustomers(prev =>
        prev.map(customer =>
          customer.id === id ? updatedCustomer : customer
        )
      );
      if (customerDetail && customerDetail.id === id) {
        setCustomerDetail(updatedCustomer);
      }
      return response;
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật điểm thành viên');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [customers, customerDetail]);

  const getStatistics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchCustomerStatistics();
      const customers = response.top_customers_by_spending || [];
      const totalPoints = customers.reduce((sum, customer) => {
        return sum + (customer.membership ? customer.membership.point : 0);
      }, 0);
      const averagePoints = customers.length > 0 ? totalPoints / customers.length : 0;
      setStatistics({
        ...response,
        average_points: averagePoints.toFixed(2),
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi lấy thống kê');
    } finally {
      setLoading(false);
    }
  }, []);

  const searchCustomerList = useCallback(async (page = 1, searchTerm = '', searchType = 'name') => {
    setLoading(true);
    setError(null);
    try {
      const response = await searchCustomers(page, searchTerm, searchType);
      if (response.customers && response.customers.data) {
        const formattedCustomers = response.customers.data.map(customer => ({
          ...customer,
          member_type: customer.membership && customer.membership.member_type ? customer.membership.member_type : 'Không có',
          points: customer.membership ? customer.membership.point : 0,
        }));
        setCustomers(formattedCustomers);
        setPagination({
          currentPage: response.customers.current_page || 1,
          totalPages: response.customers.last_page || 1,
          totalItems: response.customers.total || 0,
          perPage: response.customers.per_page || 10,
        });
      } else {
        setCustomers([]);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi tìm kiếm khách hàng');
    } finally {
      setLoading(false);
    }
  }, []);

  const getCustomersByType = useCallback(async (page = 1, memberType = '') => {
    setLoading(true);
    setError(null);
    try {
      const response = await getCustomersByMemberType(page, memberType);
      if (response.customers && response.customers.data) {
        const formattedCustomers = response.customers.data.map(customer => ({
          ...customer,
          member_type: customer.membership && customer.membership.member_type ? customer.membership.member_type : 'Không có',
          points: customer.membership ? customer.membership.point : 0,
        }));
        setCustomers(formattedCustomers);
        setPagination({
          currentPage: response.customers.current_page || 1,
          totalPages: response.customers.last_page || 1,
          totalItems: response.customers.total || 0,
          perPage: response.customers.per_page || 10,
        });
      } else {
        setCustomers([]);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi lấy khách hàng theo loại thành viên');
    } finally {
      setLoading(false);
    }
  }, []);

  const sortCustomers = useCallback(async (page = 1, sortBy = 'created_at', sortOrder = 'desc') => {
    setLoading(true);
    setError(null);
    try {
      const response = await getCustomersSorted(page, sortBy, sortOrder);
      if (response.customers && response.customers.data) {
        const formattedCustomers = response.customers.data.map(customer => ({
          ...customer,
          member_type: customer.membership && customer.membership.member_type ? customer.membership.member_type : 'Không có',
          points: customer.membership ? customer.membership.point : 0,
        }));
        setCustomers(formattedCustomers);
        setPagination({
          currentPage: response.customers.current_page || 1,
          totalPages: response.customers.last_page || 1,
          totalItems: response.customers.total || 0,
          perPage: response.customers.per_page || 10,
        });
      } else {
        setCustomers([]);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi sắp xếp khách hàng');
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearCustomerDetail = useCallback(() => {
    setCustomerDetail(null);
  }, []);

  const resetData = useCallback(() => {
    setCustomers([]);
    setCustomerDetail(null);
    setTicketHistory([]);
    setReviewHistory([]);
    setStatistics(null);
    setFilters(null);
    setError(null);
    setPagination({
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      perPage: 10,
    });
  }, []);

  return {
    customers,
    customerDetail,
    ticketHistory,
    reviewHistory,
    statistics,
    filters,
    loading,
    error,
    pagination,
    getCustomers,
    getCustomerDetail,
    updateCustomerInfo,
    removeCustomer,
    getCustomerTicketHistory,
    getCustomerReviewHistory,
    updatePoints,
    getStatistics,
    searchCustomerList,
    getCustomersByType,
    sortCustomers,
    clearError,
    clearCustomerDetail,
    resetData,
  };
};

export default useAdminCustomers;