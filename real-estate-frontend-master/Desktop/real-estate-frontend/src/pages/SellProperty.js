import React, { useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import "./SellProperty.css";

function SellProperty() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("Sell");
  const [category, setCategory] = useState("Residential");
  const [images, setImages] = useState([]);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !price || !location || !description || images.length === 0) {
      setMessage("⚠️ All fields, including images, are required");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("price", price);
    formData.append("location", location);
    formData.append("description", description);
    formData.append("type", type);
    formData.append("category", category);

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

      // SUCCESS
      setUploadSuccess(true);
      setMessage("");
      // Clear form state
      setTitle("");
      setPrice("");
      setLocation("");
      setDescription("");
      setImages([]);

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
    setMessage("");
  };

  return (
    <>
      <Navbar />

      <div className="sell-property-container">
        <div className="sell-property-wrapper">

          {uploadSuccess ? (
            /* SUCCESS STATE */
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
          ) : (
            /* UPLOAD FORM */
            <>
              <h2 className="sell-property-title">🏠 Post a Property</h2>
              <p className="sell-property-subtitle">Fill in the details to list your property for sale or rent.</p>

              {message && <div className="message error">{message}</div>}

              <form onSubmit={handleSubmit} className="sell-property-form">

                <div className="form-group">
                  <label>Title</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Luxurious 3BHK Apartment in Bandra"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Price (₹)</label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="e.g. 15000"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Location</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Mumbai, Maharashtra"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Property Type</label>
                    <select className="form-input" value={type} onChange={(e) => setType(e.target.value)}>
                      <option value="Sell">Sell (For Sale)</option>
                      <option value="Rent">Rent (For Rent)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Category</label>
                    <select className="form-input" value={category} onChange={(e) => setCategory(e.target.value)}>
                      <option value="Residential">Residential</option>
                      <option value="Commercial">Commercial</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Describe key features, amenities, nearby places..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Property Images</label>
                  <div className="file-input-wrapper">
                    <label className="file-input-label">
                      <div className="upload-icon">📷</div>
                      <span className="upload-text">Click to upload photos</span>
                      <span className="upload-hint">Supported: JPG, PNG (Max 5MB)</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => setImages(e.target.files)}
                        style={{ display: 'none' }}
                      />
                    </label>
                    {images.length > 0 && (
                      <div className="files-selected">
                        ✅ {images.length} file{images.length > 1 ? 's' : ''} selected
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="submit-button"
                >
                  {loading ? "Uploading..." : "Publish Listing"}
                </button>
              </form>
            </>
          )}

        </div>
      </div>
    </>
  );
}

export default SellProperty;

