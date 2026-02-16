import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import './EMICalculator.css'; // Reusing styles for consistency
import { useNavigate } from 'react-router-dom';

const BudgetCalculator = () => {
    const navigate = useNavigate();
    const [monthlyIncome, setMonthlyIncome] = useState(50000);
    const [monthlyExpenses, setMonthlyExpenses] = useState(20000);
    const [interestRate, setInterestRate] = useState(8.5);
    const [tenure, setTenure] = useState(20);
    const [maxLoanAmount, setMaxLoanAmount] = useState(0);
    const [estimatedPropertyPrice, setEstimatedPropertyPrice] = useState(0);

    useEffect(() => {
        // Simple logic: Max EMI can be 50% of (Income - Expenses)
        const disposableIncome = monthlyIncome - monthlyExpenses;
        const maxEmi = disposableIncome * 0.5;

        // Calculate Max Loan Amount based on EMI, Rate, Tenure
        // EMI = [P x R x (1+R)^N]/[(1+R)^N-1]
        // P = [EMI x ((1+R)^N-1)] / [R x (1+R)^N]

        const r = interestRate / 12 / 100;
        const n = tenure * 12;

        if (maxEmi > 0 && r > 0 && n > 0) {
            const principal = (maxEmi * (Math.pow(1 + r, n) - 1)) / (r * Math.pow(1 + r, n));
            setMaxLoanAmount(Math.round(principal));
            // Assuming 10% down payment, Loan covers 90% (Government Property Price norm)
            setEstimatedPropertyPrice(Math.round(principal / 0.9));
        } else {
            setMaxLoanAmount(0);
            setEstimatedPropertyPrice(0);
        }

    }, [monthlyIncome, monthlyExpenses, interestRate, tenure]);

    const formatCurrency = (val) => {
        return val.toLocaleString('en-IN', {
            maximumFractionDigits: 0,
            style: 'currency',
            currency: 'INR'
        });
    };

    return (
        <div style={{ background: "#f5f7fa", minHeight: "100vh" }}>
            <Navbar />
            <div style={{ maxWidth: "800px", margin: "40px auto", padding: "0 20px" }}>
                <div className="emi-calculator-card">
                    <div className="emi-header">
                        <h3 className="emi-title">
                            <span>💰</span> Property Budget Calculator
                        </h3>
                        <p style={{ color: "#666", marginTop: "5px" }}>Evaluate how much you can afford to borrow</p>
                    </div>

                    <div className="emi-content">
                        <div className="emi-inputs">
                            {/* Monthly Income */}
                            <div className="input-group">
                                <div className="input-label-row">
                                    <label className="input-label">Monthly Income</label>
                                    <span className="input-value">{formatCurrency(monthlyIncome)}</span>
                                </div>
                                <input
                                    type="range"
                                    min="10000"
                                    max="500000"
                                    step="1000"
                                    value={monthlyIncome}
                                    onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                                    className="slider"
                                />
                            </div>

                            {/* Monthly Expenses */}
                            <div className="input-group">
                                <div className="input-label-row">
                                    <label className="input-label">Monthly Expenses</label>
                                    <span className="input-value">{formatCurrency(monthlyExpenses)}</span>
                                </div>
                                <input
                                    type="range"
                                    min="5000"
                                    max="200000"
                                    step="1000"
                                    value={monthlyExpenses}
                                    onChange={(e) => setMonthlyExpenses(Number(e.target.value))}
                                    className="slider"
                                />
                            </div>

                            {/* Interest Rate */}
                            <div className="input-group">
                                <div className="input-label-row">
                                    <label className="input-label">Interest Rate (% p.a)</label>
                                    <span className="input-value">{interestRate}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="1"
                                    max="20"
                                    step="0.1"
                                    value={interestRate}
                                    onChange={(e) => setInterestRate(Number(e.target.value))}
                                    className="slider"
                                />
                            </div>

                            {/* Tenure */}
                            <div className="input-group">
                                <div className="input-label-row">
                                    <label className="input-label">Loan Tenure (Years)</label>
                                    <span className="input-value">{tenure} Years</span>
                                </div>
                                <input
                                    type="range"
                                    min="1"
                                    max="30"
                                    step="1"
                                    value={tenure}
                                    onChange={(e) => setTenure(Number(e.target.value))}
                                    className="slider"
                                />
                            </div>
                        </div>

                        <div className="emi-result-section">
                            <div className="emi-monthly-label">You can afford a property around</div>
                            <div className="emi-monthly-value" style={{ color: "#28a745" }}>{formatCurrency(estimatedPropertyPrice)}</div>

                            <div className="breakdown-row">
                                <div className="breakdown-item" style={{ width: '100%', textAlign: 'center' }}>
                                    <span className="breakdown-label">Max Loan Amount Eligible</span>
                                    <span className="breakdown-value">{formatCurrency(maxLoanAmount)}</span>
                                </div>
                            </div>

                            <div style={{ marginTop: "20px", fontSize: "14px", color: "#666", textAlign: "center" }}>
                                *Estimates based on 50% of disposable income used for EMI and 10% down payment.
                            </div>

                            <button
                                className="btn-apply-loan"
                                style={{ marginTop: "20px" }}
                                onClick={() => navigate('/loan-application', { state: { loanAmount: maxLoanAmount } })}
                            >
                                Apply for Loan Now
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BudgetCalculator;
