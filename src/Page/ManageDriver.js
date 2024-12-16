import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendar } from "react-icons/fa";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import "./ManageDetails.css";
import "./Dashboard.css";

// Register required Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ManageDriver = () => {
  const drivers = [
    { id: 1, name: "John Doe", license: "LIC12345" },
    { id: 2, name: "Jane Smith", license: "LIC67890" },
    { id: 3, name: "Mark Johnson", license: "LIC54321" },
  ];

  const [selectedDriver, setSelectedDriver] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Example data for the chart
  const chartData = {
    labels: [
      "2024-01-01",
      "2024-01-02",
      "2024-01-03",
      "2024-01-04",
      "2024-01-05",
    ],
    datasets: [
      {
        label: "Payments",
        data: [1200, 1300, 1250, 1400, 1500], // Example payment data
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
      },
    ],
  };

  const handleSearch = () => {
    // Toggle modal visibility
    setShowModal(true);
  };

  const navigate = useNavigate();

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

      <div className="Manage-main">
        <h1 className="Manage-heading">Driver Payments Report</h1>

        <div className="Group-search-bar">
          {/* Driver Selection */}
          <div className="search-bar-container">
            <label>Select Driver:</label>
            <select
              className="driver-select"
              value={selectedDriver}
              onChange={(e) => setSelectedDriver(e.target.value)}
            >
              <option value="">Select Driver</option>
              {drivers.map((driver) => (
                <option key={driver.id} value={driver.name}>
                  {driver.name} - {driver.license}
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker with Calendar Icon */}
          <div className="date-picker-container">
            <label>Select Month:</label>
            <div className="date-picker-wrapper">
              <FaCalendar className="date-picker-icon" />
              <DatePicker
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                dateFormat="MMMM yyyy"
                showMonthYearPicker
                className="date-picker-input"
                placeholderText="Select Month & Year"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button className="action-button" onClick={handleSearch}>
            Search
          </button>
        </div>

        {/* Total Payments Section */}
        <div className="total-expenses-box">
          <p className="total-expenses-text">
            Total Payments : <br /> 0 LKR
          </p>
        </div>
      </div>

      {/* Custom Modal for displaying selected details and bar chart */}
      {showModal && (
        <div
          className="custom-modal-overlay"
          onClick={() => setShowModal(false)}
        >
          <div className="custom-modal" onClick={(e) => e.stopPropagation()}>
            <div className="custom-modal-header">
              <h5>Payment Details</h5>
              <button
                onClick={() => setShowModal(false)}
                className="close-modal-btn"
              >
                X
              </button>
            </div>
            <div className="custom-modal-body">
              <h5>Driver Name: {selectedDriver}</h5>
              <h5>
                Selected Month:{" "}
                {selectedDate
                  ? selectedDate.toLocaleString("default", {
                      month: "long",
                      year: "numeric",
                    })
                  : "Not selected"}
              </h5>
              <h5>Total Payments: 0 LKR</h5>

              {/* Bar Chart for Payments */}
              <Bar data={chartData} options={{ responsive: true }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageDriver;
