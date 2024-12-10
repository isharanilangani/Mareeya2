import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Dashboard.css";

function Dashboard() {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const toggleDetails = () => {
    setIsDetailsOpen((prev) => !prev);
  };

  const navigate = useNavigate();

  const handleSignOut = () => {
    console.log("Sign Out button clicked!");
    navigate("/");
  };

  const hasLogo = false;

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

        <div className="dashboard-main">
          <h1>Welcome to the Dashboard</h1>
          <p>
            Manage your fleet and drivers efficiently with our intuitive
            dashboard. Access reports, update details, and keep track of
            performance in just a few clicks.
          </p>
          <p>
            Navigate to specific sections to view vehicle or driver information.
            Ensure smooth operations and stay updated on all activities.
          </p>

          {/* Vehicle Section */}
          <div className="dashboard-section">
            <i className="fa fa-car dashboard-icon" aria-hidden="true"></i>
            <h2>Vehicles</h2>
            <p>
              View and manage all your vehicles, including performance,
              maintenance, and usage details.
            </p>
            <button
              className="dashboard-button"
              onClick={() => navigate("/manageVehicle")}
            >
              Manage Vehicles
            </button>
          </div>

          {/* Driver Section */}
          <div className="dashboard-section">
            <i className="fa fa-user dashboard-icon" aria-hidden="true"></i>
            <h2>Drivers</h2>
            <p>
              Access driver records, schedules, and performance reports for
              better management.
            </p>
            <button
              className="dashboard-button"
              onClick={() => navigate("/manageDriver")}
            >
              Manage Drivers
            </button>
          </div>
        </div>
      </div>
  );
}

export default Dashboard;
