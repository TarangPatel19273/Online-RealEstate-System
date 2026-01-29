import React, { useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import "./SellProperty.css";

function SellProperty() {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !price || !location || !description || images.length === 0) {
      setMessage("All fields are required");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("price", price);
    formData.append("location", location);
    formData.append("description", description);

    for (let i = 0; i < images.length; i++) {
      formData.append("images", images[i]);
    }

    try {
      setLoading(true);
      setMessage("");

      const token = localStorage.getItem("token");
      if (!token) {
        setMessage("Please login before uploading a property.");
        setLoading(false);
        return;
      }

      await axios.post(
        "http://localhost:8080/api/properties/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage("✅ Property uploaded successfully");
      setTitle("");
      setPrice("");
      setLocation("");
      setDescription("");
      setImages([]);

    } catch (error) {
      setMessage(
        error.response?.data || "❌ Upload failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="sell-property-container">
        <div className="sell-property-wrapper">
          <h2 className="sell-property-title">🏠 Upload Property</h2>

          <form onSubmit={handleSubmit} className="sell-property-form">
            <div className="form-group">
              <label>
                <span className="icon">🏡</span>
                Property Title
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter property title (e.g., Luxury 3BHK Apartment)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>
                <span className="icon">💰</span>
                Price
              </label>
              <input
                type="number"
                className="form-input"
                placeholder="Enter price in rupees"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>
                <span className="icon">📍</span>
                Location
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter location (e.g., Mumbai, Maharashtra)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>
                <span className="icon">📝</span>
                Description
              </label>
              <textarea
                className="form-textarea"
                placeholder="Describe your property (amenities, features, etc.)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>
                <span className="icon">📷</span>
                Property Images
              </label>
              <div className="file-input-wrapper">
                <label className="file-input-label">
                  <span className="upload-icon">📤</span>
                  <span className="upload-text">Click to upload images</span>
                  <span className="upload-hint">Support: JPG, PNG (Max 5MB each)</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setImages(e.target.files)}
                  />
                </label>
                {images.length > 0 && (
                  <div className="files-selected">
                    ✓ {images.length} image{images.length > 1 ? 's' : ''} selected
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="submit-button"
            >
              {loading ? "⏳ Uploading..." : "🚀 Upload Property"}
            </button>
          </form>

          {message && (
            <div className={`message ${message.includes("✅") ? "success" : "error"}`}>
              {message}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default SellProperty;
