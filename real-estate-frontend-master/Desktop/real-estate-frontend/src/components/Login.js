import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import * as authService from "../services/authService";
import "./Auth.css";

/**
 * Login Component
 * 
 * Handles user authentication via standard email/username credentials
 * or through Google OAuth 2.0. Upon successful login, it stores the
 * JWT token in localStorage and redirects the user to the appropriate
 * dashboard based on their role (Admin vs Standard User).
 */
function Login() {
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) { navigate("/"); }

    if (location.state?.message) {
      setMessage(location.state.message);
      window.history.replaceState({}, document.title)
    }

    // Initialize Google Sign-In when SDK is loaded
    let initGoogle;
    const renderGoogleButton = () => {
      initGoogle = setInterval(() => {
        const buttonEle = document.getElementById('google-login-button');
        if (window.google && window.google.accounts && buttonEle) {
          clearInterval(initGoogle);
          
          if (!window.googleGsiInitialized) {
            window.google.accounts.id.initialize({
              client_id: "167248250288-n6af1ihtmr6hvcfc1npjdq1d7h0a64u3.apps.googleusercontent.com",
              callback: (response) => {
                if (window.handleGoogleAuthCallback) {
                  window.handleGoogleAuthCallback(response);
                }
              },
            });
            window.googleGsiInitialized = true;
          }
          window.handleGoogleAuthCallback = handleGoogleSignIn;

          window.google.accounts.id.renderButton(
            buttonEle,
            { theme: 'outline', size: 'large', width: '300px' }
          );
        }
      }, 100);
    };

    const loadGoogleScript = () => {
      if (document.getElementById('google-gsi-client')) {
        renderGoogleButton();
        return;
      }
      const script = document.createElement('script');
      script.id = 'google-gsi-client';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);

      script.onload = renderGoogleButton;
    };

    loadGoogleScript();

    return () => {
      if (initGoogle) clearInterval(initGoogle);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, location]);

  const handleGoogleSignIn = async (response) => {
    try {
      const { credential } = response;

      if (credential) {
        setMessage("Logging in with Google...");
        const res = await authService.googleLogin(credential);
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));

        navigate("/");
      }
    } catch (err) {
      console.error("Google Sign-In failed:", err);
      setMessage(typeof err.response?.data === "string" ? err.response.data : "Google Sign-In failed. Please try again.");
    }
  };


  const handleLogin = async () => {
    if (!usernameOrEmail || !password) {
      setMessage("All fields are required");
      return;
    }
    try {
      setLoading(true);
      setMessage("");
      const res = await authService.login({ usernameOrEmail, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      if (res.data.user.role === 'ADMIN') {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (err) {
      setMessage(typeof err.response?.data === "string" ? err.response.data : "Login failed");
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
          <div className="form-header">
            <h2 className="form-title">Welcome Back</h2>
            <p className="form-subtitle">Login to continue exploring properties</p>
          </div>

          <form className="auth-form" onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
            <div className="form-group">
              <label className="form-label">Email or Username</label>
              <div className="input-field">
                <span className="input-icon-left">👤</span>
                <input
                  type="text"
                  className="form-input"
                  placeholder="john@example.com or johndoe"
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-field">
                <span className="input-icon-left">🔒</span>
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <div className="form-options">
              <label className="remember-me">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
            </div>

            <div className="form-options" style={{ marginTop: '10px' }}>
              <button
                type="button"
                className="forgot-link"
                onClick={() => navigate("/forgot-password")}
                style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: "#0066cc", textDecoration: "underline" }}
              >
                Forgot password?
              </button>
            </div>

            <button type="submit" className="submit-button" disabled={loading}>
              <div className="button-content">
                {loading ? (
                  <>
                    <div className="spinner"></div>
                    <span>Logging in...</span>
                  </>
                ) : (
                  <>
                    <span>Login</span>
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

          <div className="divider">
            <span>or continue with</span>
          </div>

          <div className="social-login" style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
            <div id="google-login-button"></div>
          </div>

          <div className="form-footer">
            <p>Don't have an account? <span className="link" onClick={() => navigate("/signup")}>Sign up</span></p>
          </div>
        </div>
      </div>

    </div>
  );
}

export default Login;
