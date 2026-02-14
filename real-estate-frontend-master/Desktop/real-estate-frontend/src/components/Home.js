import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import propertyService from "../services/propertyService";
import { useLocation, useNavigate } from "react-router-dom";
import "./Home.css";

const Home = () => {
  const [properties, setProperties] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState({});
  const locationHook = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const [activeTab, setActiveTab] = useState("Buy");
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedProperties, setSelectedProperties] = useState([]);

  // Comparison Logic
  const handlePropertySelect = (propertyId) => {
    setSelectedProperties(prev => {
      if (prev.includes(propertyId)) {
        return prev.filter(id => id !== propertyId);
      }
      if (prev.length >= 3) {
        alert("You can only compare up to 3 properties!");
        return prev;
      }
      return [...prev, propertyId];
    });
  };

  const handleCompare = () => {
    if (selectedProperties.length < 2) {
      alert("Please select at least 2 properties to compare.");
      return;
    }
    navigate(`/compare?ids=${selectedProperties.join(",")}`);
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse user from local storage");
      }
    }
  }, []);

  // Sync activeTab with URL "type" parameter
  useEffect(() => {
    const params = new URLSearchParams(locationHook.search);
    const typeParam = params.get("type");
    if (typeParam && ["Buy", "Rent", "Commercial"].includes(typeParam)) {
      setActiveTab(typeParam);
    }
  }, [locationHook.search]);

  useEffect(() => {
    const params = new URLSearchParams(locationHook.search);
    const filters = {
      location: params.get("location") || "",
      type: "",
      category: ""
    }

    // MAP TABS TO FILTERS
    if (activeTab === "Buy") {
      filters.type = "Sell";
    } else if (activeTab === "Rent") {
      filters.type = "Rent";
    } else if (activeTab === "Commercial") {
      filters.category = "Commercial";
      // filters.type = "Sell"; // Optional: default to sell for commercial? or show all. Let's show all commercial.
    }

    console.log("Fetching with filters:", filters);

    propertyService.searchProperties(filters)
      .then(res => {
        const data = res.data || [];
        setProperties(data);

        const initialIndexes = {};
        data.forEach(property => {
          initialIndexes[property.id] = 0;
        });
        setCurrentImageIndex(initialIndexes);
      })
      .catch(err => {
        console.error("Error fetching properties:", err);
        setProperties([]);
      });
  }, [locationHook.search, activeTab]);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) {
      params.set("location", searchQuery.trim());
    }
    // Include current active tab type in search
    if (activeTab) {
      params.set("type", activeTab);
    }
    navigate(`/?${params.toString()}`);
  }

  const handleNextImage = (e, propertyId, totalImages) => {
    e.stopPropagation();
    setCurrentImageIndex(prev => ({
      ...prev,
      [propertyId]: (prev[propertyId] + 1) % totalImages
    }));
  };

  const handlePrevImage = (e, propertyId, totalImages) => {
    e.stopPropagation();
    setCurrentImageIndex(prev => ({
      ...prev,
      [propertyId]: (prev[propertyId] - 1 + totalImages) % totalImages
    }));
  };

  return (
    <div className="home-page">
      <Navbar />

      {/* HERO SECTION */}
      <div className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">Real Estate in India</h1>
          <h2 className="hero-subtitle">Check out the latest properties for Buy, Rent, or Sell</h2>

          <div className="hero-search-container">
            <div className="search-tabs">
              <span
                className={`search-tab ${activeTab === "Buy" ? "active" : ""}`}
                onClick={() => navigate(`/?type=Buy${searchQuery ? `&location=${encodeURIComponent(searchQuery)}` : ""}`)}
              >
                Buy
              </span>
              <span
                className={`search-tab ${activeTab === "Rent" ? "active" : ""}`}
                onClick={() => navigate(`/?type=Rent${searchQuery ? `&location=${encodeURIComponent(searchQuery)}` : ""}`)}
              >
                Rent
              </span>
              <span
                className={`search-tab ${activeTab === "Commercial" ? "active" : ""}`}
                onClick={() => navigate(`/?type=Commercial${searchQuery ? `&location=${encodeURIComponent(searchQuery)}` : ""}`)}
              >
                Commercial
              </span>
            </div>
            <form className="hero-search-bar" onSubmit={handleSearch}>
              <div className="search-input-wrapper">
                <span className="search-icon">📍</span>
                <input
                  type="text"
                  placeholder="Search by city, locality, or project..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button type="submit" className="hero-search-btn">Search</button>
            </form>
          </div>
        </div>
      </div>

      {/* PROPERTY LIST SECTION */}
      <div className="content-container">
        <h2 className="section-title">Latest Properties</h2>

        <div className="properties-grid">
          {properties
            .filter(property => {
              if (activeTab === "Buy") return property.type === "Sell";
              if (activeTab === "Rent") return property.type === "Rent";
              if (activeTab === "Commercial") return property.category === "Commercial";
              return true;
            })
            .map(property => {
              const currentIndex = currentImageIndex[property.id] || 0;
              const hasImages = property.imageUrls && property.imageUrls.length > 0;
              const totalImages = hasImages ? property.imageUrls.length : 0;

              const isOwner = currentUser && (
                currentUser.email === property.sellerEmail ||
                currentUser.id === property.userId
              );


              const isSelected = selectedProperties.includes(property.id);

              return (
                <div key={property.id} className="property-card" onClick={() => navigate(`/property/${property.id}`)}>
                  {/* Compare Checkbox */}
                  <div className="compare-checkbox-wrapper" onClick={(e) => {
                    e.stopPropagation();
                    handlePropertySelect(property.id);
                  }}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => { }} // Handled by wrapper click
                      className="compare-checkbox"
                    />
                    <span className="compare-label">Compare</span>
                  </div>
                  {/* IMAGE CAROUSEL */}
                  <div className="card-image-wrapper">
                    {hasImages ? (
                      <>
                        <img
                          src={`http://localhost:8080/api/properties/images/${encodeURIComponent(property.imageUrls[currentIndex])}`}
                          alt={property.title}
                          className="card-image"
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/400x300?text=No+Image";
                          }}
                        />
                        {totalImages > 1 && (
                          <>
                            <button className="card-nav-btn prev" onClick={(e) => handlePrevImage(e, property.id, totalImages)}>‹</button>
                            <button className="card-nav-btn next" onClick={(e) => handleNextImage(e, property.id, totalImages)}>›</button>
                          </>
                        )}
                        <div className="image-counter-badge">
                          📷 {totalImages}
                        </div>
                      </>
                    ) : (
                      <div className="no-image-placeholder">
                        <span>🏠 No Photos</span>
                      </div>
                    )}
                  </div>

                  {/* DETAILS */}
                  <div className="card-details">
                    <div className="card-header">
                      <h3 className="card-price">₹ {property.price}</h3>
                      <span className="card-title">{property.title}</span>
                    </div>

                    <div className="card-location">
                      📍 {property.location}
                    </div>

                    <p className="card-description">
                      {property.description?.length > 80
                        ? property.description.substring(0, 80) + "..."
                        : property.description}
                    </p>

                    <div className="card-footer">
                      <span className="card-tag" style={{ backgroundColor: property.type === "Sell" ? "#007bff" : "#28a745", color: "white" }}>
                        {property.type === "Sell" ? "For Sale" : "For Rent"}
                      </span>
                      <span className="card-tag" style={{ marginLeft: "5px", backgroundColor: "#6c757d", color: "white" }}>
                        {property.category}
                      </span>
                      <div className="card-actions">
                        {!isOwner && (
                          <button className="btn-contact-seller" onClick={(e) => {
                            e.stopPropagation();
                            // Handle contact logic here if needed
                            alert(`Contact ${property.sellerEmail}`);
                          }}>Contact Seller</button>
                        )}
                        {isOwner && (
                          <span style={{ fontSize: "12px", color: "gray" }}>You own this property</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>

        {properties.length === 0 && (
          <div className="empty-state">
            <div className="empty-emoji">🏙️</div>
            <h3>No Properties Found</h3>
            <p>Try adjusting your search or check back later.</p>
          </div>
        )}
      </div>

      {/* Compare Floating Button */}
      {selectedProperties.length > 0 && (
        <div className="compare-floating-bar">
          <div className="compare-count">
            {selectedProperties.length} property{selectedProperties.length > 1 ? "ies" : ""} selected
          </div>
          <button className="btn-compare-action" onClick={handleCompare}>
            Compare Now
          </button>
        </div>
      )}
    </div>
  );
};

export default Home;
