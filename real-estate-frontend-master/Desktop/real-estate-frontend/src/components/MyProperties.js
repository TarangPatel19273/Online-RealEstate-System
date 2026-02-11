import React, { useEffect, useState } from "react";
import propertyService, { deleteProperty, updateProperty } from "../services/propertyService";
import Navbar from "./Navbar";
import { useNavigate } from "react-router-dom";

const MyProperties = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchMyProperties = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Please login to view your properties");
          setLoading(false);
          return;
        }

        const response = await propertyService.getMyProperties();

        console.log("My properties data received:", response.data);
        const data = response.data || [];
        setProperties(data);

        // Initialize image index for each property
        const initialIndexes = {};
        data.forEach(property => {
          initialIndexes[property.id] = 0;
        });
        setCurrentImageIndex(initialIndexes);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching my properties:", err);
        setError("Failed to load your properties");
        setLoading(false);
      }
    };

    fetchMyProperties();
  }, []);

  const handleNextImage = (propertyId, totalImages) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [propertyId]: (prev[propertyId] + 1) % totalImages
    }));
  };

  const handlePrevImage = (propertyId, totalImages) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [propertyId]: (prev[propertyId] - 1 + totalImages) % totalImages
    }));
  };

  const handleDelete = async (propertyId) => {
    if (!window.confirm("Are you sure you want to delete this property?")) {
      return;
    }

    try {
      await deleteProperty(propertyId);
      setProperties(prev => prev.filter(p => p.id !== propertyId));
      alert("Property deleted successfully");
    } catch (err) {
      console.error("Error deleting property:", err);
      alert(err.response?.data || "Failed to delete property");
    }
  };

  const [newImages, setNewImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);

  const handleEditClick = (property) => {
    navigate("/sell-property", { state: { editProperty: property } });
  };

  const handleRemoveImage = (imageName) => {
    setImagesToDelete(prev => [...prev, imageName]);
    setEditData(prev => ({
      ...prev,
      currentImages: prev.currentImages.filter(img => img !== imageName)
    }));
  };

  const handleSaveEdit = async (propertyId) => {
    console.log("Saving edit for propertyId:", propertyId, "Data:", editData);
    try {
      setUpdating(true);

      const formData = new FormData();
      formData.append("title", editData.title);
      formData.append("price", editData.price);
      formData.append("location", editData.location);
      formData.append("description", editData.description);
      formData.append("contactNumber", editData.contactNumber);
      formData.append("type", editData.type);
      formData.append("category", editData.category);

      // Append images to delete
      if (imagesToDelete.length > 0) {
        imagesToDelete.forEach(img => {
          formData.append("imagesToDelete", img);
        });
      }

      // Append new images
      for (let i = 0; i < newImages.length; i++) {
        formData.append("images", newImages[i]);
      }

      const response = await updateProperty(propertyId, formData);
      console.log("Update success:", response);

      // Update the property in the list with the returned data
      setProperties(prev => prev.map(p => {
        if (p.id === propertyId) {
          return {
            ...p,
            title: response.data.title || p.title,
            price: response.data.price || p.price,
            location: response.data.location || p.location,
            description: response.data.description || p.description,
            contactNumber: response.data.contactNumber || p.contactNumber,
            type: response.data.type || p.type,
            category: response.data.category || p.category,
            imageUrls: response.data.imageUrls || p.imageUrls
          };
        }
        return p;
      }));

      setEditingId(null);
      setEditData({});
      setNewImages([]);
      setImagesToDelete([]);
      alert("Property updated successfully");
    } catch (err) {
      console.error("Error updating property:", err);
      const errorMsg = typeof err.response?.data === 'string'
        ? err.response.data
        : err.response?.data?.message || "Failed to update property";
      alert(errorMsg);
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div style={{ padding: "20px", textAlign: "center" }}>
          <p>Loading your properties...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <div style={{ padding: "20px", textAlign: "center", color: "red" }}>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <Navbar />
      <h2>My Properties</h2>
      <p style={{ color: "#666", marginBottom: "20px" }}>
        Properties you have uploaded ({properties.length})
      </p>

      {properties.length === 0 ? (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
          <p style={{ color: "#999", fontSize: "18px" }}>
            You haven't uploaded any properties yet.
          </p>
          <p style={{ color: "#666", marginTop: "10px" }}>
            Click "For Sellers" to upload your first property!
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "20px"
          }}
        >
          {properties.map(property => {
            const currentIndex = currentImageIndex[property.id] || 0;
            const hasImages = property.imageUrls && property.imageUrls.length > 0;
            const totalImages = hasImages ? property.imageUrls.length : 0;

            return (
              <div
                key={property.id}
                style={{
                  border: "1px solid #ccc",
                  padding: "10px",
                  borderRadius: "8px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  position: "relative"
                }}
              >
                {/* ✅ IMAGE CAROUSEL */}
                {hasImages ? (
                  <div style={{ position: "relative", marginBottom: "10px" }}>
                    <img
                      src={`http://localhost:8080/api/properties/images/${encodeURIComponent(property.imageUrls[currentIndex])}`}
                      alt={property.title}
                      style={{
                        width: "100%",
                        height: "200px",
                        objectFit: "cover",
                        borderRadius: "6px"
                      }}
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/300x200?text=No+Image";
                      }}
                    />

                    {/* Navigation Arrows - Only show if multiple images */}
                    {totalImages > 1 && (
                      <>
                        <button
                          onClick={() => handlePrevImage(property.id, totalImages)}
                          style={{
                            position: "absolute",
                            left: "10px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            backgroundColor: "rgba(0, 0, 0, 0.5)",
                            color: "white",
                            border: "none",
                            borderRadius: "50%",
                            width: "35px",
                            height: "35px",
                            cursor: "pointer",
                            fontSize: "18px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                        >
                          ‹
                        </button>
                        <button
                          onClick={() => handleNextImage(property.id, totalImages)}
                          style={{
                            position: "absolute",
                            right: "10px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            backgroundColor: "rgba(0, 0, 0, 0.5)",
                            color: "white",
                            border: "none",
                            borderRadius: "50%",
                            width: "35px",
                            height: "35px",
                            cursor: "pointer",
                            fontSize: "18px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                        >
                          ›
                        </button>

                        {/* Image Counter */}
                        <div
                          style={{
                            position: "absolute",
                            bottom: "10px",
                            right: "10px",
                            backgroundColor: "rgba(0, 0, 0, 0.6)",
                            color: "white",
                            padding: "4px 8px",
                            borderRadius: "12px",
                            fontSize: "12px"
                          }}
                        >
                          {currentIndex + 1} / {totalImages}
                        </div>

                        {/* Dot Indicators */}
                        <div
                          style={{
                            position: "absolute",
                            bottom: "10px",
                            left: "50%",
                            transform: "translateX(-50%)",
                            display: "flex",
                            gap: "5px"
                          }}
                        >
                          {property.imageUrls.map((_, index) => (
                            <div
                              key={index}
                              onClick={() => setCurrentImageIndex(prev => ({
                                ...prev,
                                [property.id]: index
                              }))}
                              style={{
                                width: "8px",
                                height: "8px",
                                borderRadius: "50%",
                                backgroundColor: index === currentIndex ? "white" : "rgba(255, 255, 255, 0.5)",
                                cursor: "pointer",
                                transition: "all 0.3s"
                              }}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div style={{
                    width: "100%",
                    height: "200px",
                    backgroundColor: "#f0f0f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "6px",
                    marginBottom: "10px"
                  }}>
                    No Image Available
                  </div>
                )}

                <h3 style={{ margin: "10px 0" }}>{property.title}</h3>
                <p><b>Price:</b> ₹{property.price}</p>
                <p><b>Location:</b> {property.location}</p>
                <p style={{ color: "#666" }}>{property.description}</p>

                {/* Edit / Delete Buttons */}
                <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                  {editingId === property.id ? (
                    <>
                      <button
                        onClick={() => handleSaveEdit(property.id)}
                        disabled={updating}
                        style={{
                          flex: 1,
                          padding: "8px",
                          backgroundColor: "#28a745",
                          color: "white",
                          border: "none",
                          borderRadius: "5px",
                          cursor: "pointer",
                          fontWeight: "600"
                        }}
                      >
                        {updating ? "Saving..." : "Save"}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        style={{
                          flex: 1,
                          padding: "8px",
                          backgroundColor: "#6c757d",
                          color: "white",
                          border: "none",
                          borderRadius: "5px",
                          cursor: "pointer",
                          fontWeight: "600"
                        }}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEditClick(property)}
                        style={{
                          flex: 1,
                          padding: "8px",
                          backgroundColor: "#007bff",
                          color: "white",
                          border: "none",
                          borderRadius: "5px",
                          cursor: "pointer",
                          fontWeight: "600"
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(property.id)}
                        style={{
                          flex: 1,
                          padding: "8px",
                          backgroundColor: "#dc3545",
                          color: "white",
                          border: "none",
                          borderRadius: "5px",
                          cursor: "pointer",
                          fontWeight: "600"
                        }}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>

                {/* Edit Form */}
                {editingId === property.id && (
                  <div style={{
                    marginTop: "15px",
                    padding: "15px",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "8px",
                    border: "1px solid #dee2e6"
                  }}>
                    <h5>Edit Property</h5>

                    <div style={{ marginBottom: "10px" }}>
                      <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>Title</label>
                      <input
                        type="text"
                        value={editData.title || ""}
                        onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "8px",
                          borderRadius: "4px",
                          border: "1px solid #ccc",
                          boxSizing: "border-box"
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: "10px" }}>
                      <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>Price</label>
                      <input
                        type="text"
                        value={editData.price || ""}
                        onChange={(e) => setEditData({ ...editData, price: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "8px",
                          borderRadius: "4px",
                          border: "1px solid #ccc",
                          boxSizing: "border-box"
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: "10px", display: "flex", gap: "10px" }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>Type</label>
                        <select
                          value={editData.type || "Sell"}
                          onChange={(e) => setEditData({ ...editData, type: e.target.value })}
                          style={{
                            width: "100%",
                            padding: "8px",
                            borderRadius: "4px",
                            border: "1px solid #ccc",
                            boxSizing: "border-box"
                          }}
                        >
                          <option value="Sell">Sell</option>
                          <option value="Rent">Rent</option>
                        </select>
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>Category</label>
                        <select
                          value={editData.category || "Residential"}
                          onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                          style={{
                            width: "100%",
                            padding: "8px",
                            borderRadius: "4px",
                            border: "1px solid #ccc",
                            boxSizing: "border-box"
                          }}
                        >
                          <option value="Residential">Residential</option>
                          <option value="Commercial">Commercial</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ marginBottom: "10px" }}>
                      <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>Location</label>
                      <input
                        type="text"
                        value={editData.location || ""}
                        onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "8px",
                          borderRadius: "4px",
                          border: "1px solid #ccc",
                          boxSizing: "border-box"
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: "10px" }}>
                      <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>Contact Number</label>
                      <input
                        type="tel"
                        value={editData.contactNumber || ""}
                        onChange={(e) => setEditData({ ...editData, contactNumber: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "8px",
                          borderRadius: "4px",
                          border: "1px solid #ccc",
                          boxSizing: "border-box"
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>Description</label>
                      <textarea
                        value={editData.description || ""}
                        onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "8px",
                          borderRadius: "4px",
                          border: "1px solid #ccc",
                          boxSizing: "border-box",
                          minHeight: "80px",
                          fontFamily: "inherit"
                        }}
                      />
                    </div>

                    {editData.currentImages && editData.currentImages.length > 0 && (
                      <div style={{ marginTop: "10px" }}>
                        <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>Manage Photos</label>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                          {editData.currentImages.map((img, index) => (
                            <div key={index} style={{ position: "relative" }}>
                              <img
                                src={`http://localhost:8080/api/properties/images/${encodeURIComponent(img)}`}
                                alt="property"
                                style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "4px" }}
                              />
                              <button
                                onClick={() => handleRemoveImage(img)}
                                style={{
                                  position: "absolute",
                                  top: "-5px",
                                  right: "-5px",
                                  background: "red",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "50%",
                                  width: "18px",
                                  height: "18px",
                                  cursor: "pointer",
                                  fontSize: "12px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center"
                                }}
                              >
                                &times;
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div style={{ marginTop: "10px" }}>
                      <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>Add Photos</label>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => setNewImages(e.target.files)}
                        style={{
                          width: "100%",
                          padding: "8px"
                        }}
                      />
                      {newImages && newImages.length > 0 && (
                        <div style={{ fontSize: "12px", color: "green", marginTop: "4px" }}>
                          {newImages.length} new photos selected
                        </div>
                      )}
                    </div>
                  </div>
                )
                }
              </div>
            );
          })}
        </div>
      )
      }
    </div >
  );
};

export default MyProperties;
