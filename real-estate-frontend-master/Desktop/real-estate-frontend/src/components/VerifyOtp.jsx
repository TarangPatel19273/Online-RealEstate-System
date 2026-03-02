import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as authService from "../services/authService";
import "./VerifyOtp.css";

function VerifyOtp() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const inputRefs = useRef([]);

  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;
  const isAdmin = location.state?.isAdmin;

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
            <p style={{ textAlign: "center", color: "#dc3545", fontSize: "1rem" }}>Invalid access. Please sign up again.</p>
            <button className="submit-button" onClick={() => navigate("/signup")}>
              Go Back to Sign Up
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

      await authService.verifyOtp(email, otpCode, isAdmin);

      // Navigate to login page after successful verification
      navigate("/login", { state: { message: "Account verified successfully! Please login." } });
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
      // Call your resend OTP API here if needed
    } catch (err) {
      setError("Failed to resend OTP");
    }
  };

  const otpCode = otp.join("");

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
          <div className="form-header">
            <h2 className="form-title">Verify Email</h2>
            <p className="form-subtitle">
              Enter the 6-digit code sent to<br />
              <span className="email-highlight">{email}</span>
            </p>
          </div>

          <div className="otp-section">
            <div className="otp-input-group">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="otp-input"
                  placeholder="•"
                  inputMode="numeric"
                />
              ))}
            </div>

            {error && (
              <div className="form-message error">
                <span className="message-icon">⚠️</span>
                <span>{error}</span>
              </div>
            )}
            {message && (
              <div className="form-message success">
                <span className="message-icon">✅</span>
                <span>{message}</span>
              </div>
            )}

            <button
              onClick={handleVerifyOtp}
              disabled={loading || otpCode.length !== 6}
              className="submit-button"
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
          </div>

          <div className="resend-section">
            <p className="resend-text">
              Didn't receive the code?{" "}
              {resendTimer > 0 ? (
                <span className="resend-timer">Resend in {resendTimer}s</span>
              ) : (
                <button
                  onClick={handleResend}
                  className="resend-button"
                >
                  Resend OTP
                </button>
              )}
            </p>
          </div>

          <div className="form-footer">
            <p>
              Need help? <span className="link" onClick={() => navigate("/signup")}>Back to Sign Up</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerifyOtp;
