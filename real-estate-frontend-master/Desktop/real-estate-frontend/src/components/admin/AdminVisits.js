import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "../../config";
import "./AdminTables.css";

const AdminVisits = () => {
    const [visits, setVisits] = useState([]);
    const [analytics, setAnalytics] = useState(null);

    // Filters
    const [statusFilter, setStatusFilter] = useState("");
    const [dateFilter, setDateFilter] = useState("");
    const [propertyFilter, setPropertyFilter] = useState("");
    const [userFilter, setUserFilter] = useState("");

    useEffect(() => {
        fetchVisits();
        fetchAnalytics();
    }, []);

    const fetchVisits = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`${API_BASE}/api/admin/visits`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Sort to show pending first, or newest first
            const sortedVisits = res.data.sort((a, b) => new Date(b.createdAt || b.visitDate) - new Date(a.createdAt || a.visitDate));
            setVisits(sortedVisits);
        } catch (error) {
            console.error("Error fetching visits", error);
        }
    };

    const fetchAnalytics = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`${API_BASE}/api/admin/visits/analytics`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAnalytics(res.data);
        } catch (error) {
            console.error("Error fetching analytics", error);
        }
    };

    const updateStatus = async (id, status) => {
        let remarks = "";
        if (status === 'APPROVED' || status === 'REJECTED') {
            remarks = window.prompt(`Enter any remarks for the user (optional):`);
            if (remarks === null) return; // User cancelled the prompt
        }

        try {
            const token = localStorage.getItem("token");
            await axios.put(`${API_BASE}/api/admin/visits/${id}/status?status=${status}&remarks=${encodeURIComponent(remarks)}`, null, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchVisits();
            fetchAnalytics(); // Update stats
        } catch (error) {
            console.error("Error updating status", error);
            alert("Failed to update status.");
        }
    };

    // Derived state for filtered visits
    const filteredVisits = visits.filter(v => {
        const matchStatus = statusFilter ? v.status === statusFilter : true;
        const matchDate = dateFilter ? new Date(v.visitDate).toLocaleDateString() === new Date(dateFilter).toLocaleDateString() : true;
        const matchProperty = propertyFilter ? v.property?.id.toString() === propertyFilter || v.property?.title.toLowerCase().includes(propertyFilter.toLowerCase()) : true;
        const matchUser = userFilter ? v.user?.id.toString() === userFilter || v.user?.name.toLowerCase().includes(userFilter.toLowerCase()) : true;
        return matchStatus && matchDate && matchProperty && matchUser;
    });

    return (
        <div>
            <div className="admin-header">
                <h1>Visit Management</h1>
            </div>

            {/* Analytics Dashboard */}
            {analytics && (
                <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' }}>
                    <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', flex: 1, minWidth: '150px' }}>
                        <h4 style={{ margin: '0 0 10px 0', color: '#666' }}>Total Requests</h4>
                        <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{analytics.totalRequests}</div>
                    </div>
                    <div style={{ background: '#fff3cd', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', flex: 1, minWidth: '150px' }}>
                        <h4 style={{ margin: '0 0 10px 0', color: '#856404' }}>Pending</h4>
                        <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#856404' }}>{analytics.pendingVisits}</div>
                    </div>
                    <div style={{ background: '#d4edda', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', flex: 1, minWidth: '150px' }}>
                        <h4 style={{ margin: '0 0 10px 0', color: '#155724' }}>Approved</h4>
                        <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#155724' }}>{analytics.approvedVisits}</div>
                    </div>
                    <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', flex: 1, minWidth: '150px' }}>
                        <h4 style={{ margin: '0 0 10px 0', color: '#666' }}>Hot Property ID</h4>
                        <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{analytics.mostRequestedPropertyId || 'N/A'}</div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap', background: 'white', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <div style={{ flex: 1, minWidth: '150px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '5px' }}>Status</label>
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
                        <option value="">All Statuses</option>
                        <option value="PENDING">Pending</option>
                        <option value="APPROVED">Approved</option>
                        <option value="REJECTED">Rejected</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>
                </div>
                <div style={{ flex: 1, minWidth: '150px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '5px' }}>Date</label>
                    <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
                </div>
                <div style={{ flex: 1, minWidth: '150px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '5px' }}>Property (ID or Title)</label>
                    <input type="text" value={propertyFilter} onChange={e => setPropertyFilter(e.target.value)} placeholder="e.g. 5 or Villa" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
                </div>
                <div style={{ flex: 1, minWidth: '150px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '5px' }}>User (ID or Name)</label>
                    <input type="text" value={userFilter} onChange={e => setUserFilter(e.target.value)} placeholder="e.g. 2 or John" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
                </div>
            </div>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>User</th>
                            <th>Property</th>
                            <th>Details</th>
                            <th>Status & Remarks</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredVisits.length === 0 ? (
                            <tr><td colSpan="6" style={{ textAlign: "center" }}>No visits found matching filters.</td></tr>
                        ) : (
                            filteredVisits.map(v => (
                                <tr key={v.id}>
                                    <td>{v.id}</td>
                                    <td>
                                        <div><strong>{v.user?.name}</strong></div>
                                        <div style={{ fontSize: '12px', color: '#666' }}>ID: {v.user?.id}</div>
                                    </td>
                                    <td>
                                        <div><strong>{v.property?.title}</strong></div>
                                        <div style={{ fontSize: '12px', color: '#666' }}>ID: {v.property?.id}</div>
                                    </td>
                                    <td>
                                        <div><strong>{new Date(v.visitDate).toLocaleString()}</strong></div>
                                        <div style={{ fontSize: '13px', marginTop: '4px' }}>📞 {v.contactNumber || 'N/A'}</div>
                                        {v.message && <div style={{ fontSize: '12px', fontStyle: 'italic', marginTop: '2px', color: '#666', maxWidth: '200px' }}>"{v.message}"</div>}
                                    </td>
                                    <td>
                                        <div>
                                            <span style={{
                                                padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold',
                                                background: v.status === 'APPROVED' ? '#d4edda' : v.status === 'REJECTED' ? '#f8d7da' : v.status === 'CANCELLED' ? '#e2e3e5' : '#fff3cd',
                                                color: v.status === 'APPROVED' ? '#155724' : v.status === 'REJECTED' ? '#721c24' : v.status === 'CANCELLED' ? '#383d41' : '#856404'
                                            }}>
                                                {v.status}
                                            </span>
                                        </div>
                                        {v.remarks && <div style={{ fontSize: '12px', marginTop: '6px', color: '#d9534f' }}>Admin: {v.remarks}</div>}
                                    </td>
                                    <td>
                                        {v.status === 'PENDING' && (
                                            <div style={{ display: 'flex', gap: '5px', flexDirection: 'column' }}>
                                                <button onClick={() => updateStatus(v.id, 'APPROVED')} className="action-btn btn-success" style={{ width: '100%' }}>Approve</button>
                                                <button onClick={() => updateStatus(v.id, 'REJECTED')} className="action-btn btn-danger" style={{ width: '100%' }}>Reject</button>
                                            </div>
                                        )}
                                        {v.status !== 'PENDING' && v.status !== 'CANCELLED' && (
                                            <button onClick={() => updateStatus(v.id, 'CANCELLED')} className="action-btn" style={{ background: '#6c757d', color: 'white', width: '100%' }}>Cancel</button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
export default AdminVisits;
