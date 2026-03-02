import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { API_BASE } from "../config";
import "./LoanApplication.css";

const LoanApplication = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        mobile: "",
        loanAmount: "",
        employmentType: "Salaried",
        annualIncome: "",
        propertyCity: "",
        message: "",
        tenureYears: "20",
        panNumber: ""
    });
    const [documentFile, setDocumentFile] = useState(null);
    const [propertyId, setPropertyId] = useState(null);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        // Pre-fill loan amount if passed from EMI Calculator
        if (location.state) {
            setFormData(prev => ({
                ...prev,
                loanAmount: location.state.loanAmount || prev.loanAmount,
                propertyCity: location.state.propertyCity || prev.propertyCity
            }));
            if (location.state.propertyId) {
                setPropertyId(location.state.propertyId);
            }
        }
    }, [location.state]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setDocumentFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

            const submitData = new FormData();
            Object.keys(formData).forEach(key => {
                submitData.append(key, formData[key]);
            });

            if (storedUser.id) {
                submitData.append("userId", storedUser.id);
            }
            if (propertyId) {
                submitData.append("propertyId", propertyId);
            }
            if (documentFile) {
                submitData.append("document", documentFile);
            }

            const response = await fetch(`${API_BASE}/api/loans/apply`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                    // Do NOT set Content-Type header when using FormData; the browser sets it with the correct boundary
                },
                body: submitData,
            });

            if (response.ok) {
                console.log("Loan Application Submitted:", formData);
                setSubmitted(true);
                setTimeout(() => {
                    navigate("/");
                }, 3000);
            } else {
                console.error("Failed to submit application");
                alert("Something went wrong. Please try again.");
            }
        } catch (error) {
            console.error("Error submitting application:", error);
            alert("Error connecting to server. Please try again.");
        }
    };

    return (
        <div className="loan-application-page">
            <Navbar />
            <div className="loan-container">
                <div className="loan-header">
                    <h1>Apply for Home Loan</h1>
                    <p>Get the best interest rates from our banking partners</p>
                </div>

                {submitted ? (
                    <div className="success-message">
                        <div className="success-icon">✅</div>
                        <h2>Application Submitted!</h2>
                        <p>Our loan expert will contact you shortly.</p>
                        <p>Redirecting to home...</p>
                    </div>
                ) : (
                    <form className="loan-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Full Name</label>
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                required
                                placeholder="Enter your full name"
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter your email"
                                />
                            </div>
                            <div className="form-group">
                                <label>Mobile Number</label>
                                <input
                                    type="tel"
                                    name="mobile"
                                    value={formData.mobile}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter 10-digit mobile number"
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Loan Amount Needed (₹)</label>
                                <input
                                    type="number"
                                    name="loanAmount"
                                    value={formData.loanAmount}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter amount"
                                />
                            </div>
                            <div className="form-group">
                                <label>Property City</label>
                                <input
                                    type="text"
                                    name="propertyCity"
                                    value={formData.propertyCity}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g. Mumbai, Bangalore"
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Employment Type</label>
                                <select
                                    name="employmentType"
                                    value={formData.employmentType}
                                    onChange={handleChange}
                                >
                                    <option value="Salaried">Salaried</option>
                                    <option value="Self-Employed">Self-Employed</option>
                                    <option value="Business Owner">Business Owner</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Annual Income (₹)</label>
                                <input
                                    type="number"
                                    name="annualIncome"
                                    value={formData.annualIncome}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter annual income"
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>PAN Number</label>
                                <input
                                    type="text"
                                    name="panNumber"
                                    value={formData.panNumber}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter PAN"
                                    maxLength="10"
                                />
                            </div>
                            <div className="form-group">
                                <label>Tenure (Years)</label>
                                <select
                                    name="tenureYears"
                                    value={formData.tenureYears}
                                    onChange={handleChange}
                                >
                                    <option value="5">5 Years</option>
                                    <option value="10">10 Years</option>
                                    <option value="15">15 Years</option>
                                    <option value="20">20 Years</option>
                                    <option value="25">25 Years</option>
                                    <option value="30">30 Years</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group" style={{ width: "100%" }}>
                                <label>Upload Supporting Document (e.g. Salary Slip, Bank Statement)</label>
                                <input
                                    type="file"
                                    name="document"
                                    onChange={handleFileChange}
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn-submit-loan">
                            Submit Application
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default LoanApplication;
