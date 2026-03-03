import React, { useState, useEffect } from "react";
import { getCoordinates } from "../utils/geocode";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { API_BASE } from "../config";
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

  const [currentStep, setCurrentStep] = useState((!editMode && formData && formData.listingType) ? 2 : 1);
  // eslint-disable-next-line no-unused-vars
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mapCenter, setMapCenter] = useState(null);

  // Fix default icon issue for react-leaflet
  useEffect(() => {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
      iconUrl: require('leaflet/dist/images/marker-icon.png'),
      shadowUrl: require('leaflet/dist/images/marker-shadow.png')
    });
  }, []);

  // Component to update map view dynamically
  const MapUpdater = ({ center }) => {
    const map = useMap();
    if (center) {
      map.setView(center, map.getZoom());
    }
    return null;
  };
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
    latitude: formData.latitude || null,
    longitude: formData.longitude || null,
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
    // Add validation for file sizes
    if (field === "images" && value && value.length > 0) {
      const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
      const validFiles = Array.from(value).filter(file => {
        if (file.size > MAX_IMAGE_SIZE) {
          alert(`Image "${file.name}" exceeds the maximum size of 5MB.`);
          return false;
        }
        return true;
      });

      setFormState(prev => ({
        ...prev,
        [field]: validFiles
      }));
    } else if (field === "videos" && value && value.length > 0) {
      const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
      const validFiles = Array.from(value).filter(file => {
        if (file.size > MAX_VIDEO_SIZE) {
          alert(`Video "${file.name}" exceeds the maximum size of 50MB.`);
          return false;
        }
        return true;
      });

      setFormState(prev => ({
        ...prev,
        [field]: validFiles
      }));
    } else {
      setFormState(prev => ({
        ...prev,
        [field]: value
      }));
    }

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
      imagesToDelete: [...(prev.imagesToDelete || []), imageName]
    }));
  };

  const handleRemoveExistingVideo = (videoName) => {
    setFormState(prev => ({
      ...prev,
      existingVideos: prev.existingVideos.filter(vid => vid !== videoName),
      videosToDelete: [...(prev.videosToDelete || []), videoName]
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
      if (!formState.latitude || !formState.longitude) return "Please find the location on the map.";
    }

    if (step === 3) {
      if (!hasValue(formState.title)) return "Please enter a property title.";
      if (!hasValue(formState.price)) return "Please enter the price.";

      const isPlot = ["Plot / Land"].includes(formState.category);
      const isCommercial = formState.propertyType === "Commercial";

      // Validation for Residential (Non-Plot)
      if (!isPlot && !isCommercial) {
        if (!hasValue(formState.bedrooms)) return "Please enter the number of bedrooms.";
        if (!hasValue(formState.bathrooms)) return "Please enter the number of bathrooms.";
      }

      // Validation for Commercial
      if (isCommercial && !isPlot) {
        // Commercial typically needs washrooms (bathrooms field) but not bedrooms
        if (!hasValue(formState.bathrooms)) return "Please enter the number of washrooms.";
      }

      // Validation for Non-Plot (Floors, Age)
      if (!isPlot) {
        const isVillaOrFarm = ["Independent House / Villa", "Farmhouse"].includes(formState.category);

        if (!isVillaOrFarm) {
          if (!hasValue(formState.floorNumber)) return "Please enter the floor number.";
        }

        if (!hasValue(formState.totalFloors)) return "Please enter the total floors.";
        if (!hasValue(formState.propertyAge)) return "Please enter the property age.";
      }

      if (!hasValue(formState.area)) return "Please enter the area.";
      if (!hasValue(formState.description)) return "Please enter the description.";
    }

    if (step === 4) {
      const hasNewImages = formState.images && formState.images.length > 0;
      const hasExistingImages = editMode && formState.existingImages && formState.existingImages.length > 0;
      const hasNewVideos = formState.videos && formState.videos.length > 0;
      const hasExistingVideos = editMode && formState.existingVideos && formState.existingVideos.length > 0;

      if (!hasNewImages && !hasExistingImages && !hasNewVideos && !hasExistingVideos) {
        return "Please upload at least one photo or video.";
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

  const handleFinish = async () => {
    const error = getStepError(currentStep);
    if (error) {
      setStepError(error);
      return;
    }
    setStepError("");

    setIsSubmitting(true);
    try {
      onComplete({
        ...formState
      });
    } catch (e) {
      console.error("Error in finish:", e);
      setStepError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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

              <div className="form-group" style={{ marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={async () => {
                    const fullAddress = `${formState.address}, ${formState.city}, ${formState.state}`;
                    if (!fullAddress.trim() || fullAddress === ", , ") {
                      alert("Please enter a valid address to locate on the map.");
                      return;
                    }

                    try {
                      let coords = await getCoordinates(fullAddress);

                      // Fallback 1: City + State + Pincode
                      if (!coords || !coords.lat || !coords.lon) {
                        const fallback1 = `${formState.city}, ${formState.state} ${formState.pincode}`;
                        coords = await getCoordinates(fallback1);
                      }

                      // Fallback 2: City + State
                      if (!coords || !coords.lat || !coords.lon) {
                        const fallback2 = `${formState.city}, ${formState.state}`;
                        coords = await getCoordinates(fallback2);
                      }

                      // Fallback 3: State only
                      if (!coords || !coords.lat || !coords.lon) {
                        coords = await getCoordinates(formState.state);
                      }

                      if (coords && coords.lat && coords.lon) {
                        setFormState(prev => ({
                          ...prev,
                          latitude: coords.lat,
                          longitude: coords.lon
                        }));
                        setMapCenter([coords.lat, coords.lon]);
                      } else {
                        alert("Could not find coordinates for this address. Please manually enter approximate coordinates or verify spelling.");
                      }
                    } catch (e) {
                      console.error(e);
                      alert("Error geocoding address.");
                    }
                  }}
                  style={{
                    padding: "10px 20px",
                    background: "#0078db",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "600"
                  }}
                >
                  Find on Map
                </button>
              </div>

              {formState.latitude && formState.longitude && (
                <div style={{ marginTop: "20px" }}>
                  <p style={{ marginBottom: "10px", fontSize: "14px", color: "#666" }}>
                    Drag the marker to adjust the exact location of your property.
                  </p>
                  <div
                    style={{ width: "100%", height: "300px", borderRadius: "8px", border: "1px solid #ddd", overflow: "hidden" }}
                  >
                    <MapContainer
                      center={mapCenter || [formState.latitude, formState.longitude]}
                      zoom={15}
                      style={{ height: "100%", width: "100%" }}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      />
                      <MapUpdater center={mapCenter} />
                      <Marker
                        position={[formState.latitude, formState.longitude]}
                        draggable={true}
                        eventHandlers={{
                          dragend: (e) => {
                            const marker = e.target;
                            const position = marker.getLatLng();
                            setFormState(prev => ({
                              ...prev,
                              latitude: position.lat,
                              longitude: position.lng
                            }));
                          },
                        }}
                      />
                    </MapContainer>
                  </div>
                </div>
              )}
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
                    placeholder={formState.propertyType === "Commercial" ? "e.g., Office Space in City Center" : "e.g., 3 BHK Apartment"}
                    value={formState.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>{["Rent / Lease", "PG"].includes(formState.listingType) ? "Monthly Rent" : "Price"}</label>
                  <input
                    type="number"
                    placeholder={["Rent / Lease", "PG"].includes(formState.listingType) ? "Enter monthly rent" : "Enter price"}
                    value={formState.price}
                    onChange={(e) => handleInputChange("price", e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              {/* Conditional Fields based on Property Type & Category */}

              {/* PLOT / LAND specifics */}
              {["Plot / Land"].includes(formState.category) ? (
                <>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Plot Area (sq.ft)</label>
                      <input
                        type="number"
                        placeholder="Enter plot area"
                        value={formState.area}
                        onChange={(e) => handleInputChange("area", e.target.value)}
                        className="form-input"
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Length (ft)</label>
                      <input
                        type="number"
                        placeholder="Enter length"
                        value={formState.length}
                        onChange={(e) => handleInputChange("length", e.target.value)}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>Width (ft)</label>
                      <input
                        type="number"
                        placeholder="Enter width"
                        value={formState.width}
                        onChange={(e) => handleInputChange("width", e.target.value)}
                        className="form-input"
                      />
                    </div>
                  </div>
                </>
              ) : (
                /* RESIDENTIAL (Non-Plot) & COMMERCIAL */
                <>
                  {/* Bedrooms/Bathrooms/Balconies Row */}
                  <div className="form-row">
                    {/* Bedrooms - Hide for Commercial */}
                    {formState.propertyType !== "Commercial" && (
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
                    )}

                    {/* Bathrooms / Washrooms */}
                    <div className="form-group">
                      <label>{formState.propertyType === "Commercial" ? "Washrooms" : "Bathrooms"}</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={formState.bathrooms}
                        onChange={(e) => handleInputChange("bathrooms", e.target.value)}
                        className="form-input"
                      />
                    </div>

                    {/* Balconies - Hide for Commercial */}
                    {formState.propertyType !== "Commercial" && (
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
                    )}
                  </div>

                  {/* Area Row */}
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

                  {/* Floors & Age Row */}
                  <div className="form-row">
                    {/* Floor Number - Hide for Villa/Farmhouse */}
                    {!["Independent House / Villa", "Farmhouse"].includes(formState.category) && (
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
                    )}

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
                        placeholder="e.g., 2 years"
                        value={formState.propertyAge}
                        onChange={(e) => handleInputChange("propertyAge", e.target.value)}
                        className="form-input"
                      />
                    </div>
                  </div>
                </>
              )}

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
                          src={`${API_BASE}/api/properties/images/${encodeURIComponent(img)}`}
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

              {editMode && formState.existingVideos && formState.existingVideos.length > 0 && (
                <div className="files-info" style={{ marginBottom: "12px" }}>
                  <div style={{ fontWeight: 600, marginBottom: "8px" }}>Existing Videos</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                    {formState.existingVideos.map((vid, idx) => (
                      <div key={`${vid}-${idx}`} style={{ position: "relative" }}>
                        <video
                          src={`${API_BASE}/api/properties/videos/${encodeURIComponent(vid)}`}
                          style={{ width: "120px", height: "80px", objectFit: "cover", borderRadius: "6px" }}
                          controls
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveExistingVideo(vid)}
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
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleInputChange("images", e.target.files);
                      }
                      e.target.value = null; // Reset input so same files can be selected again if needed
                    }}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>

              {formState.images && formState.images.length > 0 && (
                <div className="files-info" style={{ marginBottom: "20px" }}>
                  ✅ {formState.images.length} photo(s) selected
                </div>
              )}

              <div className="upload-area">
                <label className="file-input-label">
                  <div className="upload-icon">🎥</div>
                  <span className="upload-text">Click to upload videos / voice-overs</span>
                  <span className="upload-hint">MP4, WebM (Max 50MB each)</span>
                  <input
                    type="file"
                    multiple
                    accept="video/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleInputChange("videos", e.target.files);
                      }
                      e.target.value = null; // Reset input so same file can be selected again if needed
                    }}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>

              {formState.videos && formState.videos.length > 0 && (
                <div className="files-info">
                  ✅ {formState.videos.length} video(s) selected
                </div>
              )}

              <div className="info-box">
                <p>{editMode ? "📌 You can keep existing photos/videos or add new ones." : "📌 Upload at least 1 high-quality photo for better visibility"}</p>
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
