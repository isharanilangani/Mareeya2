import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Dashboard.css";
import "./Detail.css";

const DetailDriverPayments = () => {
  const [payments, setPayments] = useState([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [, setCurrentPaymentId] = useState(null);
  const [driverFetchError, setDriverFetchError] = useState(null);
  const [isLoadingDrivers, setIsLoadingDrivers] = useState(false);
  const [, setSelectedPayment] = useState(null);
  const [newPayment, setNewPayment] = useState({
    licenseNumber: "",
    driverName: "",
    paymentDate: "",
    paymentDetails: "",
    costAmount: "0",
    costCents: "00",
  });
  const [driverName, setDriverNames] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPayments();
  }, []);

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setShowSuccessModal(true);
    setTimeout(() => setShowSuccessModal(false), 1000);
  };

  // Fetch name on component mount
  const handleDriverDropdownClick = async () => {
    setIsLoadingDrivers(true);
    setDriverFetchError(null);
    try {
      const response = await axios.get(
        "http://localhost:10000/api/driver/name"
      );
      setDriverNames(response.data.map((d) => d.name));
    } catch (error) {
      setDriverFetchError("Failed to fetch drivers names.");
      console.error("Error fetching drivers names:", error);
    } finally {
      setIsLoadingDrivers(false);
    }
  };

  // Fetch payments records on component mount
  const fetchPayments = async () => {
    try {
      const response = await axios.get(
        "http://localhost:10000/api/driver/payment"
      );
      const validPayments = response.data.filter(
        (payment) => payment.license_number
      );
      setPayments(validPayments);
      setFilteredPayments(validPayments);
    } catch (error) {
      console.error("Error fetching payments data", error);
    }
  };

  useEffect(() => {
    const filtered = payments.filter(
      (payment) =>
        payment.license_number &&
        payment.license_number.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredPayments(filtered);
  }, [searchQuery, payments]);

  // Handle numeric part of the cost input change
  const handleAmountChange = (e) => {
    let value = e.target.value.replace(/[^0-9]/g, "");
    setNewPayment({ ...newPayment, costAmount: value });
  };

  // Handle cents part of the cost input change
  const handleCentsChange = (e) => {
    let value = e.target.value.replace(/[^0-9]/g, "");
    if (value.length > 2) {
      value = value.substring(0, 2);
    }
    setNewPayment({ ...newPayment, costCents: value });
  };

  // Handle the form submission for adding new repair
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const fullCost =
      parseInt(newPayment.costAmount || "0", 10) +
      parseInt(newPayment.costCents || "0", 10) / 100;

    const paymentData = {
      license_number: newPayment.licenseNumber,
      name: newPayment.driverName,
      date: newPayment.paymentDate,
      description: newPayment.paymentDetails,
      amount: isNaN(fullCost) ? 0 : fullCost,
    };

    try {
      if (isEditing) {
        try {
          // Update repair
          console.log("Sending data:", newPayment);
          await axios.put(
            `http://localhost:10000/api/driver/payment/${newPayment.licenseNumber}/${newPayment.paymentDate}`,
            paymentData
          );

          setPayments((prevPayments) =>
            prevPayments.map((payment) =>
              payment.licenseNumber !== newPayment.licenseNumber &&
              payment.date !== newPayment.paymentDate
                ? { ...payment, ...newPayment }
                : payment
            )
          );
          fetchPayments();
          showSuccess("Payments updated successfully!");
        } catch (error) {
          console.error("Error updating payments", error);
        }
      } else {
        // Add new payments
        const response = await axios.post(
          "http://localhost:10000/api/driver/payment",
          paymentData
        );
        setPayments([...payments, { id: response.data.id, ...paymentData }]);
        showSuccess("Payments added successfully!");
      }
      resetModal();
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const handleUpdate = (payment) => {
    setSelectedPayment(payment);
    setNewPayment({
      driverName: payment.driverName,
      paymentDate: payment.paymentDate,
      paymentPurpose: payment.paymentPurpose,
      licenseNumber: payment.licenseNumber,
      costAmount: Math.floor(payment.amount),
      costCents: payment.amount
        ? ((payment.amount % 1) * 100).toFixed(0).padStart(2, "0")
        : "00",
    });
    setIsEditing(true);
    setShowModal(true);
  };

  // Reset modal state
  const resetModal = () => {
    setNewPayment({
      driverName: "",
      paymentDate: "",
      costAmount: "0",
      costCents: "00",
      paymentPurpose: "",
      licenseNumber: "",
    });
    setIsEditing(false);
    setCurrentPaymentId(null);
    setShowModal(false);
  };

  const openDeleteConfirmation = (payment) => {
    setPaymentToDelete(payment);
    setShowDeleteConfirmation(true);
  };

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const toggleDetails = () => {
    setIsDetailsOpen((prev) => !prev);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(
        `http://localhost:10000/api/driver/payment/${paymentToDelete.licenseNumber}/${paymentToDelete.date}`
      );
      setPayments((prevPayments) =>
        prevPayments.filter(
          (payment) =>
            payment.licenseNumber !== paymentToDelete.licenseNumber &&
            payment.date !== paymentToDelete.date
        )
      );
      showSuccess("Payment deleted successfully!");
    } catch (error) {
      console.error("Error deleting payment", error);
    }
    setShowDeleteConfirmation(false);
  };

  const handleSignOut = () => {
    navigate("/");
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

      <div className="Detail-main">
        <div className="header-actions">
          <h1 className="Detail-heading">Driver Payment Details</h1>
          <div className="header-controls">
            <button className="add-button" onClick={() => setShowModal(true)}>
              Add New Payment
            </button>
            <input
              type="text"
              placeholder="Search by License Number"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-bar"
            />
          </div>
        </div>

        {showModal && (
          <div className="modal-overlay">
            <form onSubmit={handleFormSubmit} className="modal-container">
              <h2 className="modal-title">
                {isEditing ? "Update Payment Details" : "Add Payment Details"}
              </h2>

              {/* License Number Dropdown */}
              <select
                value={newPayment.driverName}
                onChange={handleDriverDropdownClick}
                required
              >
                <option value="">Select Driver Name</option>
                {driverName.map((driverName) => (
                  <option key={driverName} value={driverName}>
                    {driverName}
                  </option>
                ))}
              </select>

              {/* Driver Name */}
              <input
                type="text"
                placeholder="License Number"
                value={newPayment.licenseNumber}
                onChange={(e) =>
                  setNewPayment({
                    ...newPayment,
                    licenseNumber: e.target.value,
                  })
                }
                required
                disabled
              />

              {/* Payment Date */}
              <input
                type="date"
                placeholder="Payment Date"
                value={newPayment.paymentDate}
                onChange={(e) =>
                  setNewPayment({ ...newPayment, paymentDate: e.target.value })
                }
                required
              />

              {/* Payment Purpose */}
              <input
                type="text"
                placeholder="Payment Purpose"
                value={newPayment.paymentPurpose}
                onChange={(e) =>
                  setNewPayment({
                    ...newPayment,
                    paymentPurpose: e.target.value,
                  })
                }
                required
              />

              {/* Payment Amount */}
              <div className="cost-inputs">
                <span>Rs.</span>
                <input
                  type="text"
                  placeholder="Amount"
                  value={newPayment.costAmount}
                  onChange={handleAmountChange}
                  maxLength="10"
                  required
                />
                <span>.</span>
                <input
                  type="text"
                  placeholder="Cents"
                  value={newPayment.costCents}
                  onChange={handleCentsChange}
                  maxLength="2"
                  required
                />
              </div>

              <div className="modal-buttons">
                <button type="submit" className="modal-submit-button">
                  {isEditing ? "Update" : "Add"}
                </button>
                <button
                  type="button"
                  className="modal-close-button"
                  onClick={resetModal}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {showDeleteConfirmation && (
          <div className="modal-overlay">
            <div className="modal-container">
              <h2 className="modal-title">Confirm Delete</h2>
              <p>Are you sure you want to delete this payment record?</p>
              <div className="modal-buttons">
                <button className="modal-submit-button" onClick={confirmDelete}>
                  Yes
                </button>
                <button
                  className="modal-close-button"
                  onClick={() => setShowDeleteConfirmation(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {showSuccessModal && (
          <div className="success-modal-overlay">
            <div className="success-modal-container">
              <p className="success-message">{successMessage}</p>
            </div>
          </div>
        )}

        <div className="Detail-table-container">
          <table className="Detail-table">
            <thead>
              <tr>
                <th>Driver Name</th>
                <th>Payment Date</th>
                <th>Payment Purpose</th>
                <th>License Number</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td>{payment.name}</td>
                  <td>{payment.date}</td>
                  <td>{payment.purpose}</td>
                  <td>{payment.license_number}</td>
                  <td>{payment.amount.toFixed(2)}</td>
                  <td>
                    <div className="action">
                      <button
                        className="update-button"
                        onClick={() => handleUpdate(payment)}
                      >
                        Update
                      </button>
                      <button
                        className="delete-button"
                        onClick={() => openDeleteConfirmation(payment)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DetailDriverPayments;
