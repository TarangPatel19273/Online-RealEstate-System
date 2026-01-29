import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import { useLocation, useNavigate } from "react-router-dom";
import "./Home.css";

const Home = () => {
  const [properties, setProperties] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState({});
  const locationHook = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const [activeTab, setActiveTab] = useState("Buy");

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

    let url = `http://localhost:8080/api/properties/search?`;
    if (filters.location) url += `location=${encodeURIComponent(filters.location)}&`;
    if (filters.type) url += `type=${filters.type}&`;
    if (filters.category) url += `category=${filters.category}`;

    console.log("Fetching with URL:", url);

    axios.get(url)
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
    if (searchQuery.trim()) {
      navigate(`/?location=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate("/");
    }
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
              <span className={`search-tab ${activeTab === "Buy" ? "active" : ""}`} onClick={() => setActiveTab("Buy")}>Buy</span>
              <span className={`search-tab ${activeTab === "Rent" ? "active" : ""}`} onClick={() => setActiveTab("Rent")}>Rent</span>
              <span className={`search-tab ${activeTab === "Commercial" ? "active" : ""}`} onClick={() => setActiveTab("Commercial")}>Commercial</span>
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
          {properties.map(property => {
            const currentIndex = currentImageIndex[property.id] || 0;
            const hasImages = property.imageUrls && property.imageUrls.length > 0;
            const totalImages = hasImages ? property.imageUrls.length : 0;

            return (
              <div key={property.id} className="property-card" onClick={() => navigate(`/property/${property.id}`)}>
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
                    <span className="card-tag">Ready to Move</span>
                    <div className="card-actions">
                      <button className="btn-contact-seller">Contact Seller</button>
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
    </div>
  );
};

export default Home;
