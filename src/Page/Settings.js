import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Dashboard.css";
import "./Settings.css";
import axios from "axios";

function Settings() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const navigate = useNavigate();

  // Handle form submit (send data to backend)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await axios.put("http://localhost:10000/api/auth/update", {
        username,
        password,
        userId: "14",
      });

      setLoading(false);
      setIsModalOpen(true); // Open modal on success
    } catch (err) {
      setLoading(false);
      if (err.response) {
        // Server responded with an error
        setError(err.response.data.message || "Update failed.");
      } else if (err.request) {
        // Request was made but no response received
        setError("No response from the server. Please try again.");
      } else {
        // Something else happened
        setError("An unexpected error occurred.");
      }
    }
  };

  // Close modal and refresh page
  const handleModalClose = () => {
    setIsModalOpen(false);
    window.location.reload();
  };

  const handleSignOut = () => {
    navigate("/");
  };

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const toggleDetails = () => {
    setIsDetailsOpen((prev) => !prev);
  };

  return (
    <div className="dashboard-container">
      <aside className="dashboard-sidebar">
        <div className="company-header">
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

      {/* Modal */}
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <p>Profile updated successfully!</p>
            <button onClick={handleModalClose} className="save-button">
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Settings;
