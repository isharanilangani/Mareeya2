import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Dashboard.css";
import "./Detail.css";

const DetailDriverPayments = () => {
  const [payments, setPayments] = useState([
    {
      id: 1,
      driverName: "John Doe",
      paymentDate: "2023-12-01",
      paymentAmount: 5000,
      paymentPurpose: "Monthly Salary",
      licenseNumber: "AB1234567",
    },
    {
      id: 2,
      driverName: "Jane Smith",
      paymentDate: "2023-11-20",
      paymentAmount: 3000,
      paymentPurpose: "Fuel Reimbursement",
      licenseNumber: "CD7654321",
    },
    {
      id: 3,
      driverName: "Mike Johnson",
      paymentDate: "2023-10-15",
      paymentAmount: 2000,
      paymentPurpose: "Bonus",
      licenseNumber: "EF0987654",
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [paymentToDelete, setPaymentToDelete] = useState(null);
  const [newPayment, setNewPayment] = useState({
    driverName: "",
    paymentDate: "",
    PaymentAmount: "0",
    PaymentCents: "00",
    paymentPurpose: "",
    licenseNumber: "",
  });

  const licenseNumbers = [
    ...new Set(payments.map((payment) => payment.licenseNumber)),
  ];

  // Handle amount change
  const handleAmountChange = (e) => {
    let value = e.target.value.replace(/[^0-9]/g, "");
    setNewPayment({ ...newPayment, PaymentAmount: value });
  };

  // Handle cents change
  const handleCentsChange = (e) => {
    let value = e.target.value.replace(/[^0-9]/g, "");
    if (value.length > 2) {
      value = value.substring(0, 2);
    }
    setNewPayment({ ...newPayment, PaymentCents: value });
  };

  // Handle license number change and auto-fill driver name
  const handleLicenseNumberChange = (e) => {
    const selectedLicenseNumber = e.target.value;
    setNewPayment({ ...newPayment, licenseNumber: selectedLicenseNumber });

    // Find the corresponding driver name for the selected license number
    const selectedDriver = payments.find(
      (payment) => payment.licenseNumber === selectedLicenseNumber
    );
    if (selectedDriver) {
      setNewPayment({ ...newPayment, driverName: selectedDriver.driverName });
    }
  };

  // Form submit handling
  const handleFormSubmit = (e) => {
    e.preventDefault();

    const fullPaymentAmount =
      parseInt(newPayment.PaymentAmount) +
      parseInt(newPayment.PaymentCents) / 100;
    const paymentData = {
      driverName: newPayment.driverName,
      paymentDate: newPayment.paymentDate,
      paymentAmount: fullPaymentAmount,
      paymentPurpose: newPayment.paymentPurpose,
      licenseNumber: newPayment.licenseNumber,
    };

    if (isEditing) {
      setPayments((prevPayments) =>
        prevPayments.map((payment) =>
          payment.id === selectedPayment.id
            ? { ...selectedPayment, ...paymentData }
            : payment
        )
      );
    } else {
      const newId = payments.length ? payments[payments.length - 1].id + 1 : 1;
      setPayments([...payments, { id: newId, ...paymentData }]);
    }

    resetModal();
  };

  const resetModal = () => {
    setNewPayment({
      driverName: "",
      paymentDate: "",
      PaymentAmount: "0",
      PaymentCents: "00",
      paymentPurpose: "",
      licenseNumber: "",
    });
    setSelectedPayment(null);
    setIsEditing(false);
    setShowModal(false);
  };

  const confirmDelete = () => {
    setPayments(
      payments.filter((payment) => payment.id !== paymentToDelete.id)
    );
    setPaymentToDelete(null);
    setShowDeleteConfirmation(false);
  };

  const handleUpdate = (payment) => {
    setSelectedPayment(payment);
    setNewPayment({
      driverName: payment.driverName,
      paymentDate: payment.paymentDate,
      PaymentAmount: payment.paymentAmount.toString(),
      PaymentCents: (payment.paymentAmount % 1 === 0
        ? "00"
        : (payment.paymentAmount * 100) % 100
      )
        .toString()
        .padStart(2, "0"),
      paymentPurpose: payment.paymentPurpose,
      licenseNumber: payment.licenseNumber,
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const openDeleteConfirmation = (payment) => {
    setPaymentToDelete(payment);
    setShowDeleteConfirmation(true);
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

      <div className="Detail-main">
        <h1 className="Detail-heading">Driver Payment Details</h1>
        <button className="add-button" onClick={() => setShowModal(true)}>
          Add New Payment
        </button>

        {showModal && (
          <div className="modal-overlay">
            <form onSubmit={handleFormSubmit} className="modal-container">
              <h2 className="modal-title">
                {isEditing ? "Update Payment Details" : "Add Payment Details"}
              </h2>

              {/* License Number Dropdown */}
              <select
                value={newPayment.licenseNumber}
                onChange={handleLicenseNumberChange}
                required
              >
                <option value="">Select License Number</option>
                {licenseNumbers.map((licenseNumber) => (
                  <option key={licenseNumber} value={licenseNumber}>
                    {licenseNumber}
                  </option>
                ))}
              </select>

              {/* Driver Name */}
              <input
                type="text"
                placeholder="Driver Name"
                value={newPayment.driverName}
                onChange={(e) =>
                  setNewPayment({ ...newPayment, driverName: e.target.value })
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
                  value={newPayment.PaymentAmount}
                  onChange={handleAmountChange}
                  maxLength="10"
                  required
                />
                <span>.</span>
                <input
                  type="text"
                  placeholder="Cents"
                  value={newPayment.PaymentCents}
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
                <td>{payment.driverName}</td>
                <td>{payment.paymentDate}</td>
                <td>{payment.paymentPurpose}</td>
                <td>{payment.licenseNumber}</td>
                <td>{`Rs. ${payment.paymentAmount.toFixed(2)}`}</td>
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
  );
};

export default DetailDriverPayments;
