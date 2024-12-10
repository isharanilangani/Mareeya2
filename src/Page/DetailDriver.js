import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Dashboard.css";
import "./Detail.css";

const DetailDriver = () => {
  const [drivers, setDrivers] = useState([
    {
      id: 1,
      name: "John Doe",
      contact: "123-456-7890",
      license: "LIC12345",
      vehicle: "AB123CD",
    },
    {
      id: 2,
      name: "Jane Smith",
      contact: "987-654-3210",
      license: "LIC67890",
      vehicle: "EF456GH",
    },
    {
      id: 3,
      name: "Michael Johnson",
      contact: "456-123-7890",
      license: "LIC11111",
      vehicle: "IJ789KL",
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [driverToDelete, setDriverToDelete] = useState(null);
  const [newDriver, setNewDriver] = useState({
    name: "",
    contact: "",
    license: "",
    vehicle: "",
  });

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const toggleDetails = () => {
    setIsDetailsOpen((prev) => !prev);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    if (isEditing) {
      setDrivers((prevDrivers) =>
        prevDrivers.map((driver) =>
          driver.id === selectedDriver.id
            ? { ...selectedDriver, ...newDriver }
            : driver
        )
      );
    } else {
      const newId = drivers.length ? drivers[drivers.length - 1].id + 1 : 1;
      setDrivers([...drivers, { id: newId, ...newDriver }]);
    }

    resetModal();
  };

  const resetModal = () => {
    setNewDriver({ name: "", contact: "", license: "", vehicle: "" });
    setSelectedDriver(null);
    setIsEditing(false);
    setShowModal(false);
  };

  const confirmDelete = () => {
    setDrivers(drivers.filter((driver) => driver.id !== driverToDelete.id));
    setDriverToDelete(null);
    setShowDeleteConfirmation(false);
  };

  const handleUpdate = (driver) => {
    setSelectedDriver(driver);
    setNewDriver(driver);
    setIsEditing(true);
    setShowModal(true);
  };

  const openDeleteConfirmation = (driver) => {
    setDriverToDelete(driver);
    setShowDeleteConfirmation(true);
  };

  const navigate = useNavigate();

  const handleSignOut = () => {
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

      <div className="Detail-main">
        <h1 className="Detail-heading">Drivers</h1>
        <button className="add-button" onClick={() => setShowModal(true)}>
          Add New Driver
        </button>

        {showModal && (
          <div className="modal-overlay">
            <form onSubmit={handleFormSubmit} className="modal-container">
              <h2 className="modal-title">
                {isEditing ? "Update Driver Details" : "Add Driver Details"}
              </h2>
              <input
                type="text"
                placeholder="Driver Name"
                value={newDriver.name}
                onChange={(e) =>
                  setNewDriver({ ...newDriver, name: e.target.value })
                }
                required
              />
              <input
                type="text"
                placeholder="Contact"
                value={newDriver.contact}
                onChange={(e) =>
                  setNewDriver({ ...newDriver, contact: e.target.value })
                }
                required
              />
              <input
                type="text"
                placeholder="License No"
                value={newDriver.license}
                onChange={(e) =>
                  setNewDriver({ ...newDriver, license: e.target.value })
                }
                required
              />
              <input
                type="text"
                placeholder="Vehicle No"
                value={newDriver.vehicle}
                onChange={(e) =>
                  setNewDriver({ ...newDriver, vehicle: e.target.value })
                }
                required
              />
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
              <p>Are you sure you want to delete this driver?</p>
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
              <th>Contact</th>
              <th>License No</th>
              <th>Vehicle No</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map((driver) => (
              <tr key={driver.id}>
                <td>{driver.name}</td>
                <td>{driver.contact}</td>
                <td>{driver.license}</td>
                <td>{driver.vehicle}</td>
                <td>
                  <div className="action">
                    <button
                      className="update-button"
                      onClick={() => handleUpdate(driver)}
                    >
                      Update
                    </button>
                    <button
                      className="delete-button"
                      onClick={() => openDeleteConfirmation(driver)}
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

export default DetailDriver;
