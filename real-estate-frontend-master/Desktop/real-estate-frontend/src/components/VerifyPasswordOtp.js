import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as authService from "../services/authService";
import "./VerifyOtp.css";

function VerifyPasswordOtp() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const inputRefs = useRef([]);

  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;
  const isPasswordReset = location.state?.isPasswordReset;

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  if (!email) {
    return (
      <div className="auth-page-modern">
        <div className="auth-illustration">
          <div className="illustration-content">
            <div className="illustration-icon">🏠</div>
            <h1 className="illustration-title">EstateHub</h1>
            <p className="illustration-subtitle">Your trusted real estate partner</p>
          </div>
        </div>
        <div className="auth-form-section">
          <div className="form-container">
            <p style={{ textAlign: "center", color: "#dc3545", fontSize: "1rem" }}>Invalid access. Please try again.</p>
            <button className="submit-button" onClick={() => navigate(isPasswordReset ? "/forgot-password" : "/signup")}>
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleOtpChange = (index, value) => {
    setError("");
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      setError("Please enter a 6-digit OTP");
      return;
    }

    try {
      setLoading(true);
      setError("");

      if (isPasswordReset) {
        // Verify OTP for password reset
        await authService.verifyPasswordResetOtp(email, otpCode);
        
        setMessage("OTP verified successfully!");
        
        // Navigate to password reset page
        setTimeout(() => {
          navigate("/reset-password", { state: { email, otp: otpCode } });
        }, 1000);
      } else {
        // Original OTP verification for signup
        await authService.verifyOtp(email, otpCode);

        // Navigate to login page after successful verification
        navigate("/login", { state: { message: "Account verified successfully! Please login." } });
      }
    } catch (err) {
      setError(err.response?.data || "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setResendTimer(30);
      setMessage("OTP resent successfully!");
      
      if (isPasswordReset) {
        await authService.forgotPassword(email);
      }
    } catch (err) {
      setError("Failed to resend OTP");
    }
  };

  return (
    <div className="auth-page-modern">
      {/* Left Side - Illustration */}
      <div className="auth-illustration">
        <div className="illustration-content">
          <div className="illustration-icon">🔐</div>
          <h1 className="illustration-title">EstateHub</h1>
          <p className="illustration-subtitle">Your trusted real estate partner</p>
          
          <div className="feature-list">
            <div className="feature-item">
              <span className="feature-icon">✨</span>
              <span className="feature-text">Find your dream property</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">💼</span>
              <span className="feature-text">Expert guidance</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🔒</span>
              <span className="feature-text">Secure transactions</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">⚡</span>
              <span className="feature-text">Fast & reliable</span>
            </div>
          </div>

          <div className="illustration-stats">
            <div className="stat">
              <div className="stat-number">10K+</div>
              <div className="stat-label">Properties</div>
            </div>
            <div className="stat">
              <div className="stat-number">5K+</div>
              <div className="stat-label">Happy Users</div>
            </div>
            <div className="stat">
              <div className="stat-number">24/7</div>
              <div className="stat-label">Support</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="auth-form-section">
        <div className="form-container">
          <button 
            className="back-button"
            onClick={() => navigate(isPasswordReset ? "/forgot-password" : "/signup")}
            style={{
              background: "none",
              border: "none",
              color: "#0066cc",
              cursor: "pointer",
              fontSize: "0.9rem",
              marginBottom: "1rem",
              textDecoration: "underline"
            }}
          >
            ← Back
          </button>

          <div className="form-header">
            <h2 className="form-title">Verify OTP</h2>
            <p className="form-subtitle">Enter the 6-digit OTP sent to {email}</p>
          </div>

          <div className="otp-container">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                maxLength="1"
                className="otp-input"
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                disabled={loading}
              />
            ))}
          </div>

          <button 
            type="button"
            className="submit-button"
            onClick={handleVerifyOtp}
            disabled={loading}
            style={{ marginTop: "2rem" }}
          >
            <div className="button-content">
              {loading ? (
                <>
                  <div className="spinner"></div>
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <span>Verify OTP</span>
                  <span className="button-arrow">→</span>
                </>
              )}
            </div>
          </button>

          {error && (
            <div className="form-message error" style={{ marginTop: "1rem" }}>
              <span className="message-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="form-message success" style={{ marginTop: "1rem" }}>
              <span className="message-icon">✅</span>
              <span>{message}</span>
            </div>
          )}

          <div className="resend-section" style={{ marginTop: "2rem", textAlign: "center" }}>
            <p style={{ color: "#666", marginBottom: "1rem" }}>Didn't receive the OTP?</p>
            <button
              type="button"
              onClick={handleResend}
              disabled={resendTimer > 0 || loading}
              style={{
                background: "none",
                border: "none",
                color: resendTimer > 0 ? "#999" : "#0066cc",
                cursor: resendTimer > 0 ? "not-allowed" : "pointer",
                fontSize: "0.9rem",
                textDecoration: "underline",
                fontWeight: "500"
              }}
            >
              {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerifyPasswordOtp;
