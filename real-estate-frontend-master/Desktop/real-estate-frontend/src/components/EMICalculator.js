import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../config';
import './EMICalculator.css';

const EMICalculator = ({ propertyPrice, propertyId, propertyCity }) => {
    // Parse price string to number/default logic
    const parsePrice = (priceStr) => {
        if (!priceStr) return 5000000; // Default 50L
        // Remove non-numeric chars except .
        const num = parseFloat(priceStr.toString().replace(/[^0-9.]/g, ''));
        return isNaN(num) ? 5000000 : num;
    };

    const initialPrincipal = parsePrice(propertyPrice);
    const maxLoanLimit = Math.round(initialPrincipal * 0.9); // 90% of property price

    // State
    const [loanAmount, setLoanAmount] = useState(maxLoanLimit);
    const [interestRate, setInterestRate] = useState(8.5);
    const [tenure, setTenure] = useState(20);
    const [emi, setEmi] = useState(0);
    const [totalInterest, setTotalInterest] = useState(0);
    const [totalAmount, setTotalAmount] = useState(0);
    const [schedule, setSchedule] = useState([]);
    const [showSchedule, setShowSchedule] = useState(false);

    // Fetch dynamic interest rate
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch(`${API_BASE}/api/loans/settings`);
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.homeLoanInterestRate) {
                        setInterestRate(data.homeLoanInterestRate);
                    }
                }
            } catch (err) {
                console.error("Could not fetch loan settings", err);
            }
        };
        fetchSettings();
    }, []);

    // Calculate EMI
    useEffect(() => {
        const principal = loanAmount;
        const ratePerMonth = interestRate / 12 / 100;
        const months = tenure * 12;

        if (principal > 0 && ratePerMonth > 0 && months > 0) {
            const calculatedEmi = (principal * ratePerMonth * Math.pow(1 + ratePerMonth, months)) / (Math.pow(1 + ratePerMonth, months) - 1);
            setEmi(Math.round(calculatedEmi));
            const totalPayment = calculatedEmi * months;
            setTotalAmount(Math.round(totalPayment));
            setTotalInterest(Math.round(totalPayment - principal));

            let sched = [];
            let bal = principal;
            for (let i = 1; i <= months; i++) {
                const interestForMonth = bal * ratePerMonth;
                const principalForMonth = calculatedEmi - interestForMonth;
                bal -= principalForMonth;
                if (bal < 0) bal = 0;
                sched.push({
                    month: i,
                    emi: Math.round(calculatedEmi),
                    principal: Math.round(principalForMonth),
                    interest: Math.round(interestForMonth),
                    balance: Math.round(bal)
                });
            }
            setSchedule(sched);
        } else {
            setEmi(0);
            setTotalAmount(0);
            setTotalInterest(0);
            setSchedule([]);
        }
    }, [loanAmount, interestRate, tenure]);

    const formatCurrency = (val) => {
        return val.toLocaleString('en-IN', {
            maximumFractionDigits: 0,
            style: 'currency',
            currency: 'INR'
        });
    };

    const navigate = useNavigate();

    return (
        <div className="emi-calculator-card">
            <div className="emi-header">
                <h3 className="emi-title">
                    <span>🧮</span> EMI Calculator
                </h3>
            </div>

            <div className="emi-content">
                <div className="emi-inputs">
                    {/* Loan Amount */}
                    <div className="input-group">
                        <div className="input-label-row">
                            <label className="input-label">Loan Amount (Max 90%)</label>
                            <span className="input-value">{formatCurrency(loanAmount)}</span>
                        </div>
                        <input
                            type="range"
                            min="100000"
                            max={maxLoanLimit}
                            step="10000"
                            value={loanAmount}
                            onChange={(e) => setLoanAmount(Number(e.target.value))}
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
                    <div className="emi-monthly-label">Monthly Payment (EMI)</div>
                    <div className="emi-monthly-value">{formatCurrency(emi)}</div>

                    <div className="breakdown-row">
                        <div className="breakdown-item">
                            <span className="breakdown-label">Principal Amount</span>
                            <span className="breakdown-value">{formatCurrency(loanAmount)}</span>
                        </div>
                        <div className="breakdown-item" style={{ textAlign: 'right' }}>
                            <span className="breakdown-label">Total Interest</span>
                            <span className="breakdown-value">{formatCurrency(totalInterest)}</span>
                        </div>
                    </div>

                    <div className="breakdown-row" style={{ marginBottom: '0' }}>
                        <div className="breakdown-item" style={{ width: '100%', textAlign: 'center' }}>
                            <span className="breakdown-label">Total Amount Payable</span>
                            <span className="breakdown-value" style={{ fontSize: '16px', color: '#0078db' }}>
                                {formatCurrency(totalAmount)}
                            </span>
                        </div>
                    </div>

                    <div style={{ display: "flex", gap: "10px" }}>
                        <button
                            className="btn-apply-loan"
                            style={{ flex: 1, backgroundColor: "#fff", color: "#0078db", border: "1px solid #0078db" }}
                            onClick={() => setShowSchedule(true)}
                        >
                            View Schedule
                        </button>
                        <button
                            className="btn-apply-loan"
                            style={{ flex: 2 }}
                            onClick={() => navigate('/loan-application', { state: { loanAmount: loanAmount, propertyId, propertyCity } })}
                        >
                            Apply for Loan
                        </button>
                    </div>

                    {showSchedule && (
                        <div className="modal-overlay" style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", justifyContent: "center", alignItems: "center" }}>
                            <div className="modal-content" style={{ background: "#fff", padding: "20px", borderRadius: "8px", width: "800px", maxWidth: "90%", maxHeight: "80vh", display: "flex", flexDirection: "column" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                                    <h3 style={{ margin: 0 }}>Repayment Schedule</h3>
                                    <button onClick={() => setShowSchedule(false)} style={{ background: "transparent", border: "none", fontSize: "20px", cursor: "pointer" }}>&times;</button>
                                </div>
                                <div style={{ overflowY: "auto", flex: 1 }}>
                                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "right" }}>
                                        <thead>
                                            <tr style={{ background: "#f0f0f0" }}>
                                                <th style={{ padding: "10px", textAlign: "center", borderBottom: "2px solid #ddd" }}>Month</th>
                                                <th style={{ padding: "10px", borderBottom: "2px solid #ddd" }}>Principal (₹)</th>
                                                <th style={{ padding: "10px", borderBottom: "2px solid #ddd" }}>Interest (₹)</th>
                                                <th style={{ padding: "10px", borderBottom: "2px solid #ddd" }}>Total EMI (₹)</th>
                                                <th style={{ padding: "10px", borderBottom: "2px solid #ddd" }}>Balance (₹)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {schedule.map(row => (
                                                <tr key={row.month} style={{ borderBottom: "1px solid #eee" }}>
                                                    <td style={{ padding: "8px", textAlign: "center" }}>{row.month}</td>
                                                    <td style={{ padding: "8px" }}>{formatCurrency(row.principal).replace('₹', '')}</td>
                                                    <td style={{ padding: "8px" }}>{formatCurrency(row.interest).replace('₹', '')}</td>
                                                    <td style={{ padding: "8px", fontWeight: "bold" }}>{formatCurrency(row.emi).replace('₹', '')}</td>
                                                    <td style={{ padding: "8px" }}>{formatCurrency(row.balance).replace('₹', '')}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EMICalculator;
