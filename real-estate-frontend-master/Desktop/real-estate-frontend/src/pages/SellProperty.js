import React, { useEffect, useState } from "react";
import propertyService from "../services/propertyService";
import Navbar from "../components/Navbar";
import PropertyListingForm from "../components/PropertyListingForm";
import PropertyFormStepper from "../components/PropertyFormStepper";
import { useNavigate, useLocation } from "react-router-dom";
import "./SellProperty.css";

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

const resolveCategory = (value) => {
  const allowed = [
    "Flat/Apartment",
    "Independent House / Villa",
    "Builder Floor",
    "Plot / Land",
    "1 RK/Studio Apartment",
    "Serviced Apartment",
    "Farmhouse",
    "Other"
  ];
  return allowed.includes(value) ? value : "Flat/Apartment";
};

const mapEditPropertyToFormData = (property) => {
  const propertyType = property.category === "Commercial" ? "Commercial" : "Residential";
  return {
    propertyId: property.id,
    listingType: property.type || "Sell",
    propertyType,
    category: resolveCategory(property.category),
    userType: property.userType || "Owner",
    title: property.title || "",
    location: property.location || "",
    address: property.address || "",
    city: property.city || "",
    state: property.state || "",
    pincode: property.pincode || "",
    bedrooms: property.bedrooms || "",
    bathrooms: property.bathrooms || "",
    balconies: property.balconies || "",
    area: property.area || "",
    carpetArea: property.carpetArea || "",
    floorNumber: property.floorNumber || "",
    totalFloors: property.totalFloors || "",
    propertyAge: property.propertyAge || "",
    description: property.description || "",
    amenities: normalizeAmenities(property.amenities),
    contactNumber: property.contactNumber || "",
    existingImages: property.imageUrls || [],
    imagesToDelete: []
  };
};

function SellProperty() {
  const navigate = useNavigate();
  const location = useLocation();

  const [showStepper, setShowStepper] = useState(false);
  const [initialFormData, setInitialFormData] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingPropertyId, setEditingPropertyId] = useState(null);

  useEffect(() => {
    const editProperty = location.state?.editProperty;
    if (editProperty) {
      setInitialFormData(mapEditPropertyToFormData(editProperty));
      setEditingPropertyId(editProperty.id);
      setIsEditing(true);
      setShowStepper(true);
      setMessage("");
    }
  }, [location.state]);

  const handleListingFormSubmit = (formDataFromModal) => {
    setInitialFormData(formDataFromModal);
    setShowStepper(true);
    setMessage("");
  };

  const handleStepperBack = () => {
    setShowStepper(false);
  };

  const handleFormComplete = async (completedFormData) => {
    try {
      setLoading(true);
      setMessage("");

      const token = localStorage.getItem("token");
      if (!token) {
        setMessage("❌ Please login before uploading a property.");
        setLoading(false);
        return;
      }

      const formDataToSubmit = new FormData();
      const locationText = [
        completedFormData.address,
        completedFormData.city,
        completedFormData.state
      ].filter(Boolean).join(", ");
      const resolvedLocation = locationText || completedFormData.location || "";

      formDataToSubmit.append("title", completedFormData.title || "");
      formDataToSubmit.append("price", completedFormData.price || "");
      formDataToSubmit.append("location", resolvedLocation);
      formDataToSubmit.append("address", completedFormData.address || "");
      formDataToSubmit.append("city", completedFormData.city || "");
      formDataToSubmit.append("state", completedFormData.state || "");
      formDataToSubmit.append("pincode", completedFormData.pincode || "");
      formDataToSubmit.append("description", completedFormData.description || "");
      formDataToSubmit.append("contactNumber", completedFormData.contactNumber || "");
      formDataToSubmit.append("type", completedFormData.listingType || "Sell");
      formDataToSubmit.append("category", completedFormData.category || "Residential");
      formDataToSubmit.append("userType", completedFormData.userType || "Owner");
      formDataToSubmit.append("bedrooms", completedFormData.bedrooms || "");
      formDataToSubmit.append("bathrooms", completedFormData.bathrooms || "");
      formDataToSubmit.append("balconies", completedFormData.balconies || "");
      formDataToSubmit.append("area", completedFormData.area || "");
      formDataToSubmit.append("carpetArea", completedFormData.carpetArea || "");
      formDataToSubmit.append("floorNumber", completedFormData.floorNumber || "");
      formDataToSubmit.append("totalFloors", completedFormData.totalFloors || "");
      formDataToSubmit.append("propertyAge", completedFormData.propertyAge || "");

      if (completedFormData.amenities && completedFormData.amenities.length > 0) {
        completedFormData.amenities.forEach((amenity) => {
          formDataToSubmit.append("amenities", amenity);
        });
      }

      if (completedFormData.images && completedFormData.images.length > 0) {
        for (let i = 0; i < completedFormData.images.length; i++) {
          formDataToSubmit.append("images", completedFormData.images[i]);
        }
      }

      if (completedFormData.imagesToDelete && completedFormData.imagesToDelete.length > 0) {
        completedFormData.imagesToDelete.forEach((img) => {
          formDataToSubmit.append("imagesToDelete", img);
        });
      }

      if (isEditing && editingPropertyId) {
        await propertyService.updateProperty(editingPropertyId, formDataToSubmit);
      } else {
        await propertyService.uploadProperty(formDataToSubmit);
      }

      setUploadSuccess(true);
      setShowStepper(false);
    } catch (error) {
      setMessage(
        error.response?.data || "❌ Upload failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setUploadSuccess(false);
    setShowStepper(false);
    setInitialFormData(null);
    setMessage("");
    setIsEditing(false);
    setEditingPropertyId(null);
  };

  return (
    <>
      <Navbar />

      {message && <div className="message error">{message}</div>}

      {uploadSuccess ? (
        <div className="sell-property-container">
          <div className="sell-property-wrapper">
            <div className="success-card">
              <div className="success-icon">🎉</div>
              <h2 className="success-title">Property Uploaded Successfully!</h2>
              <p className="success-desc">Your property listing is now live and visible to potential buyers/tenants.</p>

              <div className="success-actions">
                <button className="btn-dashboard" onClick={() => navigate("/my-properties")}>
                  Go to My Dashboard
                </button>
                <button className="btn-upload-more" onClick={handleReset}>
                  Upload Another
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : showStepper ? (
        <PropertyFormStepper
          formData={initialFormData || {}}
          onComplete={handleFormComplete}
          onBack={handleStepperBack}
          loading={loading}
          editMode={isEditing}
        />
      ) : (
        <PropertyListingForm onSubmit={handleListingFormSubmit} />
      )}
    </>
  );
}

export default SellProperty;
