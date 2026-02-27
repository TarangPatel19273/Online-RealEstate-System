import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as authService from "../services/authService";
import "./Auth.css";

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("");

  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;
  const otp = location.state?.otp;

  if (!email || !otp) {
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
            <button className="submit-button" onClick={() => navigate("/forgot-password")}>
              Go Back to Password Reset
            </button>
          </div>
        </div>
      </div>
    );
  }

  const checkPasswordStrength = (pwd) => {
    if (!pwd) {
      setPasswordStrength("");
      return;
    }

    if (pwd.length < 8) {
      setPasswordStrength("weak");
    } else if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) {
      setPasswordStrength("strong");
    } else if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) {
      setPasswordStrength("medium");
    } else {
      setPasswordStrength("weak");
    }
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    checkPasswordStrength(newPassword);
  };

  const handleResetPassword = async () => {
    // Validation
    if (!password || !confirmPassword) {
      setMessage("All fields are required");
      return;
    }

    if (password.length < 8) {
      setMessage("Password must be at least 8 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      // Call the reset password API
      await authService.resetPassword(email, otp, password);

      setMessage("Password reset successfully!");
      
      // Navigate to login page after successful password reset
      setTimeout(() => {
        navigate("/login", { state: { message: "Password reset successfully! Please login with your new password." } });
      }, 1500);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to reset password. Please try again.");
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
            onClick={() => navigate("/forgot-password")}
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
            <h2 className="form-title">Set New Password</h2>
            <p className="form-subtitle">Create a strong password for your account</p>
          </div>

          <form 
            className="auth-form" 
            onSubmit={(e) => { e.preventDefault(); handleResetPassword(); }}
          >
            {/* New Password */}
            <div className="form-group">
              <label className="form-label">New Password</label>
              <div className="input-field">
                <span className="input-icon-left">🔒</span>
                <input 
                  type={showPassword ? "text" : "password"}
                  className="form-input" 
                  placeholder="Enter your new password" 
                  value={password} 
                  onChange={handlePasswordChange}
                  disabled={loading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {passwordStrength && (
                <div className="password-strength" style={{ marginTop: "0.5rem" }}>
                  <div style={{ fontSize: "0.8rem", marginBottom: "0.25rem" }}>
                    Strength: 
                    <span style={{
                      marginLeft: "0.5rem",
                      fontWeight: "bold",
                      color: passwordStrength === "strong" ? "#28a745" : 
                             passwordStrength === "medium" ? "#ffc107" : "#dc3545"
                    }}>
                      {passwordStrength.charAt(0).toUpperCase() + passwordStrength.slice(1)}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: "0.25rem" }}>
                    <div style={{
                      height: "4px",
                      flex: 1,
                      backgroundColor: passwordStrength ? "#dc3545" : "#ddd",
                      borderRadius: "2px"
                    }} />
                    <div style={{
                      height: "4px",
                      flex: 1,
                      backgroundColor: passwordStrength === "strong" || passwordStrength === "medium" ? "#ffc107" : "#ddd",
                      borderRadius: "2px"
                    }} />
                    <div style={{
                      height: "4px",
                      flex: 1,
                      backgroundColor: passwordStrength === "strong" ? "#28a745" : "#ddd",
                      borderRadius: "2px"
                    }} />
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#666", marginTop: "0.5rem" }}>
                    {password.length < 8 && "At least 8 characters"}
                    {password.length >= 8 && !/[A-Z]/.test(password) && "Add uppercase letters"}
                    {password.length >= 8 && /[A-Z]/.test(password) && !/[0-9]/.test(password) && "Add numbers"}
                    {password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password) && "✓ Strong password"}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div className="input-field">
                <span className="input-icon-left">🔒</span>
                <input 
                  type={showConfirmPassword ? "text" : "password"}
                  className="form-input" 
                  placeholder="Confirm your password" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                >
                  {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              
              {/* Password Match Indicator */}
              {confirmPassword && (
                <div style={{ fontSize: "0.85rem", marginTop: "0.5rem", color: password === confirmPassword ? "#28a745" : "#dc3545" }}>
                  {password === confirmPassword ? "✓ Passwords match" : "✗ Passwords do not match"}
                </div>
              )}
            </div>

            <button type="submit" className="submit-button" disabled={loading}>
              <div className="button-content">
                {loading ? (
                  <>
                    <div className="spinner"></div>
                    <span>Resetting...</span>
                  </>
                ) : (
                  <>
                    <span>Reset Password</span>
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

export default ResetPassword;
