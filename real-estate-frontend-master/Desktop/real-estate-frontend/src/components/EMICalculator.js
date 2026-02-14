import React, { useState, useEffect } from 'react';
import './EMICalculator.css';

const EMICalculator = ({ propertyPrice }) => {
    // Parse price string to number/default logic
    const parsePrice = (priceStr) => {
        if (!priceStr) return 5000000; // Default 50L
        // Remove non-numeric chars except .
        const num = parseFloat(priceStr.toString().replace(/[^0-9.]/g, ''));
        return isNaN(num) ? 5000000 : num;
    };

    const initialPrincipal = parsePrice(propertyPrice);

    // State
    const [loanAmount, setLoanAmount] = useState(initialPrincipal);
    const [interestRate, setInterestRate] = useState(8.5);
    const [tenure, setTenure] = useState(20);
    const [emi, setEmi] = useState(0);
    const [totalInterest, setTotalInterest] = useState(0);
    const [totalAmount, setTotalAmount] = useState(0);

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
        } else {
            setEmi(0);
            setTotalAmount(0);
            setTotalInterest(0);
        }
    }, [loanAmount, interestRate, tenure]);

    const formatCurrency = (val) => {
        return val.toLocaleString('en-IN', {
            maximumFractionDigits: 0,
            style: 'currency',
            currency: 'INR'
        });
    };

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
                            <label className="input-label">Loan Amount</label>
                            <span className="input-value">{formatCurrency(loanAmount)}</span>
                        </div>
                        <input
                            type="range"
                            min="100000"
                            max="50000000"
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

                    <button className="btn-apply-loan" onClick={() => alert('Feature coming soon: Apply for home loan partners')}>
                        Apply for Loan
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EMICalculator;
