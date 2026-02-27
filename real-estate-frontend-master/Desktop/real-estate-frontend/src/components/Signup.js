import React, { useState, useEffect } from "react";
import { signup } from "../services/authService";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) { navigate("/"); }
    
    // Load Google Sign-In script
    loadGoogleSignin();
  }, [navigate]);

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
            client_id: "167248250288-n6af1ihtmr6hvcfc1npjdq1d7h0a64u3.apps.googleusercontent.com",
            scope: "profile email",
          });
        });
      }
    };
  };

  const handleGoogleSignUp = (response) => {
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
        setMessage("Signing up with Google...");
        
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
      console.error("Google Sign-Up failed:", err);
      setMessage("Google Sign-Up failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleSignUpClick = () => {
    if (window.google) {
      window.google.accounts.id.renderButton(
        document.getElementById('google-signup-button'),
        { 
          type: 'standard', 
          theme: 'outline', 
          size: 'large',
          width: '100%'
        }
      );
      
      window.google.accounts.id.initialize({
        client_id: "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com",
        callback: handleGoogleSignUp,
      });
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
                  <div className="strength-bar" style={{width: `${(passwordStrength / 5) * 100}%`, backgroundColor: getStrengthColor()}}></div>
                </div>
              )}
              {password && (
                <p className="strength-text" style={{color: getStrengthColor()}}>
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

            <div className="terms-agreement">
              <label className="checkbox">
                <input type="checkbox" required />
                <span>I agree to the <strong>Terms of Service</strong> and <strong>Privacy Policy</strong></span>
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

          <div className="social-login">
            <button 
              type="button" 
              className="social-button google"
              onClick={handleGoogleSignUpClick}
              disabled={googleLoading}
            >
              <svg className="social-icon" viewBox="0 0 24 24" width="20" height="20">
                <path fill="currentColor" d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032 c0-3.331,2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.461,2.268,15.365,1.25,12.545,1.25 c-6.343,0-11.5,5.157-11.5,11.5c0,6.343,5.157,11.5,11.5,11.5c6.343,0,11.5-5.157,11.5-11.5c0-0.468-0.033-0.94-0.112-1.39H12.545z"/>
              </svg>
              <span>{googleLoading ? "Signing up..." : "Sign up with Google"}</span>
            </button>
          </div>

          <div className="form-footer">
            <p>Already have an account? <span className="link" onClick={() => navigate("/login")}>Login</span></p>
          </div>
        </div>
      </div>

      <script src="https://accounts.google.com/gsi/client" async defer></script>
    </div>
  );
}

export default Signup;
