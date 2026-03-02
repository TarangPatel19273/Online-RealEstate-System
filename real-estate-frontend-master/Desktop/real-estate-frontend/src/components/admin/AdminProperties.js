import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "../../config";
import "./AdminTables.css";

const AdminProperties = () => {
    const [properties, setProperties] = useState([]);

    useEffect(() => {
        fetchProperties();
    }, []);

    const fetchProperties = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`${API_BASE}/api/admin/properties`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProperties(res.data);
        } catch (error) {
            console.error("Error fetching properties", error);
        }
    };

    const deleteProperty = async (id) => {
        if (!window.confirm("Delete this property?")) return;
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`${API_BASE}/api/admin/properties/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchProperties();
        } catch (error) {
            console.error(error);
        }
    };

    const toggleFlag = async (id, currentFlags, flagName) => {
        try {
            const token = localStorage.getItem("token");
            await axios.put(`${API_BASE}/api/admin/properties/${id}/flags?${flagName}=${!currentFlags[flagName]}`, null, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchProperties();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div>
            <div className="admin-header">
                <h1>Property Management</h1>
            </div>
            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Title</th>
                            <th>Type</th>
                            <th>Location</th>
                            <th>Stats</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {properties.map(p => (
                            <tr key={p.id}>
                                <td>{p.id}</td>
                                <td>{p.title}</td>
                                <td>{p.type} <br /><small>{p.propertyStatus}</small></td>
                                <td>{p.city}</td>
                                <td>
                                    {p.featured && <span className="action-btn btn-warning">Featured</span>}
                                    {p.verified && <span className="action-btn btn-success">Verified</span>}
                                </td>
                                <td>
                                    <button onClick={() => toggleFlag(p.id, p, 'featured')} className="action-btn btn-warning">Toggle Featured</button>
                                    <button onClick={() => toggleFlag(p.id, p, 'verified')} className="action-btn btn-success">Toggle Verified</button>
                                    <button onClick={() => deleteProperty(p.id)} className="action-btn btn-danger">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
export default AdminProperties;
