import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendar } from "react-icons/fa";
import "./ManageDetails.css";
import "./Dashboard.css";
import axios from "axios";

const ManageDriver = () => {
  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [totalPayments, setTotalPayments] = useState(0);
  const [paymentDetails, setPaymentDetails] = useState([]);
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  const fetchTotalPayments = async () => {
    try {
      const response = await axios.get(
        "http://localhost:10000/api/driver/manage/total"
      );

      // Extract total_payments value
      setTotalPayments(response.data[0]?.total_payments || 0);
    } catch (error) {
      console.error("Error fetching total payments:", error);
      showAlertMessage("Failed to fetch total payments. Please try again.");
    }
  };

  useEffect(() => {
    fetchTotalPayments();
  }, []);

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const response = await axios.get(
          "http://localhost:10000/api/driver/name"
        );
        setDrivers(response.data);
      } catch (error) {
        console.error("Error fetching drivers:", error);
      }
    };

    fetchDrivers();
  }, []);

  const handleSearch = async () => {
    if (!selectedDriver || !startDate || !endDate) {
      showAlertMessage("Please select a driver and a date range.");
      return;
    }

    try {
      // Format the start and end dates to 'YYYY-MM-DD'
      const formattedStartDate = startDate.toISOString().split("T")[0];
      const formattedEndDate = endDate.toISOString().split("T")[0];

      // Fetch payment details
      const response = await axios.get(
        "http://localhost:10000/api/driver/manage/details",
        {
          params: {
            license_number: "ABC12345", // Replace with the selected driver's license number
            start_date: formattedStartDate,
            end_date: formattedEndDate,
          },
        }
      );

      // Assuming the response contains an array of payment details
      if (response.data.length > 0) {
        setPaymentDetails(response.data);
        // Calculate total payments
        const total = response.data.reduce(
          (acc, payment) => acc + parseFloat(payment.amount),
          0
        );
        setTotalPayments(total);
      } else {
        setPaymentDetails([]);
        setTotalPayments(0);
      }

      setShowModal(true);
    } catch (error) {
      console.error("Error fetching payment details:", error);
      showAlertMessage("Failed to fetch payment details. Please try again.");
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
                  {driver.name} - {driver.license_number}
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker for Start Date */}
          <div className="date-picker-container">
            <label>Select Start Date:</label>
            <div className="date-picker-wrapper">
              <FaCalendar className="date-picker-icon" />
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                dateFormat="yyyy-MM-dd"
                className="date-picker-input"
                placeholderText="Select Start Date"
                selectsStart
                startDate={startDate}
                endDate={endDate}
              />
            </div>
          </div>

          {/* Date Picker for End Date */}
          <div className="date-picker-container">
            <label>Select End Date:</label>
            <div className="date-picker-wrapper">
              <FaCalendar className="date-picker-icon" />
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                dateFormat="yyyy-MM-dd"
                className="date-picker-input"
                placeholderText="Select End Date"
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate} // Ensure end date is not before start date
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
            Total Payments : <br /> {totalPayments} LKR
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
              <h5>Driver Name: {selectedDriver}</h5>
              <h5>
                Selected Date Range:{" "}
                {startDate ? startDate.toLocaleDateString() : "Not selected"} -{" "}
                {endDate ? endDate.toLocaleDateString() : "Not selected"}
              </h5>
              <h5>Total Payments: {totalPayments} LKR</h5>

              <div className="Detail-table-container">
                <table className="Detail-table">
                  <thead>
                    <tr>
                      <th>Payment Date</th>
                      <th>Payment Purpose</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentDetails.length > 0 ? (
                      paymentDetails.map((payment, index) => (
                        <tr key={index}>
                          <td>{payment.payment_date}</td>
                          <td>{payment.purpose}</td>
                          <td>{payment.amount} LKR</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3">No payment details available.</td>
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

export default ManageDriver;
