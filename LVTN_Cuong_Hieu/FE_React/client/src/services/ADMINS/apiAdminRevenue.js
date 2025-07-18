import apiAdmin from "./apiAdmin";

// Lấy doanh thu theo ngày
export const fetchDailyRevenue = async (date = null) => {
    const params = {};
    if (date) {
        params.date = date; // Format: YYYY-MM-DD
    }
    const res = await apiAdmin.get('/revenues/daily', { params });
    return res.data;
};

// Lấy doanh thu theo tháng
export const fetchMonthlyRevenue = async (month = null) => {
    const params = {};
    if (month) {
        params.month = month; // Format: YYYY-MM
    }
    const res = await apiAdmin.get('/revenues/monthly', { params });
    return res.data;
};

// Lấy doanh thu theo năm
export const fetchYearlyRevenue = async (year = null) => {
    const params = {};
    if (year) {
        params.year = year; // Format: YYYY
    }
    const res = await apiAdmin.get('/revenues/yearly', { params });
    return res.data;
};

// Lấy doanh thu theo khoảng thời gian
export const fetchRangeRevenue = async (startDate, endDate) => {
    const params = {
        start_date: startDate, // Format: YYYY-MM-DD
        end_date: endDate      // Format: YYYY-MM-DD
    };
    const res = await apiAdmin.get('/revenues/range', { params });
    return res.data;
};

// Lấy tổng quan doanh thu
export const fetchRevenueOverview = async () => {
    const res = await apiAdmin.get('/revenues/overview');
    return res.data;
};

// Lấy chi tiết dịch vụ theo ngày
export const fetchServiceDetails = async (date = null) => {
    const params = {};
    if (date) {
        params.date = date; // Format: YYYY-MM-DD
    }
    const res = await apiAdmin.get('/revenues/service-details', { params });
    return res.data;
};