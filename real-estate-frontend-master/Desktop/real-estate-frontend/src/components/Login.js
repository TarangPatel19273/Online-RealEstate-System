import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import * as authService from "../services/authService";
import "./Auth.css";

function Login() {
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) { navigate("/"); }

    if (location.state?.message) {
      setMessage(location.state.message);
      window.history.replaceState({}, document.title)
    }

    // Load Google Sign-In script
    loadGoogleSignin();
  }, [navigate, location]);

  const loadGoogleSignin = () => {
    // Add Google Sign-In script
    const script = document.createElement("script");
    script.src = "https://apis.google.com/js/platform.js";
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    // Initialize Google Sign-In
    window.onload = () => {
      if (window.gapi) {
        window.gapi.load("auth2", () => {
          window.gapi.auth2.init({
            client_id: "167248250288-n6af1ihtmr6hvcfc1npjdq1d7h0a64u3.apps.googleusercontent.com", // Replace with your Google Client ID
            scope: "profile email",
          });
        });
      }
    };
  };

  const handleGoogleSignIn = (response) => {
    try {
      setGoogleLoading(true);
      const { credential } = response;
      
      if (credential) {
        // Decode the JWT token
        const base64Url = credential.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        const userInfo = JSON.parse(jsonPayload);
        
        console.log("Google User Info:", userInfo);
        setMessage("Logging in with Google...");
        
        // Store user info and token
        localStorage.setItem("token", credential);
        localStorage.setItem("user", JSON.stringify({
          id: userInfo.sub,
          username: userInfo.name,
          email: userInfo.email,
          avatar: userInfo.picture,
          provider: "google"
        }));
        
        setTimeout(() => {
          navigate("/");
        }, 1500);
      }
    } catch (err) {
      console.error("Google Sign-In failed:", err);
      setMessage("Google Sign-In failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleLoginClick = () => {
    // Using Google One Tap or Google Sign-In button
    // This will trigger the credential response
    if (window.google) {
      window.google.accounts.id.renderButton(
        document.getElementById('google-login-button'),
        { 
          type: 'standard', 
          theme: 'outline', 
          size: 'large',
          width: '100%'
        }
      );
      
      // Set up the callback
      window.google.accounts.id.initialize({
        client_id: "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com",
        callback: handleGoogleSignIn,
      });
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
      navigate("/");
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

          <div className="social-login">
            <button 
              type="button" 
              className="social-button google"
              onClick={handleGoogleLoginClick}
              disabled={googleLoading}
            >
              <svg className="social-icon" viewBox="0 0 24 24" width="20" height="20">
                <path fill="currentColor" d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032 c0-3.331,2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.461,2.268,15.365,1.25,12.545,1.25 c-6.343,0-11.5,5.157-11.5,11.5c0,6.343,5.157,11.5,11.5,11.5c6.343,0,11.5-5.157,11.5-11.5c0-0.468-0.033-0.94-0.112-1.39H12.545z"/>
              </svg>
              <span>{googleLoading ? "Signing in..." : "Sign in with Google"}</span>
            </button>
          </div>

          <div className="form-footer">
            <p>Don't have an account? <span className="link" onClick={() => navigate("/signup")}>Sign up</span></p>
          </div>
        </div>
      </div>

      <script src="https://accounts.google.com/gsi/client" async defer></script>
    </div>
  );
}

export default Login;
