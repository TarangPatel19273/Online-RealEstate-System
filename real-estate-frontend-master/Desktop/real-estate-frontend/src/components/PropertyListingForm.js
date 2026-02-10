import React, { useState, useEffect } from "react";
import "./PropertyListingForm.css";

const PropertyListingForm = ({ onSubmit }) => {
  const [listingType, setListingType] = useState("Sell");
  const [propertyType, setPropertyType] = useState("Residential");
  const [category, setCategory] = useState("Flat/Apartment");
  const [showUserTypeModal, setShowUserTypeModal] = useState(false);
  const [userType, setUserType] = useState(null);
  const [userName, setUserName] = useState("User");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUserName(user.fullName || user.username || "User");
      } catch (e) {
        console.error("Error parsing user");
      }
    }
  }, []);

  const handleStartNow = (e) => {
    e.preventDefault();
    setShowUserTypeModal(true);
  };

  const handleUserTypeSelection = (type) => {
    setUserType(type);
    onSubmit({
      listingType,
      propertyType,
      category,
      userType: type
    });
    setShowUserTypeModal(false);
  };

  const categories = {
    Residential: [
      "Flat/Apartment",
      "Independent House / Villa",
      "Builder Floor",
      "Plot / Land",
      "1 RK/Studio Apartment",
      "Serviced Apartment",
      "Farmhouse"
    ],
    Commercial: [
      "Commercial Space",
      "Office",
      "Retail Shop",
      "Industrial",
      "Land"
    ]
  };

  return (
    <div className="property-listing-form-container">
      <div className="form-wrapper">
        {/* Welcome Section */}
        <div className="welcome-section">
          <p className="welcome-text">Welcome back <span className="owner-name">{userName}</span>,</p>
        </div>

        {/* Main Form Card */}
        <div className="form-card">
          <div className="form-header">
            <h1 className="form-title">Fill out basic details</h1>
            <div className="form-title-underline"></div>
          </div>

          <form onSubmit={handleStartNow}>
            {/* Listing Type Section */}
            <div className="form-section-box">
              <label className="section-label">I'M LOOKING TO</label>
              <div className="button-group">
                {["Sell", "Rent / Lease", "PG"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    className={`option-button ${
                      (type === "Sell" && listingType === "Sell") ||
                      (type === "Rent / Lease" && listingType === "Rent") ||
                      (type === "PG" && listingType === "PG")
                        ? "active"
                        : ""
                    }`}
                    onClick={() => setListingType(type === "Rent / Lease" ? "Rent" : type)}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Property Type Section */}
            <div className="form-section-box">
              <label className="section-label">WHAT KIND OF PROPERTY DO YOU HAVE?</label>
              <div className="radio-inline-group">
                {["Residential", "Commercial"].map((type) => (
                  <label key={type} className="radio-inline">
                    <input
                      type="radio"
                      name="propertyType"
                      value={type}
                      checked={propertyType === type}
                      onChange={(e) => {
                        setPropertyType(e.target.value);
                        setCategory(categories[e.target.value][0]);
                      }}
                    />
                    <span>{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Category Selection */}
            <div className="category-section">
              <div className="category-grid">
                {categories[propertyType].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`category-button ${category === cat ? "active" : ""}`}
                    onClick={() => setCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Start Button */}
            <button type="submit" className="btn-start-now">
              START NOW
            </button>
          </form>
        </div>

        {/* Benefits Section */}
        <div className="benefits-footer">
          <div className="benefit-item">
            <span className="benefit-icon">✓</span>
            <span>Post Property for FREE</span>
          </div>
          <div className="benefit-item">
            <span className="benefit-icon">✓</span>
            <span>Get Genuine Enquiries</span>
          </div>
          <div className="benefit-item">
            <span className="benefit-icon">✓</span>
            <span>24/7 Support</span>
          </div>
        </div>
      </div>

      {/* User Type Modal */}
      {showUserTypeModal && (
        <div className="modal-overlay">
          <div className="modal-content user-type-modal">
            <button
              className="modal-close"
              onClick={() => setShowUserTypeModal(false)}
              title="Close"
            >
              ✕
            </button>

            <div className="modal-header">
              <h3>Are you an Owner or Broker?</h3>
              <p className="modal-description">Select your role to continue</p>
            </div>

            <div className="modal-body">
              <button
                className="user-type-button owner"
                onClick={() => handleUserTypeSelection("Owner")}
              >
                <div className="user-type-icon">👤</div>
                <div className="user-type-text">
                  <div className="user-type-title">Owner</div>
                  <div className="user-type-subtitle">I own the property</div>
                </div>
              </button>

              <button
                className="user-type-button broker"
                onClick={() => handleUserTypeSelection("Broker")}
              >
                <div className="user-type-icon">💼</div>
                <div className="user-type-text">
                  <div className="user-type-title">Broker</div>
                  <div className="user-type-subtitle">I represent the property</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyListingForm;
