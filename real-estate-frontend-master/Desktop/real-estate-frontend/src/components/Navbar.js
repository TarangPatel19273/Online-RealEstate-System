import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
          <div className="nav-item" onClick={() => navigate("/?type=Buy")}>Buy</div>
          <div className="nav-item" onClick={() => navigate("/?type=Rent")}>Rent</div>
          <div className="nav-item" onClick={() => navigate("/sell-property")}>Sell</div>
          <div className="nav-item" onClick={() => navigate("/budget-calculator")}>Budget Calculator</div>
        </div>

        {/* Right Actions */}
        <div className="navbar-actions">
          {/* Post Property CTA */}
          {!isAuthenticated && (
            <button className="btn-post-property" onClick={() => navigate("/sell-property")}>
              Post Property
              <span className="badge-free">FREE</span>
            </button>
          )}

          {/* User Profile / Login */}
          {isAuthenticated ? (
            <div
              className="user-menu"
              onMouseEnter={() => setIsDropdownOpen(true)}
              onMouseLeave={() => setIsDropdownOpen(false)}
            >
              <button className="btn-post-property" onClick={() => navigate("/sell-property")} style={{ marginRight: '15px' }}>
                Post Property
                <span className="badge-free">FREE</span>
              </button>

              <div
                className="user-icon-circle"
                onClick={() => navigate("/profile")}
              >
                {user ? user.username?.charAt(0).toUpperCase() : "U"}
              </div>

              {isDropdownOpen && (
                <div className="dropdown-menu">
                  <div className="dropdown-item" onClick={() => navigate("/profile")}>
                    <span>👤</span> My Profile
                  </div>
                  <div className="dropdown-item" onClick={() => navigate("/my-properties")}>
                    <span>📊</span> My Dashboard
                  </div>
                  <div className="dropdown-item" onClick={() => navigate("/wishlist")}>
                    <span>♥️</span> Wishlist
                  </div>
                  <div className="dropdown-divider"></div>
                  <div className="dropdown-item logout-item" onClick={handleLogout}>
                    <span>🚪</span> Logout
                  </div>
                </div>
              )}
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
