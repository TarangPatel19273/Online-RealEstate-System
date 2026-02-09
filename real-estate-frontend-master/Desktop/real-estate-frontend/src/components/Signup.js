import React, { useState, useEffect } from "react";
import { signup } from "../services/authService";
import { useNavigate, Link } from "react-router-dom";
import "./Auth.css";
import AuthImage from "../assets/auth-bg.png";

function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) { navigate("/"); }
  }, [navigate]);

  const handleSignup = async () => {
    if (!username || !email || !password) {
      setMessage("All fields are required");
      return;
    }
    try {
      setLoading(true);
      setMessage("");
      const res = await signup({ username, email, password });
      setMessage(res.data);
      navigate("/verify-otp", { state: { email } });
    } catch (err) {
      console.error(err);
      if (typeof err.response?.data === "string") {
        setMessage(err.response.data);
      } else if (err.response?.data?.error) {
        setMessage(err.response.data.error);
      } else {
        setMessage("Signup failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Left Side - Image */}
      <div className="auth-image-side">
        <img src={AuthImage} alt="Luxury Real Estate" />
        <div className="auth-overlay">
          <div className="overlay-content">
            <h1>Join Our <br />Community.</h1>
            <p>Create an account to start your journey in finding the perfect property investment.</p>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="auth-form-side">
        <div className="auth-container">
          <div className="auth-header">
            <Link to="/" className="auth-logo">RealEstate.</Link>
            <h2 className="auth-title">Create Account</h2>
            <p className="auth-subtitle">Sign up to get started.</p>
          </div>

          <form className="auth-form" onSubmit={(e) => { e.preventDefault(); handleSignup(); }}>
            <div className="input-group">
              <label className="input-label">Username</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  className="auth-input"
                  placeholder="Choose a username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <span className="input-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </span>
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Email</label>
              <div className="input-wrapper">
                <input
                  type="email"
                  className="auth-input"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <span className="input-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </span>
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Password</label>
              <div className="input-wrapper">
                <input
                  type="password"
                  className="auth-input"
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <span className="input-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                </span>
              </div>
            </div>

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? (
                <>
                  <div className="loading-spinner"></div>
                  <span>Creating Account...</span>
                </>
              ) : (
                "Sign Up"
              )}
            </button>
          </form>

          {message && (
            <div className={`auth-message ${message.includes("OTP") ? "success" : "error"}`}>
              <span className="message-icon">
                {message.includes("OTP") ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '20px', height: '20px' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '20px', height: '20px' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                )}
              </span>
              <span>{message}</span>
            </div>
          )}

          <div className="auth-footer">
            <p className="auth-footer-text">Already have an account?
              <span className="auth-link" onClick={() => navigate("/login")}>Login Here</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Signup;
