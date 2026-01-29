import React, { useState, useEffect } from "react";
import { signup } from "../services/authService";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

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
      <div className="auth-container">
        <div className="auth-header">
          <div className="auth-icon"></div>
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-subtitle">Join us and start your property journey</p>
        </div>
        <form className="auth-form" onSubmit={(e) => { e.preventDefault(); handleSignup(); }}>
          <div className="input-group">
            <label className="input-label"><span className="label-icon"></span> Username</label>
            <div className="input-wrapper">
              <input type="text" className="auth-input" placeholder="Choose a username" value={username} onChange={(e) => setUsername(e.target.value)} />
              <span className="input-icon"></span>
            </div>
          </div>
          <div className="input-group">
            <label className="input-label"><span className="label-icon"></span> Email</label>
            <div className="input-wrapper">
              <input type="email" className="auth-input" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <span className="input-icon"></span>
            </div>
          </div>
          <div className="input-group">
            <label className="input-label"><span className="label-icon"></span> Password</label>
            <div className="input-wrapper">
              <input type="password" className="auth-input" placeholder="Create a strong password" value={password} onChange={(e) => setPassword(e.target.value)} />
              <span className="input-icon"></span>
            </div>
          </div>
          <button type="submit" className="auth-button" disabled={loading}>
            <div className="button-content">
              {loading ? (<><div className="loading-spinner"></div><span>Creating Account...</span></>) : (<><span className="button-icon"></span><span>Sign Up</span></>)}
            </div>
          </button>
        </form>
        {message && (
          <div className={`auth-message ${message.includes("OTP") ? "success" : "error"}`}>
            <span className="message-icon">{message.includes("OTP") ? "✅" : "⚠️"}</span>
            <span>{message}</span>
          </div>
        )}
        <div className="auth-footer">
          <p className="auth-footer-text">Already have an account?</p>
          <span className="auth-link" onClick={() => navigate("/login")}>Login Here <span className="link-arrow"></span></span>
        </div>
      </div>
    </div>
  );
}
export default Signup;
