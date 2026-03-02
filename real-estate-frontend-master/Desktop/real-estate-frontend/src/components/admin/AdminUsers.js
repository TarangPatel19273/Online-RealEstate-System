import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "../../config";
import "./AdminTables.css";

const AdminUsers = () => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`${API_BASE}/api/admin/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const toggleBlock = async (id, isBlocked) => {
        try {
            const token = localStorage.getItem("token");
            await axios.put(`${API_BASE}/api/admin/users/${id}/block?block=${!isBlocked}`, null, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchUsers();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div>
            <div className="admin-header">
                <h1>User Management</h1>
            </div>
            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u.id}>
                                <td>{u.id}</td>
                                <td>{u.fullName || u.username}</td>
                                <td>{u.email}</td>
                                <td>{u.role}</td>
                                <td>{u.blocked ? <span style={{ color: 'red' }}>Blocked</span> : "Active"}</td>
                                <td>
                                    <button onClick={() => toggleBlock(u.id, u.blocked)} className={u.blocked ? "action-btn btn-success" : "action-btn btn-danger"}>
                                        {u.blocked ? "Unblock" : "Block"}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
export default AdminUsers;
