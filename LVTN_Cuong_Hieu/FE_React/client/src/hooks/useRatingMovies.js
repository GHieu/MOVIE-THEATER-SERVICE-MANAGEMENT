import { useState } from "react";
import { getReviews, addReview } from "../services/apiRating";

const useRatingMovies = () => {
    const [reviews, setReviews] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);


    // Lấy danh sách reviews
    const fetchReviews = async (page = 1) => {
        try {
            setIsLoading(true);
            setError(null);
            
            const data = await getReviews();
            setReviews(data); // data là mảng review
            

            
            return data;
        } catch (err) {
            setError(err.response?.data?.message || 'Có lỗi khi tải danh sách đánh giá');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    // Thêm review mới
    const addNewReview = async (reviewData) => {
        try {
            setIsLoading(true);
            setError(null);
            setSuccess(false);
            
            const res = await addReview(reviewData);
            setSuccess(true);
            
            // Refresh danh sách reviews sau khi thêm thành công
            await fetchReviews();
            
            return res;
        } catch (err) {
            if (err.response?.status === 422) {
                // Validation errors
                const errors = err.response.data.errors;
                const errorMessage = Object.values(errors).flat().join(', ');
                setError(errorMessage);
            } else {
                setError(err.response?.data?.message || 'Có lỗi khi thêm đánh giá');
            }
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const resetState = () => {
        setError(null);
        setSuccess(false);
        setIsLoading(false);
    };

    return {
        reviews,
       
        isLoading,
        error,
        success,
        fetchReviews,
        addNewReview,
        resetState
    };
};

export default useRatingMovies;