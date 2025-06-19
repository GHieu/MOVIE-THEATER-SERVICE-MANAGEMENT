// services/apiServices.js
import api from "./api";

// Lấy danh sách dịch vụ/combo
export const fetchServices = async () => {
    try {
        const response = await api.get('/services');
        return response.data;
    } catch (error) {
        console.error('Error fetching services:', error);
        throw error;
    }
};

// Tạo đơn hàng dịch vụ
export const createServiceOrder = async (orderData) => {
    try {
        // orderData format:
        // {
        //   services: [{ service_id: 1, quantity: 2 }]
        // }
        const response = await api.post('/service-orders', orderData);
        return response.data;
    } catch (error) {
        console.error('Error creating service order:', error);
        throw error;
    }
};