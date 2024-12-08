import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Dashboard.css";
import "./Settings.css";
import axios from "axios"; 
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css"; // Import Cropper.js CSS

function Settings() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState(null); 

  const navigate = useNavigate();

  // Handle profile picture change
  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    setProfilePicture(file);
  };

  // Trigger input file click when the camera icon is clicked
  const handleCameraClick = () => {
    document.getElementById("profile-picture").click();
  };

  // Handle image cropping
  const handleCrop = () => {
    if (profilePicture) {
      const croppedUrl = cropper.getCroppedCanvas().toDataURL();
      setCroppedImage(croppedUrl);
    }
  };

  // Handle form submit (send data to backend)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!croppedImage) {
      setError("Please crop and select an image.");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("profilePicture", croppedImage); // Send cropped image data
    formData.append("username", username);
    formData.append("password", password);

    try {
      const response = await axios.put("http://localhost:10000/api/auth/update", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("Profile updated:", response.data);
      setLoading(false);
      navigate("/dashboard"); 
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("There was an error updating your profile.");
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    navigate("/");
  };

  const hasLogo = false;

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const toggleDetails = () => {
    setIsDetailsOpen((prev) => !prev);
  };

  let cropper = null;

  return (
    <div className="dashboard-container">
      <aside className="dashboard-sidebar">
        <div className="company-header">
          {hasLogo ? (
            <img
              src="https://via.placeholder.com/60"
              alt="Company Logo"
              className="company-logo"
            />
          ) : (
            <div className="company-icon">
              <i className="fa fa-camera" aria-hidden="true"></i>
            </div>
          )}
          <h2 className="company-name">Mareeya Bakery Milk Center</h2>
        </div>
        <nav>
          <ul>
            <li>
              <Link to="/dashboard">General</Link>
            </li>
            <li>
              <Link to="/settings">Settings</Link>
            </li>
            <li onClick={toggleDetails} className="details-toggle">
              Details
              <i
                className={`fa ${isDetailsOpen ? "fa-chevron-up" : "fa-chevron-down"}`}
                style={{ marginLeft: "10px" }}
              ></i>
            </li>
            {isDetailsOpen && (
              <ul className="nested-list">
                <li>
                  <Link to="/vehicle">Vehicle</Link>
                </li>
                <li>
                  <Link to="/vehicleRepair">Vehicle Repair</Link>
                </li>
                <li>
                  <Link to="/driver">Driver</Link>
                </li>
                <li>
                  <Link to="/driverPayments">Driver Payments</Link>
                </li>
              </ul>
            )}
          </ul>
        </nav>
        <button onClick={handleSignOut} className="sign-out-button">
          <i className="fa fa-sign-out"></i> Sign Out
        </button>
      </aside>

      {/* Main Content */}
      <main className="settings-main">
        <h1>Settings</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <div className="profile-picture">
              <input
                type="file"
                id="profile-picture"
                accept="image/*"
                onChange={handleProfilePictureChange}
                style={{ display: "none" }}
              />
              <div className="camera-icon" onClick={handleCameraClick}>
                <i className="fa fa-camera"></i>
              </div>

              {/* Cropper Preview */}
              {profilePicture && (
                <div className="cropper-container">
                  <Cropper
                    src={URL.createObjectURL(profilePicture)}
                    style={{ height: "400px", width: "100%" }}
                    initialAspectRatio={1}
                    guides={false}
                    scalable={true}
                    zoomable={true}
                    cropBoxResizable={true}
                    onInitialized={(instance) => {
                      cropper = instance;
                    }}
                  />
                  <button type="button" onClick={handleCrop} className="crop-button">
                    Crop Image
                  </button>
                </div>
              )}

              {/* Preview the cropped image */}
              {croppedImage && (
                <div className="image-preview">
                  <img src={croppedImage} alt="Cropped Profile Preview" />
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="username">Change Username</label>
            <input
              type="text"
              id="username"
              placeholder="Enter new username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Change Password</label>
            <input
              type="password"
              id="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="save-button" disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </main>
    </div>
  );
}

export default Settings;
