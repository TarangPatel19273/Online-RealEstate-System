import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { API_BASE } from "../config";
import "./MyLoans.css";

const LoanTimeline = ({ status }) => {
    const stages = [
        { key: 'PENDING', label: 'Application Submitted' },
        { key: 'APPROVED', label: 'Admin Approved' },
        { key: 'PROCESSING', label: 'Bank Details Submitted' },
        { key: 'DOCUMENT_VERIFICATION', label: 'Documents Verified' },
        { key: 'DISBURSED', label: 'Loan Disbursed' },
        { key: 'COMPLETED', label: 'Completed' }
    ];

    const currentIndex = stages.findIndex(s => s.key === status);
    // If status is REJECTED, handle differently
    if (status === 'REJECTED') {
        return (
            <div style={{ marginTop: '20px', padding: '15px', background: '#ffebee', color: '#c62828', borderRadius: '8px', textAlign: 'center' }}>
                <strong>Application Rejected</strong>
            </div>
        );
    }

    return (
        <div className="loan-timeline" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', marginBottom: '20px', position: 'relative' }}>
            {/* Background line */}
            <div style={{ position: 'absolute', top: '15px', left: '0', right: '0', height: '4px', background: '#e0e0e0', zIndex: 1 }}>
                {/* Active line */}
                <div style={{ position: 'absolute', top: '0', left: '0', height: '100%', background: '#4caf50', width: `${currentIndex >= 0 ? (currentIndex / (stages.length - 1)) * 100 : 0}%`, transition: 'width 0.3s ease' }}></div>
            </div>

            {stages.map((stage, index) => {
                const isCompleted = index <= currentIndex;
                const isCurrent = index === currentIndex;

                return (
                    <div key={stage.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, width: '100px' }}>
                        <div style={{
                            width: '34px', height: '34px', borderRadius: '50%',
                            background: isCompleted ? '#4caf50' : '#fff',
                            border: `3px solid ${isCompleted ? '#4caf50' : '#e0e0e0'}`,
                            display: 'flex', justifyContent: 'center', alignItems: 'center',
                            color: isCompleted ? '#fff' : '#999',
                            fontWeight: 'bold', fontSize: '14px',
                            boxShadow: isCurrent ? '0 0 0 4px rgba(76, 175, 80, 0.2)' : 'none'
                        }}>
                            {isCompleted ? '✓' : index + 1}
                        </div>
                        <div style={{ textAlign: 'center', fontSize: '12px', marginTop: '8px', color: isCurrent ? '#333' : '#666', fontWeight: isCurrent ? 'bold' : 'normal' }}>
                            {stage.label}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

const LoanEMISchedule = ({ loanId, status }) => {
    const [emiSchedule, setEmiSchedule] = useState([]);
    // loading state removed to avoid warning

    const fetchSchedule = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE}/api/loans/user/${loanId}/emi-schedule`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setEmiSchedule(data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (status === 'DISBURSED' || status === 'COMPLETED') {
            fetchSchedule();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loanId, status]);

    const handlePayEmi = async (emiId) => {
        if (!window.confirm("Simulate paying this EMI?")) return;

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE}/api/loans/user/${loanId}/pay-emi/${emiId}`, {
                method: 'POST',
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (res.ok) {
                alert("EMI Paid Successfully!");
                fetchSchedule();
            } else {
                const text = await res.text();
                alert(`Failed: ${text}`);
            }
        } catch (error) {
            console.error(error);
            alert("Error paying EMI");
        }
    };

    if (emiSchedule.length === 0) return null;

    return (
        <div className="loan-emi-section" style={{ marginTop: "15px", padding: "15px", border: "1px solid #ddd", borderRadius: "8px" }}>
            <h4>EMI Repayment Schedule</h4>
            <div style={{ maxHeight: '300px', overflowY: 'auto', marginTop: '10px' }}>
                <table className="emi-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead>
                        <tr style={{ background: '#f5f5f5', textAlign: 'left' }}>
                            <th style={{ padding: '8px', borderBottom: '2px solid #ddd' }}>Month</th>
                            <th style={{ padding: '8px', borderBottom: '2px solid #ddd' }}>EMI Amount</th>
                            <th style={{ padding: '8px', borderBottom: '2px solid #ddd' }}>Principal</th>
                            <th style={{ padding: '8px', borderBottom: '2px solid #ddd' }}>Interest</th>
                            <th style={{ padding: '8px', borderBottom: '2px solid #ddd' }}>Balance</th>
                            <th style={{ padding: '8px', borderBottom: '2px solid #ddd' }}>Due Date</th>
                            <th style={{ padding: '8px', borderBottom: '2px solid #ddd' }}>Status</th>
                            <th style={{ padding: '8px', borderBottom: '2px solid #ddd' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {emiSchedule.map((emi, index) => {
                            // Determine if this EMI is the "next payable" one
                            const isNextPayable = emi.status !== "PAID" && (index === 0 || emiSchedule[index - 1].status === "PAID");

                            return (
                                <tr key={emi.id} style={{ borderBottom: '1px solid #eee', background: emi.status === 'PAID' ? '#f1f8e9' : 'transparent' }}>
                                    <td style={{ padding: '8px' }}>{emi.monthNumber}</td>
                                    <td style={{ padding: '8px' }}>₹{emi.emiAmount.toFixed(0)}</td>
                                    <td style={{ padding: '8px' }}>₹{emi.principalAmount.toFixed(0)}</td>
                                    <td style={{ padding: '8px' }}>₹{emi.interestAmount.toFixed(0)}</td>
                                    <td style={{ padding: '8px' }}>₹{emi.remainingBalance.toFixed(0)}</td>
                                    <td style={{ padding: '8px' }}>{new Date(emi.dueDate).toLocaleDateString()}</td>
                                    <td style={{ padding: '8px', color: emi.status === 'PAID' ? 'green' : 'orange', fontWeight: 'bold' }}>
                                        {emi.status}
                                    </td>
                                    <td style={{ padding: '8px' }}>
                                        {emi.status !== "PAID" && isNextPayable ? (
                                            <button onClick={() => handlePayEmi(emi.id)} style={{ padding: "4px 8px", background: "#4caf50", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: '12px' }}>
                                                Pay Now
                                            </button>
                                        ) : emi.status === "PAID" ? (
                                            <span style={{ color: '#888', fontSize: '12px' }}>Paid on <br />{new Date(emi.paidAt).toLocaleDateString()}</span>
                                        ) : null}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const LoanDocumentsSection = ({ loanId }) => {
    const [docs, setDocs] = useState([]);
    const [docType, setDocType] = useState("Aadhaar Card");
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchDocs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loanId]);

    const fetchDocs = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE}/api/loans/user/${loanId}/documents`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setDocs(data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleUpload = async () => {
        if (!file) return alert("Please select a file");
        setUploading(true);
        const formData = new FormData();
        formData.append("documentType", docType);
        formData.append("file", file);

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE}/api/loans/user/${loanId}/documents`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` },
                body: formData
            });

            if (res.ok) {
                alert("Document uploaded successfully");
                setFile(null);
                fetchDocs();
            } else {
                alert("Failed to upload document");
            }
        } catch (error) {
            console.error(error);
            alert("Error uploading document");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="loan-documents-section" style={{ marginTop: "15px", padding: "15px", border: "1px solid #ddd", borderRadius: "8px" }}>
            <h4>Loan Documents</h4>
            {docs.length > 0 ? (
                <ul style={{ listStyle: "none", padding: 0 }}>
                    {docs.map(d => (
                        <li key={d.id} style={{ marginBottom: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span><strong>{d.documentType}</strong> ({d.status})</span>
                            <a href={`${API_BASE}/api/loans/${d.fileUrl}`} target="_blank" rel="noopener noreferrer" style={{ padding: "5px 10px", background: "#f0f0f0", borderRadius: "4px", textDecoration: "none" }}>View</a>
                            {d.adminRemarks && <span style={{ color: "red", fontSize: "12px", marginLeft: "10px" }}>Remarks: {d.adminRemarks}</span>}
                        </li>
                    ))}
                </ul>
            ) : (
                <p style={{ fontSize: "14px", color: "#666" }}>No documents uploaded yet.</p>
            )}

            <div className="upload-form" style={{ display: "flex", gap: "10px", marginTop: "15px", alignItems: "center" }}>
                <select value={docType} onChange={e => setDocType(e.target.value)} style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}>
                    <option value="Aadhaar Card">Aadhaar Card</option>
                    <option value="PAN Card">PAN Card</option>
                    <option value="Salary Slip">Salary Slip</option>
                    <option value="Bank Statement">Bank Statement</option>
                    <option value="Property Agreement">Property Agreement</option>
                </select>
                <input type="file" onChange={e => setFile(e.target.files[0])} style={{ padding: "5px" }} />
                <button onClick={handleUpload} disabled={uploading || !file} style={{ padding: "8px 12px", background: "#0078db", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
                    {uploading ? "Uploading..." : "Upload"}
                </button>
            </div>
        </div>
    );
};

const MyLoans = () => {
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [bankDetails, setBankDetails] = useState({
        selectedBank: "",
        bankAccountNumber: "",
        bankIfscCode: ""
    });
    const [submittingBank, setSubmittingBank] = useState({}); // Track which loan is submitting
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMyLoans = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    navigate("/login");
                    return;
                }

                const response = await fetch(`${API_BASE}/api/loans/my-loans`, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setLoans(data);
                } else {
                    setError("Failed to fetch loans");
                }
            } catch (err) {
                console.error("Error fetching loans:", err);
                setError("Error connecting to server");
            } finally {
                setLoading(false);
            }
        };

        fetchMyLoans();
    }, [navigate]);

    const handleBankChange = (e) => {
        const { name, value } = e.target;
        setBankDetails(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const submitBankDetails = async (loanId) => {
        if (!bankDetails.selectedBank || !bankDetails.bankAccountNumber || !bankDetails.bankIfscCode) {
            alert("Please fill in all bank details");
            return;
        }

        try {
            setSubmittingBank(prev => ({ ...prev, [loanId]: true }));
            const token = localStorage.getItem("token");

            const response = await fetch(`${API_BASE}/api/loans/user/${loanId}/bank-details`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(bankDetails)
            });

            if (response.ok) {
                alert("Bank details submitted successfully!");
                // Refresh list
                window.location.reload();
            } else {
                const text = await response.text();
                alert(`Failed: ${text}`);
            }
        } catch (err) {
            console.error(err);
            alert("Error submitting details");
        } finally {
            setSubmittingBank(prev => ({ ...prev, [loanId]: false }));
        }
    };

    if (loading) return <div>Loading your loans...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="my-loans-page">
            <Navbar />
            <div className="my-loans-container">
                <h2>My Loan Applications</h2>

                {loans.length === 0 ? (
                    <p>You have not applied for any loans yet.</p>
                ) : (
                    <div className="loan-list">
                        {loans.map(loan => (
                            <div key={loan.id} className="loan-card">
                                <div className="loan-header">
                                    <h3>Loan Amount: ₹{loan.loanAmount}</h3>
                                    <span className={`status badge-${(loan.status || '').toLowerCase()}`}>
                                        {loan.status}
                                    </span>
                                </div>
                                <LoanTimeline status={loan.status} />
                                <div className="loan-details">
                                    <p><strong>Property City:</strong> {loan.propertyCity}</p>
                                    <p><strong>Tenure:</strong> {loan.tenureYears} Years</p>
                                    <p><strong>Applied On:</strong> {new Date(loan.createdAt).toLocaleDateString()}</p>
                                </div>
                                {(loan.status === 'DISBURSED' || loan.status === 'COMPLETED') && (
                                    <div style={{ marginTop: '15px' }}>
                                        <button
                                            onClick={async () => {
                                                try {
                                                    const token = localStorage.getItem("token");
                                                    const res = await fetch(`${API_BASE}/api/loans/user/${loan.id}/agreement`, {
                                                        headers: { "Authorization": `Bearer ${token}` }
                                                    });
                                                    if (res.ok) {
                                                        const blob = await res.blob();
                                                        const url = window.URL.createObjectURL(blob);
                                                        const a = document.createElement('a');
                                                        a.href = url;
                                                        a.download = `LoanAgreement_${loan.id}.pdf`;
                                                        document.body.appendChild(a);
                                                        a.click();
                                                        a.remove();
                                                    } else {
                                                        alert("Agreement not available yet.");
                                                    }
                                                } catch (err) {
                                                    console.error("Error downloading agreement", err);
                                                    alert("Error downloading agreement");
                                                }
                                            }}
                                            style={{ padding: "8px 16px", background: "#f0f0f0", color: "#333", border: "1px solid #ccc", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>
                                            📄 Download Loan Agreement
                                        </button>
                                    </div>
                                )}
                                {loan.adminRemarks && (
                                    <div className="admin-remarks">
                                        <p><strong>Admin Remarks:</strong> {loan.adminRemarks}</p>
                                    </div>
                                )}

                                {/* Show submitted bank details if we are past the APPROVED stage */}
                                {loan.status !== "PENDING" && loan.status !== "APPROVED" && loan.selectedBank ? (
                                    <div className="bank-details-submitted">
                                        <h4>Bank Details Submitted</h4>
                                        <p><strong>Bank:</strong> {loan.selectedBank}</p>
                                        <p><strong>Account End:</strong> ****{loan.bankAccountNumber.slice(-4)}</p>
                                        <p><strong>Status:</strong> {loan.status}</p>
                                    </div>
                                ) : loan.status === "APPROVED" && !loan.selectedBank ? (
                                    <div className="bank-details-form">
                                        <h4>Application Approved! Select Bank to Proceed</h4>
                                        <div className="form-group">
                                            <label>Select Bank</label>
                                            <select name="selectedBank" value={bankDetails.selectedBank} onChange={handleBankChange}>
                                                <option value="">-- Choose a Bank --</option>
                                                <option value="HDFC Bank">HDFC Bank</option>
                                                <option value="SBI">SBI</option>
                                                <option value="ICICI Bank">ICICI Bank</option>
                                                <option value="Axis Bank">Axis Bank</option>
                                                <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Bank Account Number</label>
                                            <input
                                                type="text"
                                                name="bankAccountNumber"
                                                value={bankDetails.bankAccountNumber}
                                                onChange={handleBankChange}
                                                placeholder="Enter Account Number"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>IFSC Code</label>
                                            <input
                                                type="text"
                                                name="bankIfscCode"
                                                value={bankDetails.bankIfscCode}
                                                onChange={handleBankChange}
                                                placeholder="Enter IFSC Code"
                                            />
                                        </div>
                                        <button
                                            className="btn-submit-bank"
                                            onClick={() => submitBankDetails(loan.id)}
                                            disabled={submittingBank[loan.id]}
                                        >
                                            {submittingBank[loan.id] ? "Submitting..." : "Submit Bank Details"}
                                        </button>
                                    </div>
                                ) : null}

                                <LoanDocumentsSection loanId={loan.id} />

                                {/* Render EMI Schedule only if Disbursed or Completed */}
                                {(loan.status === 'DISBURSED' || loan.status === 'COMPLETED') && (
                                    <LoanEMISchedule loanId={loan.id} status={loan.status} />
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyLoans;
