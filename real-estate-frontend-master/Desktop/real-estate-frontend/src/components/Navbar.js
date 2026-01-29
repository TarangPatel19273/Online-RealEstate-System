import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    setIsAuthenticated(!!token);
    if (storedUser && storedUser !== "undefined") {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Error parsing user data", e);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setUser(null);
    navigate("/login");
  };

  return (
    <nav className="navbar-modern">
      <div className="navbar-container">
        {/* Logo Section */}
        <div className="navbar-brand" onClick={() => navigate("/")}>
          <span className="brand-logo">🏠</span>
          <span className="brand-name">Estate<span className="brand-highlight">Hub</span></span>
        </div>

        {/* Navigation Links */}
        <div className="navbar-links">
          <div className="nav-item" onClick={() => navigate("/")}>Buy</div>
          <div className="nav-item" onClick={() => navigate("/")}>Rent</div>
          <div className="nav-item" onClick={() => navigate("/sell-property")}>Sell</div>
          <div className="nav-item" onClick={() => navigate("/my-properties")}>My Dashboard</div>
        </div>

        {/* Right Actions */}
        <div className="navbar-actions">
          {/* Post Property CTA */}
          <button className="btn-post-property" onClick={() => navigate("/sell-property")}>
            Post Property
            <span className="badge-free">FREE</span>
          </button>

          {/* User Profile / Login */}
          {isAuthenticated ? (
            <div className="user-menu">
              <div className="user-icon-circle">
                {user ? user.username?.charAt(0).toUpperCase() : "U"}
              </div>
              <button className="btn-logout" onClick={handleLogout}>Logout</button>
            </div>
          ) : (
            <div className="auth-links">
              <button className="btn-login" onClick={() => navigate("/login")}>Login</button>
              <button className="btn-signup" onClick={() => navigate("/signup")}>Sign Up</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
