import React from "react";
import Dashboard from "../../components/admin/Dashboard";

const AdminLayout = ({ onLogout }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Dashboard onLogout={onLogout} />
    </div>
  );
};

export default AdminLayout;