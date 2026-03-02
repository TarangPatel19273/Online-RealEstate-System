import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "../../config";
import "./AdminTables.css";

const AdminLoans = () => {
    const [loans, setLoans] = useState([]);
    const [remarksModal, setRemarksModal] = useState({ show: false, loanId: null, status: '', remarks: '' });

    useEffect(() => {
        fetchLoans();
    }, []);

    const fetchLoans = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`${API_BASE}/api/admin/loans`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLoans(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleStatusClick = (id, status) => {
        setRemarksModal({ show: true, loanId: id, status: status, remarks: '' });
    };

    const confirmStatusUpdate = async () => {
        const { loanId, status, remarks } = remarksModal;
        try {
            const token = localStorage.getItem("token");
            await axios.put(`${API_BASE}/api/admin/loans/${loanId}/status?status=${status}&remarks=${encodeURIComponent(remarks)}`, null, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRemarksModal({ show: false, loanId: null, status: '', remarks: '' });
            fetchLoans();
        } catch (error) {
            console.error(error);
            alert("Failed to update status");
        }
    };

    return (
        <div>
            <div className="admin-header">
                <h1>Loan Applications</h1>
            </div>
            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Applicant</th>
                            <th>Amount</th>
                            <th>Property City</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loans.map(l => (
                            <tr key={l.id}>
                                <td>{l.id}</td>
                                <td>
                                    {l.fullName} <br /><small>{l.email}</small> <br />
                                    <small>{l.panNumber && `PAN: ${l.panNumber}`}</small>
                                </td>
                                <td>
                                    ₹{l.loanAmount} <br />
                                    <small>{l.tenureYears} Yrs</small>
                                </td>
                                <td>{l.propertyCity}</td>
                                <td>
                                    {l.documentUrl ? (
                                        <a href={`${API_BASE}/api/loans/${l.documentUrl}`} target="_blank" rel="noopener noreferrer" className="btn-view-doc">
                                            View Doc
                                        </a>
                                    ) : (
                                        <span className="text-muted">No Doc</span>
                                    )}
                                </td>
                                <td><strong>{l.status}</strong></td>
                                <td>
                                    {l.status === 'PENDING' && (
                                        <div style={{ display: 'flex', gap: '5px' }}>
                                            <button onClick={() => handleStatusClick(l.id, 'APPROVED')} className="action-btn btn-success">Approve</button>
                                            <button onClick={() => handleStatusClick(l.id, 'REJECTED')} className="action-btn btn-danger">Reject</button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {/* Remarks Modal */}
                {remarksModal.show && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h3>{remarksModal.status === 'APPROVED' ? 'Approve Loan' : 'Reject Loan'}</h3>
                            <div className="form-group">
                                <label>Admin Remarks (Optional)</label>
                                <textarea
                                    value={remarksModal.remarks}
                                    onChange={(e) => setRemarksModal({ ...remarksModal, remarks: e.target.value })}
                                    placeholder="Enter remarks for the user..."
                                    rows="4"
                                    style={{ width: '100%', padding: '10px', marginTop: '10px' }}
                                ></textarea>
                            </div>
                            <div className="modal-actions" style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button onClick={() => setRemarksModal({ show: false, loanId: null, status: '', remarks: '' })} className="btn-secondary">Cancel</button>
                                <button onClick={confirmStatusUpdate} className={`btn-${remarksModal.status === 'APPROVED' ? 'success' : 'danger'}`}>
                                    Confirm {remarksModal.status}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminLoans;
