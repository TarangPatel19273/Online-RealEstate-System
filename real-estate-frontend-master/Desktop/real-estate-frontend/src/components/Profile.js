import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { profileService } from "../services/profileService";
import "./Profile.css";

function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    fetchProfile(token);
  }, [navigate]);

  const fetchProfile = async (token) => {
    try {
      setLoading(true);
      setError(null);
      const data = await profileService.getProfile(token);
      setProfile(data);
    } catch (err) {
      setError("Failed to load profile. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditField = (fieldName, currentValue) => {
    setEditingField(fieldName);
    setEditValue(currentValue || "");
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    setEditValue("");
  };

  const handleSaveField = async (fieldName) => {
    if (editValue.trim() === "") {
      setError("Value cannot be empty");
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      const updateData = {
        fullName: profile.fullName,
        mobileNumber: profile.mobileNumber,
        profilePicture: profile.profilePicture,
        bio: profile.bio,
        city: profile.city,
        state: profile.state,
        [fieldName]: editValue,
      };

      const updatedProfile = await profileService.updateProfile(
        token,
        updateData
      );
      setProfile(updatedProfile);
      setEditingField(null);
      setSuccess(`${fieldName} updated successfully!`);
      setTimeout(() => setSuccess(null), 3000);

      // Update user in localStorage
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const updatedUser = { ...storedUser, ...updatedProfile };
      localStorage.setItem("user", JSON.stringify(updatedUser));
    } catch (err) {
      setError("Failed to update profile. Please try again.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="profile-page">
          <div className="loading-container">
            <p>Loading profile...</p>
          </div>
        </div>
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <Navbar />
        <div className="profile-page">
          <div className="error-container">
            <p>Profile not found</p>
          </div>
        </div>
      </>
    );
  }

  const getInitial = () => {
    if (profile.fullName) {
      return profile.fullName.charAt(0).toUpperCase();
    }
    return profile.username ? profile.username.charAt(0).toUpperCase() : "U";
  };

  const renderEditableField = (label, fieldName, value, type = "text") => {
    const isEditing = editingField === fieldName;

    return (
      <div key={fieldName} className="profile-field">
        <div className="field-label">{label}</div>
        {isEditing ? (
          <div className="field-edit-mode">
            {type === "textarea" ? (
              <textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                placeholder={`Enter your ${label.toLowerCase()}`}
                rows="3"
              />
            ) : (
              <input
                type={type}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                placeholder={`Enter your ${label.toLowerCase()}`}
              />
            )}
            <div className="field-actions">
              <button
                className="btn-save"
                onClick={() => handleSaveField(fieldName)}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                className="btn-cancel"
                onClick={handleCancelEdit}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="field-display-mode">
            <p className="field-value">
              {value && value.trim() ? value : "Not provided"}
            </p>
            <button
              className="btn-edit"
              onClick={() => handleEditField(fieldName, value)}
            >
              Edit
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <Navbar />
      <div className="profile-page">
        <div className="profile-content">
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          {/* Profile Header */}
          <div className="profile-header-section">
            <div className="profile-avatar">
              {profile.profilePicture ? (
                <img src={profile.profilePicture} alt="Profile" />
              ) : (
                <span className="avatar-initial">{getInitial()}</span>
              )}
            </div>
            <div className="profile-header-info">
              <h1>{profile.fullName || profile.username}</h1>
              <p className="username">@{profile.username}</p>
              <p className="email">{profile.email}</p>
            </div>
          </div>

          {/* Account Section */}
          <div className="profile-section">
            <h2 className="section-title">Account Information</h2>
            <div className="section-content">
              <div className="profile-field">
                <div className="field-label">Email Address</div>
                <div className="field-display-mode">
                  <p className="field-value">{profile.email}</p>
                  <span className="info-badge">Cannot be changed</span>
                </div>
              </div>

              <div className="profile-field">
                <div className="field-label">Username</div>
                <div className="field-display-mode">
                  <p className="field-value">@{profile.username}</p>
                  <span className="info-badge">Cannot be changed</span>
                </div>
              </div>
            </div>
          </div>

          {/* Personal Information Section */}
          <div className="profile-section">
            <h2 className="section-title">Personal Information</h2>
            <div className="section-content">
              {renderEditableField("Full Name", "fullName", profile.fullName)}
              {renderEditableField(
                "Mobile Number",
                "mobileNumber",
                profile.mobileNumber,
                "tel"
              )}
              {renderEditableField("Bio", "bio", profile.bio, "textarea")}
              {renderEditableField("City", "city", profile.city)}
              {renderEditableField("State", "state", profile.state)}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Profile;

