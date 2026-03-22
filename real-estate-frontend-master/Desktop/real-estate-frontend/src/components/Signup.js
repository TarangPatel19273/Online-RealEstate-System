import React, { useState, useEffect } from "react";
import { signup, googleLogin } from "../services/authService";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) { navigate("/"); }

    // Initialize Google Sign-In when SDK is loaded
    let initGoogle;
    const renderGoogleButton = () => {
      initGoogle = setInterval(() => {
        const buttonEle = document.getElementById('google-signup-button');
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
          window.handleGoogleAuthCallback = handleGoogleSignUp;

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
  }, [navigate]);

  const handleGoogleSignUp = async (response) => {
    try {
      const { credential } = response;

      if (credential) {
        setMessage("Signing up with Google...");
        const res = await googleLogin(credential);
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));

        navigate("/");
      }
    } catch (err) {
      console.error("Google Sign-Up failed:", err);
      if (typeof err.response?.data === "string") {
        setMessage(err.response.data);
      } else if (err.response?.data?.error) {
        setMessage(err.response.data.error);
      } else {
        setMessage("Google Sign-Up failed. Please try again.");
      }
    }
  };



  const calculatePasswordStrength = (pwd) => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (pwd.length >= 12) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[!@#$%^&*]/.test(pwd)) strength++;
    return strength;
  };

  const handlePasswordChange = (e) => {
    const pwd = e.target.value;
    setPassword(pwd);
    setPasswordStrength(calculatePasswordStrength(pwd));
  };

  const handleSignup = async () => {
    if (!username || !email || !password || !confirmPassword) {
      setMessage("All fields are required");
      return;
    }
    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setMessage("Password must be at least 8 characters long");
      return;
    }
    try {
      setLoading(true);
      setMessage("");
      const res = await signup({ username, email, password });
      setMessage(res.data);
      navigate("/verify-otp", { state: { email, isAdmin } });
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

  const getStrengthLabel = () => {
    if (passwordStrength === 0) return "None";
    if (passwordStrength <= 1) return "Weak";
    if (passwordStrength <= 2) return "Fair";
    if (passwordStrength <= 3) return "Good";
    if (passwordStrength <= 4) return "Strong";
    return "Very Strong";
  };

  const getStrengthColor = () => {
    if (passwordStrength <= 1) return "#fa5252";
    if (passwordStrength <= 2) return "#fab005";
    if (passwordStrength <= 3) return "#fcc419";
    return "#51cf66";
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
            <h2 className="form-title">Create Account</h2>
            <p className="form-subtitle">Join thousands of happy property hunters</p>
          </div>

          <form className="auth-form" onSubmit={(e) => { e.preventDefault(); handleSignup(); }}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <div className="input-field">
                <span className="input-icon-left">👤</span>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Choose a unique username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-field">
                <span className="input-icon-left">📧</span>
                <input
                  type="email"
                  className="form-input"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-field">
                <span className="input-icon-left">🔒</span>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Create a strong password"
                  value={password}
                  onChange={handlePasswordChange}
                  autoComplete="new-password"
                />
              </div>
              {password && (
                <div className="strength-indicator">
                  <div className="strength-bar" style={{ width: `${(passwordStrength / 5) * 100}%`, backgroundColor: getStrengthColor() }}></div>
                </div>
              )}
              {password && (
                <p className="strength-text" style={{ color: getStrengthColor() }}>
                  Strength: <strong>{getStrengthLabel()}</strong>
                </p>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div className="input-field">
                <span className="input-icon-left">🔑</span>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                />
                {confirmPassword && password === confirmPassword && (
                  <span className="input-check">✅</span>
                )}
              </div>
            </div>

            <div className="terms-agreement" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label className="checkbox">
                <input type="checkbox" required />
                <span>I agree to the <strong>Terms of Service</strong> and <strong>Privacy Policy</strong></span>
              </label>
              <label className="checkbox">
                <input type="checkbox" checked={isAdmin} onChange={(e) => setIsAdmin(e.target.checked)} />
                <span>Register as Admin (For Testing)</span>
              </label>
            </div>

            <button type="submit" className="submit-button" disabled={loading}>
              <div className="button-content">
                {loading ? (
                  <>
                    <div className="spinner"></div>
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Sign Up</span>
                    <span className="button-arrow">→</span>
                  </>
                )}
              </div>
            </button>
          </form>

          {message && (
            <div className={`form-message ${message.includes("OTP") ? "success" : "error"}`}>
              <span className="message-icon">{message.includes("OTP") ? "✅" : "⚠️"}</span>
              <span>{message}</span>
            </div>
          )}

          <div className="divider">
            <span>or sign up with</span>
          </div>

          <div className="social-login" style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
            <div id="google-signup-button"></div>
          </div>

          <div className="form-footer">
            <p>Already have an account? <span className="link" onClick={() => navigate("/login")}>Login</span></p>
          </div>
        </div>
      </div>

    </div>
  );
}

export default Signup;
