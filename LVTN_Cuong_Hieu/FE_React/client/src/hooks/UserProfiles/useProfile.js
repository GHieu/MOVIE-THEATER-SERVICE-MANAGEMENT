import { useState, useEffect } from 'react';
import { profileService } from '../../services/apiProfiles';

export const useProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await profileService.getProfile();
      setProfile(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const updateProfile = async (newData) => {
    try {
      setLoading(true);
      setError(null);
      const result = await profileService.updateProfile(newData);
      setProfile(result.customer);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (passwordData) => {
    try {
      setLoading(true);
      setError(null);
      const result = await profileService.changePassword(passwordData);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { 
    profile, 
    loading, 
    error, 
    updateProfile, 
    changePassword,
    refetch: fetchProfile 
  };
};