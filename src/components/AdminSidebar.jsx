import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function AdminSidebar() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="admin-sidebar admin-sidebar-reference" aria-label="Admin navigation">
      <p className="admin-sidebar-title">Administration</p>
      <NavLink end to="/"><span aria-hidden="true">⌂</span> Dashboard</NavLink>
      <NavLink end to="/admin/event-management"><span aria-hidden="true">▣</span> Event Management</NavLink>
      {isAuthenticated && <NavLink end to="/admin/activity-logs"><span aria-hidden="true">▤</span> Activity Logs</NavLink>}
      {isAuthenticated && (
        <button className="admin-logout-button" type="button" onClick={handleLogout}><span aria-hidden="true">⇥</span> Logout</button>
      )}
    </aside>
  );
}

export default AdminSidebar;
