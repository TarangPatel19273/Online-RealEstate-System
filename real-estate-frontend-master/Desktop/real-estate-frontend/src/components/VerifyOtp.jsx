import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./VerifyOtp.css";
import "./Auth.css"; // Ensure we import the main Auth styles
import AuthImage from "../assets/auth-bg.png";

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
        <div className="auth-container" style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: "#b91c1c", marginBottom: '20px' }}>Invalid access. No email provided.</p>
          <button className="auth-button" onClick={() => navigate('/login')}>Go to Login</button>
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

      await axios.post(
        "http://localhost:8080/api/auth/verify-otp",
        { email, otp: otpCode }
      );

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
      // await axios.post("...", { email });
    } catch (err) {
      setError("Failed to resend OTP");
    }
  };

  const otpCode = otp.join("");

  return (
    <div className="auth-page">
      {/* Left Side - Image */}
      <div className="auth-image-side">
        <img src={AuthImage} alt="Luxury Real Estate" />
        <div className="auth-overlay">
          <div className="overlay-content">
            <h1>Secure Your <br />Account.</h1>
            <p>Two-factor authentication adds an extra layer of security to your real estate investments.</p>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="auth-form-side">
        <div className="auth-container">
          <div className="auth-header">
            <Link to="/" className="auth-logo">RealEstate.</Link>
            <h2 className="auth-title">Verify OTP</h2>
            <p className="auth-subtitle">
              Enter the 6-digit code sent to <br />
              <span style={{ color: '#0078db', fontWeight: '600' }}>{email}</span>
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

          {error && (
            <div className="auth-message error" style={{ marginBottom: '20px', marginTop: '0' }}>
              <span className="message-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}
          {message && (
            <div className="auth-message success" style={{ marginBottom: '20px', marginTop: '0' }}>
              <span className="message-icon">✅</span>
              <span>{message}</span>
            </div>
          )}

          <button
            onClick={handleVerifyOtp}
            disabled={loading || otpCode.length !== 6}
            className="auth-button"
          >
            {loading ? (
              <>
                <div className="loading-spinner"></div>
                <span>Verifying...</span>
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
    </div>
  );
}

export default VerifyOtp;
