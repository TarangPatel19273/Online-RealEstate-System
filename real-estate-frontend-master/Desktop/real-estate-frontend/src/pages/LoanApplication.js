import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
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
        message: ""
    });
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        // Pre-fill loan amount if passed from EMI Calculator
        if (location.state && location.state.loanAmount) {
            setFormData(prev => ({
                ...prev,
                loanAmount: location.state.loanAmount
            }));
        }
    }, [location.state]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Mock submission
        console.log("Loan Application Submitted:", formData);
        setSubmitted(true);
        setTimeout(() => {
            navigate("/");
        }, 3000);
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
