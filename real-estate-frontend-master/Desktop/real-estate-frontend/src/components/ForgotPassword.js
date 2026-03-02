import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as authService from "../services/authService";
import "./Auth.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSendOtp = async () => {
    if (!email) {
      setMessage("Please enter your email address");
      return;
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      // Call the forgot password API
      await authService.forgotPassword(email);

      setIsSubmitted(true);
      setMessage("OTP sent successfully! Please check your email.");

      // Navigate to verify OTP page for password reset
      setTimeout(() => {
        navigate("/verify-password-otp", { state: { email, isPasswordReset: true } });
      }, 1500);
    } catch (err) {
      if (typeof err.response?.data === "string") {
        setMessage(err.response.data);
      } else {
        setMessage(err.response?.data?.message || "Failed to send OTP. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-modern">
      {/* Left Side - Illustration */}
      <div className="auth-illustration">
        <div className="illustration-content">
          <div className="illustration-icon">🏠</div>
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
            onClick={() => navigate("/login")}
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
            ← Back to Login
          </button>

          <div className="form-header">
            <h2 className="form-title">Forgot Password?</h2>
            <p className="form-subtitle">Enter your email address to reset your password</p>
          </div>

          <form
            className="auth-form"
            onSubmit={(e) => { e.preventDefault(); handleSendOtp(); }}
          >
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-field">
                <span className="input-icon-left">✉️</span>
                <input
                  type="email"
                  className="form-input"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  autoComplete="email"
                />
              </div>
            </div>

            <button
              type="submit"
              className="submit-button"
              disabled={loading}
            >
              <div className="button-content">
                {loading ? (
                  <>
                    <div className="spinner"></div>
                    <span>Sending OTP...</span>
                  </>
                ) : (
                  <>
                    <span>Send OTP</span>
                    <span className="button-arrow">→</span>
                  </>
                )}
              </div>
            </button>
          </form>

          {message && (
            <div className={`form-message ${message.toLowerCase().includes("success") ? "success" : "error"}`}>
              <span className="message-icon">{message.toLowerCase().includes("success") ? "✅" : "⚠️"}</span>
              <span>{message}</span>
            </div>
          )}

          <div className="form-footer">
            <p>Remember your password? <span className="link" onClick={() => navigate("/login")}>Login</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
