import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendar } from "react-icons/fa";
import axios from "axios";
import "./ManageDetails.css";
import "./Dashboard.css";

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
  const [calendarOpen, setCalendarOpen] = useState(false);

  useEffect(() => {
    const fetchTotalPayments = async () => {
      try {
        const response = await axios.get(
          "http://localhost:10000/api/driver/manage/total"
        );
        setTotalPayments(response.data[0]?.total_payments || 0);
      } catch (error) {
        console.error("Error fetching total payments:", error);
        showAlertMessage(
          error.response?.data?.message ||
            "Failed to fetch total payments. Please try again."
        );
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

      const response = await axios.post(
        "http://localhost:10000/api/driver/manage/details",
        requestBody
      );

      if (response.data.payments && response.data.payments.length > 0) {
        setPaymentDetails(response.data.payments);
        setTotalPayments(response.data.total_payments);
      } else {
        setPaymentDetails([]);
        setTotalPayments(0);
      }

      setShowModal(true);
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

  const handleMonthSelect = (date) => {
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    let endOfMonth;

    // Check if the selected month has 31 days
    const monthWith31Days = [0, 2, 4, 6, 7, 9, 11]; // 0 - Jan, 2 - Mar, 4 - May, etc.

    if (monthWith31Days.includes(date.getMonth())) {
      endOfMonth = new Date(date.getFullYear(), date.getMonth(), 31); // 31st day
    } else if (date.getMonth() === 1) {
      // February: Check for leap year (February has 29 days in a leap year)
      const isLeapYear =
        (date.getFullYear() % 4 === 0 && date.getFullYear() % 100 !== 0) ||
        date.getFullYear() % 400 === 0;
      endOfMonth = new Date(
        date.getFullYear(),
        date.getMonth(),
        isLeapYear ? 29 : 28
      ); // 29th day if leap year, otherwise 28th
    } else {
      endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0); // 30th day for other months
    }

    setDateRange([startOfMonth, endOfMonth]);
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
            <label>Select Month:</label>
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
                    ? `${dateRange[0].toLocaleDateString("en-GB", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      }).replace(/\//g, "-")} - ${dateRange[1]
                        .toLocaleDateString("en-GB", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                        })
                        .replace(/\//g, "-")}`
                    : "Select Month"
                }
                readOnly
              />
            </div>
            {calendarOpen && (
              <DatePicker
                selected={dateRange[0]}
                onChange={handleMonthSelect}
                showMonthYearPicker
                inline
                dateFormat="yyyy-MM-DD"
                onClickOutside={() => setCalendarOpen(false)}
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
