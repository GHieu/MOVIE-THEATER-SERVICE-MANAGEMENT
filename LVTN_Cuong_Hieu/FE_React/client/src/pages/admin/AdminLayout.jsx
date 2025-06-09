import React from "react";
import { Outlet } from "react-router-dom";

import Dashboard from "../../components/admin/Dashboard";
const AdminLayout = () => {
  return (
    <div className="flex">
      <div className="flex-1">
        <Dashboard />
        <main className="p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
