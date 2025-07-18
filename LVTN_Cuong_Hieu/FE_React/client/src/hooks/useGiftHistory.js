import { useEffect, useState } from 'react';
import { getGiftHistory } from '../services/apiGift'; // Đảm bảo đúng path

const useGiftHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await getGiftHistory();
      setHistory(data);
    } catch (err) {
      setError(err);
      console.error('Lỗi khi lấy lịch sử quà tặng:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return { history, loading, error, refetch: fetchHistory };
};

export default useGiftHistory;
