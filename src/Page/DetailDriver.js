import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Dashboard.css";
import "./Detail.css";

const DetailDriver = () => {
  const [drivers, setDrivers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [filteredDrivers, setFilteredDrivers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [driverToDelete, setDriverToDelete] = useState(null);
  const [newDriver, setNewDriver] = useState({
    vehicle_number: "",
    name: "",
    license_number: "",
    contact: "",
  });

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setShowSuccessModal(true);
    setTimeout(() => setShowSuccessModal(false), 1000);
  };

  const navigate = useNavigate();

  useEffect(() => {
    fetchDrivers();
  }, []);

  useEffect(() => {
    const filtered = drivers.filter(
      (driver) =>
        driver.license_number &&
        driver.license_number.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredDrivers(filtered);
  }, [searchQuery, drivers]);

  const fetchDrivers = async () => {
    try {
      const response = await axios.get("http://localhost:10000/api/driver");
      const validDrivers = response.data.filter(
        (driver) => driver.license_number
      );
      setDrivers(validDrivers);
      setFilteredDrivers(validDrivers);
    } catch (error) {
      console.error("Error fetching drivers data", error);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (isEditing) {
      try {
        await axios.put(
          `http://localhost:10000/api/vehicle/${selectedDriver.vehicle_number}`,
          newDriver
        );
        setDrivers((prevDrivers) =>
          prevDrivers.map((driver) =>
            driver.vehicle_number === selectedDriver.vehicle_number
              ? { ...driver, ...newDriver }
              : driver
          )
        );
        showSuccess("Driver updated successfully!");
      } catch (error) {
        console.error("Error updating driver", error);
      }
    } else {
      try {
        const response = await axios.post(
          "http://localhost:10000/api/driver",
          newDriver
        );
        setDrivers([...drivers, response.data]);
        fetchDrivers();
        showSuccess("Drivers added successfully!");
      } catch (error) {
        console.error("Error adding new drivers", error);
      }
    }
    resetModal();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewDriver({ ...newDriver, [name]: value });
  };

  const resetModal = () => {
    setNewDriver({
      vehicle_number: "",
      name: "",
      license_number: "",
      contact: "",
    });
    setSelectedDriver(null);
    setIsEditing(false);
    setShowModal(false);
  };

  const confirmDelete = async (license_number) => {
    try {
      await axios.delete(
        `http://localhost:10000/api/vehicle/${license_number}`
      );
      setDrivers((prevDrivers) =>
        prevDrivers.filter(
          (driver) => driver.license_number !== license_number
        )
      );
      showSuccess("Driver deleted successfully!");
    } catch (error) {
      console.error("Error deleting driver", error);
    }
    setShowDeleteConfirmation(false);
  };

  const handleSignOut = () => {
    navigate("/");
  };

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const toggleDetails = () => {
    setIsDetailsOpen((prev) => !prev);
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
          <h1 className="Detail-heading">Drivers</h1>
          <div className="header-controls">
            <button className="add-button" onClick={() => setShowModal(true)}>
              Add New Driver
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
                {isEditing ? "Update Driver Details" : "Add Driver Details"}
              </h2>
              <input
                type="text"
                name="vehicle_number"
                placeholder="Vehicle Number"
                value={newDriver.vehicle_number}
                onChange={handleInputChange}
                required
                readOnly={isEditing}
              />
              <input
                type="text"
                name="name"
                placeholder="Driver Name"
                value={newDriver.name}
                onChange={handleInputChange}
                required
              />
              <input
                type="text"
                name="license_number"
                placeholder="License Number"
                value={newDriver.license_number}
                onChange={handleInputChange}
                required
              />
              <input
                type="text"
                name="contact"
                placeholder="Contact No"
                value={newDriver.contact}
                onChange={handleInputChange}
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
              <p>Are you sure you want to delete the driver?</p>
              <div className="modal-buttons">
                <button
                  className="modal-submit-button"
                  onClick={() => confirmDelete(driverToDelete.license_number)}
                >
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

        {/* Success Modal */}
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
                <th>Vehicle Number</th>
                <th>Driver Name</th>
                <th>license Number</th>
                <th>Contact No</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDrivers.map((driver) => (
                <tr key={driver.id}>
                  <td>{driver.vehicle_number}</td>
                  <td>{driver.name}</td>
                  <td>{driver.license_number}</td>
                  <td>{driver.contact}</td>
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
    </div>
  );
};

export default DetailDriver;
