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
      <div className="auth-page">
        <div className="auth-container">
          <p style={{ textAlign: "center", color: "#dc3545" }}>Invalid access</p>
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

      await authService.verifyOtp(email, otpCode);

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
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <div className="auth-icon">🔐</div>
          <h2>Verify OTP</h2>
          <p className="auth-subtitle">
            Enter the 6-digit code sent to <br />
            <span className="email-highlight">{email}</span>
          </p>
        </div>

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
            />
          ))}
        </div>

        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}

        <button
          onClick={handleVerifyOtp}
          disabled={loading || otpCode.length !== 6}
          className={`auth-button ${loading ? "loading" : ""}`}
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              Verifying...
            </>
          ) : (
            "Verify OTP"
          )}
        </button>

        <div className="resend-container">
          <p>
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
      </div>
    </div>
  );
}

export default VerifyOtp;
