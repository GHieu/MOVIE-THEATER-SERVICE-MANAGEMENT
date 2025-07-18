import apiAdmin from "./apiAdmin";

export const fetchReviews = async(page=1) => {
    const params = {
    page
  };
    const res = await apiAdmin.get('/reviews', {params});
    return res.data;
}