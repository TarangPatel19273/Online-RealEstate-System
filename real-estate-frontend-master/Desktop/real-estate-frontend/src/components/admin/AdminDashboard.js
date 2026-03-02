import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "../../config";
import "./AdminDashboard.css";

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get(`${API_BASE}/api/admin/analytics`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setStats({
                    ...res.data,
                    mostViewedProperty: "Sunset Villa (ID: 104)", // Mocked as per prompt
                    topCity: "Mumbai" // Mocked as per prompt
                });
                setLoading(false);
            } catch (error) {
                console.error("Error fetching admin stats:", error);
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div>Loading dashboard...</div>;
    if (!stats) return <div>Error loading analytics.</div>;

    const cards = [
        { title: "Total Users", value: stats.totalUsers, icon: "👥", color: "#4f46e5" },
        { title: "Total Properties", value: stats.totalProperties, icon: "🏠", color: "#10b981" },
        { title: "Properties Sold", value: stats.totalSold, icon: "💰", color: "#f59e0b" },
        { title: "Properties for Rent", value: stats.totalRent, icon: "🔑", color: "#6366f1" },
        { title: "Total Visits", value: stats.totalVisits, icon: "📅", color: "#ec4899" },
        { title: "Loan Requests", value: stats.totalLoanRequests, icon: "🏦", color: "#8b5cf6" },
        { title: "Most Viewed Property", value: stats.mostViewedProperty, icon: "🔥", color: "#ef4444" },
        { title: "Top City", value: stats.topCity, icon: "🏙️", color: "#06b6d4" },
    ];

    return (
        <div className="admin-dashboard">
            <h1>Analytics Dashboard</h1>
            <p className="subtitle">Enterprise Overview</p>

            <div className="stats-grid">
                {cards.map((card, index) => (
                    <div className="stat-card" key={index} style={{ borderBottomColor: card.color }}>
                        <div className="stat-icon" style={{ backgroundColor: `${card.color}20`, color: card.color }}>
                            {card.icon}
                        </div>
                        <div className="stat-content">
                            <h3>{card.title}</h3>
                            <p className="stat-value">{card.value}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminDashboard;
