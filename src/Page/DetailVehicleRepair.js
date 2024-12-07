import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Dashboard.css";
import "./Detail.css";

const DetailVehicleRepair = () => {
  const [repairs, setRepairs] = useState([
    {
      id: 1,
      vehicleNumber: "AB123CD",
      repairDate: "2023-12-01",
      repairDetails: "Engine repair",
      cost: 500,
    },
    {
      id: 2,
      vehicleNumber: "EF456GH",
      repairDate: "2023-11-20",
      repairDetails: "Brake system repair",
      cost: 300,
    },
    {
      id: 3,
      vehicleNumber: "IJ789KL",
      repairDate: "2023-10-15",
      repairDetails: "Tire replacement",
      cost: 200,
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedRepair, setSelectedRepair] = useState(null);
  const [repairToDelete, setRepairToDelete] = useState(null);
  const [newRepair, setNewRepair] = useState({
    vehicleNumber: "",
    repairDate: "",
    repairDetails: "",
    costAmount: "0", // Numeric part of the cost
    costCents: "00", // Cents part of the cost
  });

  // Function to handle numeric part of the cost input change
  const handleAmountChange = (e) => {
    let value = e.target.value.replace(/[^0-9]/g, ""); // Remove non-numeric characters
    setNewRepair({ ...newRepair, costAmount: value });
  };

  // Function to handle cents part of the cost input change
  const handleCentsChange = (e) => {
    let value = e.target.value.replace(/[^0-9]/g, ""); // Remove non-numeric characters
    if (value.length > 2) {
      value = value.substring(0, 2); // Limit cents to two digits
    }
    setNewRepair({ ...newRepair, costCents: value });
  };

  // Function to handle the form submission
  const handleFormSubmit = (e) => {
    e.preventDefault();

    // Combine the costAmount and costCents to form the full cost
    const fullCost =
      parseInt(newRepair.costAmount) + parseInt(newRepair.costCents) / 100;

    const repairData = {
      vehicleNumber: newRepair.vehicleNumber,
      repairDate: newRepair.repairDate,
      repairDetails: newRepair.repairDetails,
      cost: fullCost,
    };

    if (isEditing) {
      // Update repair details
      setRepairs((prevRepairs) =>
        prevRepairs.map((repair) =>
          repair.id === selectedRepair.id
            ? { ...selectedRepair, ...repairData }
            : repair
        )
      );
    } else {
      // Add new repair
      const newId = repairs.length ? repairs[repairs.length - 1].id + 1 : 1;
      setRepairs([...repairs, { id: newId, ...repairData }]);
    }

    resetModal();
  };

  const resetModal = () => {
    setNewRepair({
      vehicleNumber: "",
      repairDate: "",
      repairDetails: "",
      costAmount: "0", // Default cost is 0
      costCents: "00", // Default cents is 00
    });
    setSelectedRepair(null);
    setIsEditing(false);
    setShowModal(false);
  };

  const confirmDelete = () => {
    setRepairs(repairs.filter((repair) => repair.id !== repairToDelete.id));
    setRepairToDelete(null);
    setShowDeleteConfirmation(false);
  };

  const handleUpdate = (repair) => {
    setSelectedRepair(repair);
    const [whole, cents] = repair.cost.toFixed(2).split(".");
    setNewRepair({
      vehicleNumber: repair.vehicleNumber,
      repairDate: repair.repairDate,
      repairDetails: repair.repairDetails,
      costAmount: whole,
      costCents: cents,
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const openDeleteConfirmation = (repair) => {
    setRepairToDelete(repair);
    setShowDeleteConfirmation(true);
  };

  const navigate = useNavigate();

  const handleSignOut = () => {
    navigate("/");
  };

  const hasLogo = false;

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const toggleDetails = () => {
    setIsDetailsOpen((prev) => !prev);
  };

  // Get unique vehicle numbers from the repairs state
  const vehicleNumbers = [
    ...new Set(repairs.map((repair) => repair.vehicleNumber)),
  ];

  return (
    <div className="dashboard-container">
      <aside className="dashboard-sidebar">
        <div className="company-header">
          {hasLogo ? (
            <img
              src="https://via.placeholder.com/60"
              alt="Company Logo"
              className="company-logo"
            />
          ) : (
            <div className="company-icon">
              <i className="fa fa-camera" aria-hidden="true"></i>
            </div>
          )}
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
        <h1 className="Detail-heading">Vehicle Repair Details</h1>
        <button className="add-button" onClick={() => setShowModal(true)}>
          Add New Repair
        </button>

        {showModal && (
          <div className="modal-overlay">
            <form onSubmit={handleFormSubmit} className="modal-container">
              <h2 className="modal-title">
                {isEditing ? "Update Repair Details" : "Add Repair Details"}
              </h2>

              {/* Vehicle Number Dropdown */}
              <select
                value={newRepair.vehicleNumber}
                onChange={(e) =>
                  setNewRepair({ ...newRepair, vehicleNumber: e.target.value })
                }
                required
              >
                <option value="">Select Vehicle Number</option>
                {vehicleNumbers.map((vehicleNumber) => (
                  <option key={vehicleNumber} value={vehicleNumber}>
                    {vehicleNumber}
                  </option>
                ))}
              </select>

              <input
                type="date"
                placeholder="Repair Date"
                value={newRepair.repairDate}
                onChange={(e) =>
                  setNewRepair({ ...newRepair, repairDate: e.target.value })
                }
                required
              />
              <input
                type="text"
                placeholder="Description"
                value={newRepair.repairDetails}
                onChange={(e) =>
                  setNewRepair({ ...newRepair, repairDetails: e.target.value })
                }
                required
              />
              <div className="cost-inputs">
                <span>Rs.</span>
                <input
                  type="text"
                  placeholder="Amount"
                  value={newRepair.costAmount}
                  onChange={handleAmountChange}
                  maxLength="10" // Limit to 10 digits
                  required
                />
                <span>.</span>
                <input
                  type="text"
                  placeholder="Cents"
                  value={newRepair.costCents}
                  onChange={handleCentsChange}
                  maxLength="2" // Limit to 2 digits for cents
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
              <p>Are you sure you want to delete this repair record?</p>
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
              <th>Vehicle Number</th>
              <th>Repair Date</th>
              <th>Description</th>
              <th>Cost</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {repairs.map((repair) => (
              <tr key={repair.id}>
                <td>{repair.vehicleNumber}</td>
                <td>{repair.repairDate}</td>
                <td>{repair.repairDetails}</td>
                <td>{`Rs. ${repair.cost.toFixed(2)}`}</td>{" "}
                {/* Format the cost */}
                <td>
                  <div className="action">
                    <button
                      className="update-button"
                      onClick={() => handleUpdate(repair)}
                    >
                      Update
                    </button>
                    <button
                      className="delete-button"
                      onClick={() => openDeleteConfirmation(repair)}
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

export default DetailVehicleRepair;
