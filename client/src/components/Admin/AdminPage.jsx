import React from "react";
import { useAuthStore } from "../../store/useAuthStore";
import "./AdminPage.css";

function AdminPage() {
  const { user } = useAuthStore();

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome, {user?.name || "Administrator"}!</p>
      </div>
    </div>
  );
}

export default AdminPage;
