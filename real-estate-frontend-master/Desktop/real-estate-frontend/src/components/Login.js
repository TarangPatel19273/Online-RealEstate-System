import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import "./Auth.css";

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
      // Clear state so message doesn't persist on refresh or subsequent navigations? 
      // React router state persists on refresh, but let's leave it simple.
      // We could clear it, but modifying location state is tricky without navigation.
      // If we navigate replace option, we can clear it.
      // But let's just show it.
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
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/");
    } catch (err) {
      setMessage(typeof err.response?.data === "string" ? err.response.data : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <div className="auth-icon">🔐</div>
          <h2 className="auth-title">Welcome Back!</h2>
          <p className="auth-subtitle">Login to access your properties</p>
        </div>
        <form className="auth-form" onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
          <div className="input-group">
            <label className="input-label"><span className="label-icon">👤</span> Email or Username</label>
            <div className="input-wrapper">
              <input type="text" className="auth-input" placeholder="Enter your email or username" value={usernameOrEmail} onChange={(e) => setUsernameOrEmail(e.target.value)} />
              <span className="input-icon">📧</span>
            </div>
          </div>
          <div className="input-group">
            <label className="input-label"><span className="label-icon">🔒</span> Password</label>
            <div className="input-wrapper">
              <input type="password" className="auth-input" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} />
              <span className="input-icon">🔑</span>
            </div>
          </div>
          <button type="submit" className="auth-button" disabled={loading}>
            <div className="button-content">
              {loading ? (<><div className="loading-spinner"></div><span>Logging in...</span></>) : (<><span className="button-icon">🚀</span><span>Login</span></>)}
            </div>
          </button>
        </form>
        {message && (
          <div className={`auth-message ${message.toLowerCase().includes("success") || message.toLowerCase().includes("verified") ? "success" : "error"}`}>
            <span className="message-icon">{message.toLowerCase().includes("success") || message.toLowerCase().includes("verified") ? "✅" : "⚠️"}</span>
            <span>{message}</span>
          </div>
        )}
        <div className="auth-footer">
          <p className="auth-footer-text">Don't have an account?</p>
          <span className="auth-link" onClick={() => navigate("/signup")}>Create Account <span className="link-arrow">→</span></span>
        </div>
      </div>
    </div>
  );
}
export default Login;
