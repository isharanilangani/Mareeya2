import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Dashboard.css";
import "./Settings.css";

function Settings() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);

  const handleProfilePictureChange = (e) => {
    setProfilePicture(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log("Username:", username);
    console.log("Password:", password);
    console.log("Profile Picture:", profilePicture);
  };

  const navigate = useNavigate();

  const handleSignOut = () => {
    navigate("/");
  };

  const hasLogo = false;

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const toggleDetails = () => {
    setIsDetailsOpen((prev) => !prev);
  };

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
                className={`fa ${
                  isDetailsOpen ? "fa-chevron-up" : "fa-chevron-down"
                }`}
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
              />
              <div className="camera-icon">
                <i className="fa fa-camera"></i>
              </div>
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

          <button type="submit" className="save-button">
            Save Changes
          </button>
        </form>
      </main>
    </div>
  );
}

export default Settings;
