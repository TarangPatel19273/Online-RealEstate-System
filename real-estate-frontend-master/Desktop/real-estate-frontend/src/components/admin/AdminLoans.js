import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "../../config";
import "./AdminTables.css";

const AdminDocumentsModal = ({ loanId, onClose }) => {
    const [docs, setDocs] = useState([]);

    useEffect(() => {
        fetchDocs();
    }, [loanId, setDocs]); // Added setDocs to avoid linting on fetchDocs inside dependency array or just define fetchDocs outside/inside properly. We'll disable line for simplicity if needed, but defining it inside is best practice. Let's just fix the deps warning.

    // Better to move fetchDocs inside useEffect if it's only used there, but since handleUpload uses it, we wrap it in useCallback or just disable the line.
    // For this quick fix, I will just add the dependency.

    const fetchDocs = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`${API_BASE}/api/admin/loans/${loanId}/documents`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDocs(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const updateStatus = async (docId, newStatus) => {
        const remarks = prompt("Enter remarks (optional):", "");
        if (remarks === null) return; // User cancelled

        try {
            const token = localStorage.getItem("token");
            await axios.put(`${API_BASE}/api/admin/loans/documents/${docId}/status?status=${newStatus}&remarks=${encodeURIComponent(remarks)}`, null, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchDocs();
        } catch (error) {
            console.error(error);
            alert("Failed to update document status");
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ width: '600px', maxWidth: '90%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ddd', paddingBottom: '10px', marginBottom: '15px' }}>
                    <h3 style={{ margin: 0 }}>Review Loan Documents</h3>
                    <button onClick={onClose} style={{ border: 'none', background: 'transparent', fontSize: '20px', cursor: 'pointer' }}>&times;</button>
                </div>

                {docs.length === 0 ? (
                    <p>No documents uploaded for this loan.</p>
                ) : (
                    <ul style={{ listStyle: "none", padding: 0 }}>
                        {docs.map(d => (
                            <li key={d.id} style={{ marginBottom: "15px", padding: "10px", border: "1px solid #eee", borderRadius: "5px" }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                    <span><strong>{d.documentType}</strong> - <span style={{
                                        color: d.status === 'VERIFIED' ? 'green' : d.status === 'REJECTED' ? 'red' : 'orange'
                                    }}>{d.status}</span></span>
                                    <a href={`${API_BASE}/api/loans/${d.fileUrl}`} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ padding: "5px 10px", textDecoration: "none" }}>Open File</a>
                                </div>
                                {d.adminRemarks && <div style={{ fontSize: '13px', color: '#666', marginBottom: '10px' }}>Remarks: {d.adminRemarks}</div>}
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    {d.status !== 'VERIFIED' && <button className="action-btn btn-success" onClick={() => updateStatus(d.id, 'VERIFIED')}>Verify</button>}
                                    {d.status !== 'REJECTED' && <button className="action-btn btn-danger" onClick={() => updateStatus(d.id, 'REJECTED')}>Reject</button>}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

const AdminLoans = () => {
    const [loans, setLoans] = useState([]);
    const [remarksModal, setRemarksModal] = useState({ show: false, loanId: null, status: '', remarks: '' });
    const [docModalLoanId, setDocModalLoanId] = useState(null);

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
            await axios.put(`${API_BASE}/api/admin/loans/${loanId}/status`, null, {
                params: {
                    status: status,
                    remarks: remarks || ''
                },
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
                                    <button onClick={() => setDocModalLoanId(l.id)} className="action-btn btn-secondary" style={{ padding: "5px 10px" }}>
                                        View Documents
                                    </button>
                                </td>
                                <td><strong>{l.status}</strong></td>
                                <td>
                                    <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                                        <select
                                            value={l.status}
                                            onChange={(e) => handleStatusClick(l.id, e.target.value)}
                                            style={{ padding: "6px", borderRadius: "4px", border: "1px solid #ccc", minWidth: "150px" }}
                                        >
                                            <option value="PENDING">PENDING</option>
                                            <option value="APPROVED">APPROVED</option>
                                            <option value="PROCESSING">PROCESSING (Bank Details)</option>
                                            <option value="DOCUMENT_VERIFICATION">DOCUMENT_VERIFICATION</option>
                                            <option value="DISBURSED">DISBURSED</option>
                                            <option value="COMPLETED">COMPLETED</option>
                                            <option value="REJECTED">REJECTED</option>
                                        </select>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {/* Remarks Modal */}
                {remarksModal.show && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h3>Change Status to {remarksModal.status}</h3>
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

                {/* Documents Modal */}
                {docModalLoanId && <AdminDocumentsModal loanId={docModalLoanId} onClose={() => setDocModalLoanId(null)} />}
            </div>
        </div>
    );
};

export default AdminLoans;
