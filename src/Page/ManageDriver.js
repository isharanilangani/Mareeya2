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
  const [selectedLicense, setSelectedLicense] = useState("");
  const [dateRange, setDateRange] = useState([null, null]);
  const [showModal, setShowModal] = useState(false);
  const [totalPayments, setTotalPayments] = useState(0);
  const [paymentDetails, setPaymentDetails] = useState([]);
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false); // Calendar visibility state

  useEffect(() => {
    const fetchTotalPayments = async () => {
      try {
        const response = await axios.get(
          "http://localhost:10000/api/driver/manage/total"
        );
        setTotalPayments(response.data[0]?.total_payments || 0);
      } catch (error) {
        console.error("Error fetching total payments:", error);
        showAlertMessage(error.response?.data?.message || "Failed to fetch total payments. Please try again.");
      }
    };

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
    const [startDate, endDate] = dateRange;
    if (!selectedDriver || !startDate || !endDate) {
      showAlertMessage("Please select a driver and a date range.");
      return;
    }

    try {
      // Format the start and end dates to 'YYYY-MM-DD'
      const formattedStartDate = startDate.toISOString().split("T")[0];
      const formattedEndDate = endDate.toISOString().split("T")[0];

      const requestBody = {
        license_number: selectedLicense,
        start_date: formattedStartDate,
        end_date: formattedEndDate,
      };

      // Make the API request with a POST method
      const response = await axios.post(
        "http://localhost:10000/api/driver/manage/details",
        requestBody
      );

      console.log("Requesting with body:", requestBody);

      // Check if response contains payments data
      if (response.data.payments && response.data.payments.length > 0) {
        setPaymentDetails(response.data.payments); // Set payments array to state
        setTotalPayments(response.data.total_payments); // Set total payments
      } else {
        setPaymentDetails([]); // No payments found
        setTotalPayments(0);
      }

      setShowModal(true); // Show modal with payment details
    } catch (error) {
      console.error("Error fetching payment details:", error);
      showAlertMessage(error.response?.data?.message || "No Payments details.");
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
              onChange={(e) => {
                const driverName = e.target.value;
                setSelectedDriver(driverName);

                // Find the selected driver's license number
                const selectedDriverObj = drivers.find(
                  (driver) => driver.name === driverName
                );
                setSelectedLicense(
                  selectedDriverObj ? selectedDriverObj.license_number : ""
                );
              }}
            >
              <option value="">Select Driver</option>
              {drivers.map((driver) => (
                <option key={driver.id} value={driver.name}>
                  {driver.name} - {driver.license_number}
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
                {dateRange[0]
                  ? dateRange[0].toLocaleDateString()
                  : "Not selected"}{" "}
                -{" "}
                {dateRange[1]
                  ? dateRange[1].toLocaleDateString()
                  : "Not selected"}
              </h5>
              <h5>Total Payments: {totalPayments} LKR</h5>
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
                    {paymentDetails.length > 0 ? (
                      paymentDetails.map((payments, index) => (
                        <tr key={index}>
                          <td>{payments.payment_date}</td>
                          <td>{payments.purpose}</td>
                          <td>{payments.amount} LKR</td>
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
