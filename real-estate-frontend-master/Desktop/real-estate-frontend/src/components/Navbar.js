import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    navigate("/login");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed.length === 0) {
      navigate("/");
    } else {
      navigate(`/?location=${encodeURIComponent(trimmed)}`);
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-brand" onClick={() => navigate("/")}>
        <span className="brand-icon">🏠</span>
        <span className="brand-text">EstateHub</span>
      </div>

      <div className="nav-left">
        <span className="nav-link" onClick={() => navigate("/")}>
          <span className="link-icon">🏡</span>
          Home
        </span>
        <span className="nav-link" onClick={() => navigate("/sell-property")}>
          <span className="link-icon">💼</span>
          For Sellers
        </span>
        <span className="nav-link" onClick={() => navigate("/my-properties")}>
          <span className="link-icon">📋</span>
          My Properties
        </span>
        {/* <span className="nav-link" onClick={() => navigate("/tenants")}>
          <span className="link-icon">🏘️</span>
          For Tenants
        </span> */}
      </div>

      <div className="nav-right">
        <form className="nav-search" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="🔍 Search by location..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search properties by location"
          />
          <button type="submit" className="search-btn">
            Search
          </button>
        </form>
        
        {isAuthenticated ? (
          <button className="nav-btn logout-btn" onClick={handleLogout}>
            <span>🚪</span>
            Logout
          </button>
        ) : (
          <div className="auth-buttons">
            <button className="nav-btn login-btn" onClick={() => navigate("/login")}>
              <span>🔐</span>
              Login
            </button>
            <button className="nav-btn signup-btn" onClick={() => navigate("/signup")}>
              <span>✨</span>
              Sign Up
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
