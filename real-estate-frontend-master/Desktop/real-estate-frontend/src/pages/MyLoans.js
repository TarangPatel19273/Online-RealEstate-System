import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { API_BASE } from "../config";
import "./MyLoans.css";

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
                                    <span className={`status badge-${loan.status.toLowerCase()}`}>
                                        {loan.status}
                                    </span>
                                </div>
                                <div className="loan-details">
                                    <p><strong>Property City:</strong> {loan.propertyCity}</p>
                                    <p><strong>Tenure:</strong> {loan.tenureYears} Years</p>
                                    <p><strong>Applied On:</strong> {new Date(loan.createdAt).toLocaleDateString()}</p>
                                </div>
                                {loan.adminRemarks && (
                                    <div className="admin-remarks">
                                        <p><strong>Admin Remarks:</strong> {loan.adminRemarks}</p>
                                    </div>
                                )}

                                {loan.status === "APPROVED" && loan.selectedBank ? (
                                    <div className="bank-details-submitted">
                                        <h4>Bank Details Submitted</h4>
                                        <p><strong>Bank:</strong> {loan.selectedBank}</p>
                                        <p><strong>Account End:</strong> ****{loan.bankAccountNumber.slice(-4)}</p>
                                        <p><strong>Status:</strong> Processing...</p>
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
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyLoans;
