import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendar } from "react-icons/fa";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import "./ManageDetails.css";
import "./Dashboard.css";

// Register Chart.js scales
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ManageVehicle = () => {
  const vehicles = [
    { id: 1, number: "AB123CD" },
    { id: 2, number: "EF456GH" },
    { id: 3, number: "IJ789KL" },
  ];

  const [selectedVehicle, setSelectedVehicle] = useState("");
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
        label: "Expenses",
        data: [100, 150, 120, 180, 90], // Example cost data
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const handleSearch = () => {
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
        <h1 className="Manage-heading">Manage Vehicles</h1>

        <div className="Group-search-bar">
          {/* Vehicle Selection */}
          <div className="search-bar-container">
            <label>Select Vehicle Number:</label>
            <select
              className="Manage-select"
              value={selectedVehicle}
              onChange={(e) => setSelectedVehicle(e.target.value)}
            >
              <option value="">Select Vehicle Number</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.number}>
                  {vehicle.number}
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker with Calendar Icon */}
          <div className="date-picker-container">
            <label>Select Date:</label>
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

        {/* Total Expenses Section */}
        <div className="total-expenses-box">
          <p className="total-expenses-text">
            Total Expenses : <br /> 0 LKR
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
              <h5>Search Results</h5>
              <button
                onClick={() => setShowModal(false)}
                className="close-modal-btn"
              >
                X
              </button>
            </div>
            <div className="custom-modal-body">
              <h5>Vehicle Number: {selectedVehicle}</h5>
              <h5>
                Selected Month:{" "}
                {selectedDate
                  ? selectedDate.toLocaleString("default", {
                      month: "long",
                      year: "numeric",
                    })
                  : "Not selected"}
              </h5>
              <h5>Total Expenses: 0 LKR</h5>

              {/* Bar Chart for Costs */}
              <Bar data={chartData} options={{ responsive: true }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageVehicle;
