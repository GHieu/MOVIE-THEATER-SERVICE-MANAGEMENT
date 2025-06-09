import { useState, useEffect } from 'react';
import { getUser } from '../services/authService';

export const useAuth = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    getUser().then(setUser).catch(() => setUser(null));
  }, []);

  return user;
};
