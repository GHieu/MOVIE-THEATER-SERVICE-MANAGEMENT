
import api from "./api";

// Lấy danh sách review của customer hiện tại
export const getReviews = async () => {
    const res = await api.get(`/reviews`);
    return res.data;
};

// Thêm review mới
export const addReview = async (reviewData) => {
    const res = await api.post('/reviews', reviewData);
    return res.data;
};