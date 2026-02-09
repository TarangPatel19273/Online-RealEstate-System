import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation, Link } from "react-router-dom";
import "./Auth.css";
import AuthImage from "../assets/auth-bg.png"; // Make sure this path is correct

function Login() {
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) { navigate("/"); }

    if (location.state?.message) {
      setMessage(location.state.message);
      window.history.replaceState({}, document.title)
    }
  }, [navigate, location]);

  const handleLogin = async () => {
    if (!usernameOrEmail || !password) {
      setMessage("All fields are required");
      return;
    }
    try {
      setLoading(true);
      setMessage("");
      const res = await axios.post("http://localhost:8080/api/auth/login", { usernameOrEmail, password });
      console.log("Login successful, response:", res.data);
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        console.log("Token set, navigating to home...");
        navigate("/");
      } else {
        console.error("No token received in login response");
        setMessage("Login failed: No token received");
      }
    } catch (err) {
      console.error("Login error:", err);
      setMessage(typeof err.response?.data === "string" ? err.response.data : "Login failed");
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
            <h1>Find Your <br />Dream Home.</h1>
            <p>Access thousands of premium properties and real estate opportunities with just one click.</p>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="auth-form-side">
        <div className="auth-container">
          <div className="auth-header">
            <Link to="/" className="auth-logo">RealEstate.</Link>
            <h2 className="auth-title">Welcome Back</h2>
            <p className="auth-subtitle">Please enter your details to sign in.</p>
          </div>

          <form className="auth-form" onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
            <div className="input-group">
              <label className="input-label">Username or Email</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  className="auth-input"
                  placeholder="Enter your username or email"
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                />
                <span className="input-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
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
                  placeholder="••••••••"
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
                  <span>Signing in...</span>
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {message && (
            <div className={`auth-message ${message.toLowerCase().includes("success") || message.toLowerCase().includes("verified") ? "success" : "error"}`}>
              <span className="message-icon">
                {message.toLowerCase().includes("success") || message.toLowerCase().includes("verified") ? (
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
            <p className="auth-footer-text">Don't have an account?
              <span className="auth-link" onClick={() => navigate("/signup")}>Create Account</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Login;
