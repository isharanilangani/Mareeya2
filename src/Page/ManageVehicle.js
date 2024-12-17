import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendar } from "react-icons/fa";
import "./ManageDetails.css";
import "./Dashboard.css";
import axios from "axios";

const ManageVehicle = () => {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [, setSelectedVehicleNumber] = useState("");
  const [dateRange, setDateRange] = useState([null, null]);
  const [showModal, setShowModal] = useState(false);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [expensesDetails, setExpensesDetails] = useState([]);
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false); // Calendar visibility state

  useEffect(() => {
    const fetchTotalExpenses = async () => {
      try {
        const response = await axios.get(
          "http://localhost:10000/api/vehicle/manage/total"
        );
        setTotalExpenses(response.data[0]?.total_expenses || 0);
      } catch (error) {
        console.error("Error fetching total expenses:", error);
        showAlertMessage(error.response?.data?.message || "Failed to fetch total expenses. Please try again.");
      }
    };

    fetchTotalExpenses();
  }, []); 

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await axios.get(
          "http://localhost:10000/api/vehicle/numbers"
        );
        setVehicles(response.data);
      } catch (error) {
        console.error("Error fetching vehicles:", error);
      }
    };

    fetchVehicles();
  }, []);

  const handleSearch = async () => {
    const [startDate, endDate] = dateRange;
    if (!selectedVehicle || !startDate || !endDate) {
      showAlertMessage("Please select a driver and a date range.");
      return;
    }

    try {
      // Format the start and end dates to 'YYYY-MM-DD'
      const formattedStartDate = startDate.toISOString().split("T")[0];
      const formattedEndDate = endDate.toISOString().split("T")[0];

      const requestBody = {
        vehicle_number: selectedVehicle,
        start_date: formattedStartDate,
        end_date: formattedEndDate,
      };

      // Make the API request with a POST method
      const response = await axios.post(
        "http://localhost:10000/api/vehicle/manage/details",
        requestBody
      );

      console.log("Requesting with body:", requestBody);

      // Check if response contains payments data
      if (response.data.payments && response.data.payments.length > 0) {
        setExpensesDetails(response.data.payments); // Set payments array to state
        setTotalExpenses(response.data.total_payments); // Set total payments
      } else {
        setExpensesDetails([]); // No payments found
        setTotalExpenses(0);
      }

      setShowModal(true); // Show modal with payment details
    } catch (error) {
      console.error("Error fetching expenses details:", error);
      showAlertMessage(error.response?.data?.message || "No expenses details.");
    }
  };

  const showAlertMessage = (message) => {
    setAlertMessage(message);
    setShowAlert(true);
    setTimeout(() => {
      setShowAlert(false);
    }, 1000);
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
        <h1 className="Manage-heading">Vehicle Expenses Report</h1>

        <div className="Group-search-bar">
          {/* Driver Selection */}
          <div className="search-bar-container">
            <label>Select Vehicle:</label>
            <select
              className="driver-select"
              value={selectedVehicle}
              onChange={(e) => {
                const vehicleNumber = e.target.value;
                setSelectedVehicle(vehicleNumber);

                // Find the selected driver's license number
                const selectedVehicleObj = vehicles.find(
                  (vehicle) => vehicle.vehicleNumber === vehicleNumber
                );
                setSelectedVehicleNumber(
                  selectedVehicleObj ? selectedVehicleObj.vehicle_number : ""
                );
              }}
            >
              <option value="">Select Vehicle</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.vehicle_number}>
                  {vehicle.vehicle_number}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Picker */}
          <div className="date-picker-container">
            <label>Select Date Range:</label>
            <div
              className="date-picker-wrapper"
              onClick={() => setCalendarOpen(true)}
            >
              <FaCalendar className="date-picker-icon" />
              <input
                type="text"
                className="date-picker-input"
                value={
                  dateRange[0] && dateRange[1]
                    ? `${dateRange[0].toLocaleDateString()} - ${dateRange[1].toLocaleDateString()}`
                    : "Select Date Range"
                }
                readOnly
              />
            </div>
            {calendarOpen && (
              <DatePicker
                selected={dateRange[0]}
                onChange={(update) => {
                  setDateRange(update);
                  setCalendarOpen(false); // Close the calendar after selecting the date range
                }}
                startDate={dateRange[0]}
                endDate={dateRange[1]}
                selectsRange
                inline
                dateFormat="yyyy-MM-dd"
                onClickOutside={() => setCalendarOpen(false)} // Close when clicking outside
              />
            )}
          </div>

          {/* Submit Button */}
          <button className="action-button" onClick={handleSearch}>
            Search
          </button>
        </div>

        {/* Total Payments Section */}
        <div className="total-expenses-box">
          <p className="total-expenses-text">
            Total Expenses : <br /> {totalExpenses} LKR
          </p>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="custom-modal-overlay"
          onClick={() => setShowModal(false)}
        >
          <div className="custom-modal" onClick={(e) => e.stopPropagation()}>
            <div className="custom-modal-header">
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
                Selected Date Range:{" "}
                {dateRange[0]
                  ? dateRange[0].toLocaleDateString()
                  : "Not selected"}{" "}
                -{" "}
                {dateRange[1]
                  ? dateRange[1].toLocaleDateString()
                  : "Not selected"}
              </h5>
              <h5>Total Payments: {totalExpenses} LKR</h5>
              <div className="Detail-table-container">
                <table className="Detail-table">
                  <thead>
                    <tr>
                      <th>Payment Date</th>
                      <th>Payment Purpose</th>
                      <th>Amount (LKR)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expensesDetails.length > 0 ? (
                      expensesDetails.map((payments, index) => (
                        <tr key={index}>
                          <td>{payments.payment_date}</td>
                          <td>{payments.description}</td>
                          <td>{payments.amount} LKR</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3">No Expenses details available.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alert Modal */}
      {showAlert && (
        <div
          className="custom-modal-overlay"
          onClick={() => setShowAlert(false)}
        >
          <div
            className="custom-modal alert-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="custom-modal-body">
              <p>{alertMessage}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageVehicle;
