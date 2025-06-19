import { useState, useEffect } from 'react';
import { getMembership, addMemberships, updateMembership } from '../../services/ADMINS/apiAdminMemberships';

export const useAdminMembership = () => {
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all memberships
  const fetchMemberships = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMembership();
      setMemberships(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch memberships');
    } finally {
      setLoading(false);
    }
  };

  // Add new membership
  const addMembership = async (membershipData) => {
    try {
      setLoading(true);
      setError(null);
      const newMembership = await addMemberships(membershipData);
      // Fetch lại data để có relationship
      await fetchMemberships();
      return { success: true, data: newMembership };
    } catch (err) {
      const errorMsg = err.response?.data?.errors || err.response?.data?.message || 'Failed to add membership';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Update membership
  const updateMembershipData = async (id, membershipData) => {
    try {
      setLoading(true);
      setError(null);
      console.log('Updating membership:', { id, membershipData }); // Debug log
      const updatedMembership = await updateMembership(id, membershipData);
      console.log('Update response:', updatedMembership); // Debug log
      // Fetch lại data để có relationship
      await fetchMemberships();
      return { success: true, data: updatedMembership };
    } catch (err) {
      console.error('Update error:', err); // Debug log
      const errorMsg = err.response?.data?.errors || err.response?.data?.message || 'Failed to update membership';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Load memberships on mount
  useEffect(() => {
    fetchMemberships();
  }, []);

  return {
    memberships,
    loading,
    error,
    fetchMemberships,
    addMembership,
    updateMembership: updateMembershipData,
    setError
  };
};