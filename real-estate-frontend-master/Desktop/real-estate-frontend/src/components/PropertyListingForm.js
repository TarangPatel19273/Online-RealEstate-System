import React, { useState } from "react";
import "./PropertyListingForm.css";

const PropertyListingForm = ({ onSubmit }) => {
  const [listingType, setListingType] = useState("Sell");
  const [propertyType, setPropertyType] = useState("Residential");
  const [category, setCategory] = useState("Flat/Apartment");
  const [showUserTypeModal, setShowUserTypeModal] = useState(false);
  const [userType, setUserType] = useState(null);

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

  return (
    <div className="property-listing-form-container">
      {/* Left Section - Marketing Content */}
      <div className="marketing-section">
        <div className="marketing-content">
          <h1 className="marketing-title">
            Sell or Rent Property
          </h1>
          <p className="marketing-highlight">
            <span className="highlight-text">online faster</span> with EstateHub
          </p>

          <div className="benefits-list">
            <div className="benefit-item">
              <span className="checkmark">✓</span>
              <span>Advertise for FREE</span>
            </div>
            <div className="benefit-item">
              <span className="checkmark">✓</span>
              <span>Get unlimited enquiries</span>
            </div>
            <div className="benefit-item">
              <span className="checkmark">✓</span>
              <span>Get shortlisted buyers and tenants</span>
            </div>
            <div className="benefit-item">
              <span className="checkmark">✓</span>
              <span>Assistance in co-ordinating site visits</span>
            </div>
          </div>

          <div className="illustration">
            <div className="illustration-placeholder">📱💼✉️🏢</div>
          </div>
        </div>
      </div>

      {/* Right Section - Form */}
      <div className="form-section">
        <div className="form-card">
          <div className="form-header">
            <h2>Start posting your property, it's free</h2>
            <p className="form-subtitle">Add Basic Details</p>
          </div>

          <form onSubmit={handleStartNow}>
            {/* Listing Type Selection */}
            <div className="form-group">
              <label className="form-label">You're looking to ...</label>
              <div className="radio-group">
                <label className="radio-option">
                  <input
                    type="radio"
                    name="listingType"
                    value="Sell"
                    checked={listingType === "Sell"}
                    onChange={(e) => setListingType(e.target.value)}
                  />
                  Sell
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="listingType"
                    value="Rent"
                    checked={listingType === "Rent"}
                    onChange={(e) => setListingType(e.target.value)}
                  />
                  Rent / Lease
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="listingType"
                    value="PG"
                    checked={listingType === "PG"}
                    onChange={(e) => setListingType(e.target.value)}
                  />
                  PG
                </label>
              </div>
            </div>

            {/* Property Type Selection */}
            <div className="form-group">
              <label className="form-label">And it's a ...</label>
              
              <div className="property-type-group">
                <div className="checkbox-options">
                  <label className="checkbox-option">
                    <input
                      type="radio"
                      name="propertyType"
                      value="Residential"
                      checked={propertyType === "Residential"}
                      onChange={(e) => setPropertyType(e.target.value)}
                    />
                    Residential
                  </label>
                  <label className="checkbox-option">
                    <input
                      type="radio"
                      name="propertyType"
                      value="Commercial"
                      checked={propertyType === "Commercial"}
                      onChange={(e) => setPropertyType(e.target.value)}
                    />
                    Commercial
                  </label>
                </div>
              </div>

              {/* Category Selection */}
              <div className="category-options">
                <label className="category-option">
                  <input
                    type="radio"
                    name="category"
                    value="Flat/Apartment"
                    checked={category === "Flat/Apartment"}
                    onChange={(e) => setCategory(e.target.value)}
                  />
                  Flat/Apartment
                </label>
                <label className="category-option">
                  <input
                    type="radio"
                    name="category"
                    value="Independent House / Villa"
                    checked={category === "Independent House / Villa"}
                    onChange={(e) => setCategory(e.target.value)}
                  />
                  Independent House / Villa
                </label>
                <label className="category-option">
                  <input
                    type="radio"
                    name="category"
                    value="Builder Floor"
                    checked={category === "Builder Floor"}
                    onChange={(e) => setCategory(e.target.value)}
                  />
                  Builder Floor
                </label>
                <label className="category-option">
                  <input
                    type="radio"
                    name="category"
                    value="Plot / Land"
                    checked={category === "Plot / Land"}
                    onChange={(e) => setCategory(e.target.value)}
                  />
                  Plot / Land
                </label>
              </div>
            </div>

            {/* Start Now Button */}
            <button type="submit" className="btn-start-now">
              Start now
            </button>
          </form>
        </div>
      </div>

      {/* User Type Modal */}
      {showUserTypeModal && (
        <div className="modal-overlay">
          <div className="modal-content user-type-modal">
            <div className="modal-header">
              <h3>Are you an Owner or Broker?</h3>
              <p className="modal-description">Please select your role to continue</p>
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

            <button
              className="modal-close"
              onClick={() => setShowUserTypeModal(false)}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
export default PropertyListingForm;