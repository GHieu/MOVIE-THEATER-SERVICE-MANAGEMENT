import apiAdmin from "./apiAdmin";

// Lấy danh sách khách hàng với các filter
export const fetchCustomers = async (page = 1, filters = {}) => {
    const params = {
        page,
        ...filters // member_type, name, email, phone, sort_by, sort_order
    };
    const res = await apiAdmin.get('/customers', { params });
    return res.data;
};

// Lấy chi tiết khách hàng
export const fetchCustomerDetail = async (id) => {
    const res = await apiAdmin.get(`/customers/${id}`);
    return res.data;
};

// Cập nhật thông tin khách hàng
export const updateCustomer = async (id, data) => {
    const res = await apiAdmin.post(`/customers/${id}`, data);
    return res.data;
};

// Xóa khách hàng
export const deleteCustomer = async (id) => {
    const res = await apiAdmin.delete(`/customers/${id}`);
    return res.data;
};

// Lấy lịch sử đặt vé của khách hàng
export const fetchCustomerTicketHistory = async (id, page = 1, filters = {}) => {
    const params = {
        page,
        ...filters // status, from_date, to_date, movie_id
    };
    const res = await apiAdmin.get(`/customers/${id}/tickets`, { params });
    return res.data;
};

// Lấy lịch sử đánh giá của khách hàng
export const fetchCustomerReviewHistory = async (id, page = 1, filters = {}) => {
    const params = {
        page,
        ...filters // rating, movie_id, from_date, to_date
    };
    const res = await apiAdmin.get(`/customers/${id}/reviews`, { params });
    return res.data;
};

// Cập nhật điểm thành viên thủ công (Admin)
export const updateCustomerPoints = async (id, data) => {
    const res = await apiAdmin.post(`/customers/${id}/update-points`, data);
    return res.data;
};

// Lấy thống kê tổng quan khách hàng
export const fetchCustomerStatistics = async () => {
    const res = await apiAdmin.get('/customers/statistics');
    return res.data;
};

// Các helper function để gọi API với filter cụ thể
export const searchCustomers = async (page = 1, searchTerm = '', searchType = 'name') => {
    const filters = {};
    if (searchTerm) {
        filters[searchType] = searchTerm; // searchType: 'name', 'email', 'phone'
    }
    return fetchCustomers(page, filters);
};

export const getCustomersByMemberType = async (page = 1, memberType = '') => {
    const filters = memberType ? { member_type: memberType } : {};
    return fetchCustomers(page, filters);
};

export const getCustomersSorted = async (page = 1, sortBy = 'created_at', sortOrder = 'desc') => {
    const filters = { sort_by: sortBy, sort_order: sortOrder };
    return fetchCustomers(page, filters);
};