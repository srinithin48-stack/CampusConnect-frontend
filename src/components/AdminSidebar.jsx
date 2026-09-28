import React from 'react';
import { NavLink } from 'react-router-dom';

function AdminSidebar() {
  return (
    <aside className="admin-sidebar admin-sidebar-reference" aria-label="Admin navigation">
      <p className="admin-sidebar-title">Administration</p>
      <NavLink end to="/"><span aria-hidden="true">⌂</span> Dashboard</NavLink>
      <NavLink end to="/admin/event-management"><span aria-hidden="true">▣</span> Event Management</NavLink>
      <NavLink end to="/admin/activity-logs"><span aria-hidden="true">▤</span> Activity Logs</NavLink>
      <button className="admin-logout-button" type="button"><span aria-hidden="true">⇥</span> Logout</button>
    </aside>
  );
}

export default AdminSidebar;
