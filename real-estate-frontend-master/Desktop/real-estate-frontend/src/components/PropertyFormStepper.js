import React, { useState } from "react";
import "./PropertyFormStepper.css";

const PropertyFormStepper = ({ formData, onComplete, onBack, editMode = false }) => {
  const normalizeAmenities = (amenities) => {
    if (Array.isArray(amenities)) return amenities;
    if (typeof amenities === "string") {
      try {
        const parsed = JSON.parse(amenities);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        return [];
      }
    }
    return [];
  };

  const [currentStep, setCurrentStep] = useState(1);
  const [formState, setFormState] = useState({
    listingType: formData.listingType || "Sell",
    propertyType: formData.propertyType || "Residential",
    category: formData.category || "Flat/Apartment",
    userType: formData.userType || "Owner",
    title: formData.title || "",
    location: formData.location || "",
    address: formData.address || "",
    city: formData.city || "",
    state: formData.state || "",
    pincode: formData.pincode || "",
    bedrooms: formData.bedrooms || "",
    bathrooms: formData.bathrooms || "",
    balconies: formData.balconies || "",
    area: formData.area || "",
    carpetArea: formData.carpetArea || "",
    areaUnit: "sqft",
    length: formData.length || "",
    width: formData.width || "",
    floorNumber: formData.floorNumber || "",
    totalFloors: formData.totalFloors || "",
    propertyAge: formData.propertyAge || "",
    description: formData.description || "",
    amenities: normalizeAmenities(formData.amenities),
    images: [],
    existingImages: formData.existingImages || [],
    imagesToDelete: formData.imagesToDelete || [],
    price: formData.price || "",
    contactNumber: formData.contactNumber || "",
  });
  const [stepError, setStepError] = useState("");

  const steps = [
    { id: 1, label: "Basic Details", description: "Step 1" },
    { id: 2, label: "Location Details", description: "Step 2" },
    { id: 3, label: "Property Profile", description: "Step 3" },
    { id: 4, label: "Photos, Videos & Voice-over", description: "Step 4" },
    { id: 5, label: "Amenities section", description: "Step 5" },
  ];

  const totalSteps = steps.length;
  const completedSteps = currentStep >= totalSteps ? totalSteps : currentStep - 1;
  const scorePercent = Math.round((completedSteps / totalSteps) * 100);
  const scoreDegrees = (scorePercent / 100) * 360;
  const scoreStyle = {
    background: `conic-gradient(#4caf50 0deg ${scoreDegrees}deg, #e0e0e0 ${scoreDegrees}deg 360deg)`
  };

  const categories = [
    "Flat/Apartment",
    "Independent House / Villa",
    "Builder Floor",
    "Plot / Land",
    "1 RK/Studio Apartment",
    "Serviced Apartment",
    "Farmhouse",
    "Other",
  ];

  const amenitiesList = [
    "24/7 Security",
    "Parking",
    "Lift",
    "Clubhouse",
    "Swimming Pool",
    "Gym",
    "Garden",
    "Community Hall",
    "Power Backup",
    "Water Storage",
  ];

  const handleInputChange = (field, value) => {
    setFormState(prev => ({
      ...prev,
      [field]: value
    }));
    if (stepError) {
      setStepError("");
    }
  };

  const handleAmenityToggle = (amenity) => {
    setFormState(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
    if (stepError) {
      setStepError("");
    }
  };

  const handleCategoryClick = (cat) => {
    setFormState(prev => ({
      ...prev,
      category: cat
    }));
    if (stepError) {
      setStepError("");
    }
  };

  const hasValue = (value) => String(value || "").trim().length > 0;

  const handleRemoveExistingImage = (imageName) => {
    setFormState(prev => ({
      ...prev,
      existingImages: prev.existingImages.filter(img => img !== imageName),
      imagesToDelete: [...prev.imagesToDelete, imageName]
    }));
  };

  const getStepError = (step) => {
    if (step === 1) {
      if (!hasValue(formState.listingType)) return "Please select a listing type.";
      if (!hasValue(formState.propertyType)) return "Please select a property type.";
      if (!hasValue(formState.category)) return "Please select a property category.";
    }

    if (step === 2) {
      if (!hasValue(formState.city)) return "Please enter the city.";
      if (!hasValue(formState.state)) return "Please enter the state.";
      if (!hasValue(formState.address)) return "Please enter the address.";
      if (!hasValue(formState.pincode)) return "Please enter the pincode.";
    }

    if (step === 3) {
      if (!hasValue(formState.title)) return "Please enter a property title.";
      if (!hasValue(formState.price)) return "Please enter the price.";
      if (!hasValue(formState.bedrooms)) return "Please enter the number of bedrooms.";
      if (!hasValue(formState.bathrooms)) return "Please enter the number of bathrooms.";
      if (!hasValue(formState.area)) return "Please enter the built-up area.";
      if (!hasValue(formState.floorNumber)) return "Please enter the floor number.";
      if (!hasValue(formState.totalFloors)) return "Please enter the total floors.";
      if (!hasValue(formState.propertyAge)) return "Please enter the property age.";
      if (!hasValue(formState.description)) return "Please enter the description.";
    }

    if (step === 4) {
      const hasNewImages = formState.images && formState.images.length > 0;
      const hasExistingImages = editMode && formState.existingImages && formState.existingImages.length > 0;
      if (!hasNewImages && !hasExistingImages) {
        return "Please upload at least one photo.";
      }
    }

    if (step === 5) {
      if (!hasValue(formState.contactNumber)) return "Please enter a contact number.";
      if (!formState.amenities || formState.amenities.length === 0) {
        return "Please select at least one amenity.";
      }
    }

    return "";
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      const error = getStepError(currentStep);
      if (error) {
        setStepError(error);
        return;
      }
      setStepError("");
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setStepError("");
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = () => {
    const error = getStepError(currentStep);
    if (error) {
      setStepError(error);
      return;
    }
    setStepError("");
    onComplete(formState);
  };



  return (
    <div className="property-form-stepper-container">
      {/* Left Sidebar */}
      <div className="stepper-sidebar">
        <div className="steps-container">
          {steps.map((step) => (
            <div key={step.id} className={`step-item ${currentStep === step.id ? "active" : ""} ${currentStep > step.id ? "completed" : ""}`}>
              <div className="step-circle">
                {currentStep > step.id ? "✓" : step.id}
              </div>
              <div className="step-content">
                <div className="step-label">{step.label}</div>
                <div className="step-description">{step.description}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Property Score Section */}
        <div className="property-score">
          <div className="score-circle" style={scoreStyle}>
            <div className="score-value">{scorePercent}%</div>
          </div>
          <div className="score-info">
            <div className="score-title">Property Score</div>
            <div className="score-subtitle">Complete all details for higher visibility</div>
          </div>
        </div>
      </div>

      {/* Right Content Area */}
      <div className="stepper-content">
        <div className="content-header">
          <h2>Welcome back {formState.userType},</h2>
          <h1>{editMode ? "Edit your property" : "Fill out basic details"}</h1>
        </div>

        {/* Step 1: Basic Details */}
        {currentStep === 1 && (
          <div className="step-content-area">
            <div className="form-section">
              <label className="form-label">I'm looking to</label>
              <div className="tab-buttons">
                {["Sell", "Rent / Lease", "PG"].map(option => (
                  <button
                    key={option}
                    className={`tab-btn ${formState.listingType === option ? "active" : ""}`}
                    onClick={() => handleInputChange("listingType", option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-section">
              <label className="form-label">What kind of property do you have?</label>

              <div className="property-type-selector">
                <label className="radio-label">
                  <input
                    type="radio"
                    value="Residential"
                    checked={formState.propertyType === "Residential"}
                    onChange={(e) => handleInputChange("propertyType", e.target.value)}
                  />
                  Residential
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    value="Commercial"
                    checked={formState.propertyType === "Commercial"}
                    onChange={(e) => handleInputChange("propertyType", e.target.value)}
                  />
                  Commercial
                </label>
              </div>

              <div className="category-buttons">
                {categories.map(cat => (
                  <button
                    key={cat}
                    className={`category-btn ${formState.category === cat ? "active" : ""}`}
                    onClick={() => handleCategoryClick(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Location Details */}
        {currentStep === 2 && (
          <div className="step-content-area">
            <div className="form-section">
              <label className="form-label">Location Details</label>

              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  placeholder="Enter city"
                  value={formState.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>State</label>
                <input
                  type="text"
                  placeholder="Enter state"
                  value={formState.state}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Address</label>
                <input
                  type="text"
                  placeholder="Enter full address"
                  value={formState.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Pincode</label>
                <input
                  type="text"
                  placeholder="Enter pincode"
                  value={formState.pincode}
                  onChange={(e) => handleInputChange("pincode", e.target.value)}
                  className="form-input"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Property Profile */}
        {currentStep === 3 && (
          <div className="step-content-area">
            <div className="form-section">
              <label className="form-label">Property Profile</label>

              <div className="form-row">
                <div className="form-group">
                  <label>Title</label>
                  <input
                    type="text"
                    placeholder="e.g., 3 BHK Apartment"
                    value={formState.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Price</label>
                  <input
                    type="number"
                    placeholder="Enter price"
                    value={formState.price}
                    onChange={(e) => handleInputChange("price", e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Bedrooms</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={formState.bedrooms}
                    onChange={(e) => handleInputChange("bedrooms", e.target.value)}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Bathrooms</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={formState.bathrooms}
                    onChange={(e) => handleInputChange("bathrooms", e.target.value)}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Balconies</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={formState.balconies}
                    onChange={(e) => handleInputChange("balconies", e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Built-up Area (sqft)</label>
                  <input
                    type="number"
                    placeholder="Enter area"
                    value={formState.area}
                    onChange={(e) => handleInputChange("area", e.target.value)}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Carpet Area (sqft)</label>
                  <input
                    type="number"
                    placeholder="Enter carpet area"
                    value={formState.carpetArea}
                    onChange={(e) => handleInputChange("carpetArea", e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Floor Number</label>
                  <input
                    type="text"
                    placeholder="e.g., 2nd, 5th, Ground"
                    value={formState.floorNumber}
                    onChange={(e) => handleInputChange("floorNumber", e.target.value)}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Total Floors</label>
                  <input
                    type="number"
                    placeholder="Total floors in building"
                    value={formState.totalFloors}
                    onChange={(e) => handleInputChange("totalFloors", e.target.value)}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Property Age</label>
                  <input
                    type="text"
                    placeholder="e.g., 2 years, 5 months old"
                    value={formState.propertyAge}
                    onChange={(e) => handleInputChange("propertyAge", e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  placeholder="Describe the property..."
                  value={formState.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  className="form-textarea"
                  rows={4}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Photos, Videos & Voice-over */}
        {currentStep === 4 && (
          <div className="step-content-area">
            <div className="form-section">
              <label className="form-label">Upload Property Media</label>

              {editMode && formState.existingImages && formState.existingImages.length > 0 && (
                <div className="files-info" style={{ marginBottom: "12px" }}>
                  <div style={{ fontWeight: 600, marginBottom: "8px" }}>Existing Photos</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                    {formState.existingImages.map((img, idx) => (
                      <div key={`${img}-${idx}`} style={{ position: "relative" }}>
                        <img
                          src={`http://localhost:8080/api/properties/images/${encodeURIComponent(img)}`}
                          alt="existing"
                          style={{ width: "80px", height: "60px", objectFit: "cover", borderRadius: "6px" }}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveExistingImage(img)}
                          style={{
                            position: "absolute",
                            top: "-6px",
                            right: "-6px",
                            width: "20px",
                            height: "20px",
                            borderRadius: "50%",
                            border: "none",
                            background: "#dc3545",
                            color: "white",
                            cursor: "pointer",
                            fontSize: "12px",
                            lineHeight: "20px"
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="upload-area">
                <label className="file-input-label">
                  <div className="upload-icon">🖼️</div>
                  <span className="upload-text">Click to upload photos</span>
                  <span className="upload-hint">JPG, PNG (Max 5MB each)</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleInputChange("images", e.target.files)}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>

              {formState.images && formState.images.length > 0 && (
                <div className="files-info">
                  ✅ {formState.images.length} photo(s) selected
                </div>
              )}

              <div className="info-box">
                <p>{editMode ? "📌 You can keep existing photos or add new ones." : "📌 Upload at least 5 high-quality photos for better visibility"}</p>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Amenities */}
        {currentStep === 5 && (
          <div className="step-content-area">
            <div className="form-section">
              <label className="form-label">Select Amenities</label>

              <div className="amenities-grid">
                {amenitiesList.map(amenity => (
                  <label key={amenity} className="amenity-checkbox">
                    <input
                      type="checkbox"
                      checked={formState.amenities.includes(amenity)}
                      onChange={() => handleAmenityToggle(amenity)}
                    />
                    <span className="amenity-label">{amenity}</span>
                  </label>
                ))}
              </div>

              <div className="form-group">
                <label>Contact Number</label>
                <input
                  type="tel"
                  placeholder="Enter contact number"
                  value={formState.contactNumber}
                  onChange={(e) => handleInputChange("contactNumber", e.target.value)}
                  className="form-input"
                />
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="button-group">
          {stepError && (
            <div className="step-error" role="alert">
              {stepError}
            </div>
          )}
          {currentStep > 1 && (
            <button className="btn-previous" onClick={handlePrevious}>
              ← Previous
            </button>
          )}

          {currentStep < steps.length && (
            <button className="btn-continue" onClick={handleNext}>
              Continue →
            </button>
          )}

          {currentStep === steps.length && (
            <button className="btn-finish" onClick={handleFinish}>
              {editMode ? "Update Listing" : "Publish Listing"}
            </button>
          )}
        </div>

        {/* Need Help Section */}
        <div className="need-help">
          <p>📞 Need help?</p>
          <p>Email: tarangpatel20053@gmail.com or call: +91-9054894630</p>
        </div>
      </div>
    </div>
  );
};

export default PropertyFormStepper;
