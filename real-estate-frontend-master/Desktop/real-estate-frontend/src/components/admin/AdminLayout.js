import React from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import "./AdminLayout.css";

const AdminLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    const isActive = (path) => {
        return location.pathname === path ? "active" : "";
    };

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <div className="sidebar-header">
                    <h2>Admin Panel</h2>
                </div>
                <nav className="sidebar-nav">
                    <Link to="/admin" className={isActive("/admin")}>Dashboard</Link>
                    <Link to="/admin/properties" className={isActive("/admin/properties")}>Properties</Link>
                    <Link to="/admin/users" className={isActive("/admin/users")}>Users</Link>
                    <Link to="/admin/visits" className={isActive("/admin/visits")}>Visits</Link>
                    <Link to="/admin/loans" className={isActive("/admin/loans")}>Loans</Link>
                </nav>
                <div className="sidebar-footer">
                    <button onClick={handleLogout} className="logout-btn">Logout</button>
                </div>
            </aside>
            <main className="admin-content">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
