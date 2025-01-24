import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Dashboard.css";
import "./Detail.css";

const DetailVehicle = () => {
  const [vehicles, setVehicles] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [vehicleToDelete, setVehicleToDelete] = useState(null);
  const [newVehicle, setNewVehicle] = useState({
    vehicle_number: "",
    type: "",
    driver_name: "",
    brand: "",
    purchase_date: "",
    status: "Active",
  });

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setShowSuccessModal(true);
    setTimeout(() => setShowSuccessModal(false), 1000);
  };

  const navigate = useNavigate();

  useEffect(() => {
    fetchVehicles();
  }, []);

  useEffect(() => {
    const filtered = vehicles.filter(
      (vehicle) =>
        vehicle.vehicle_number &&
        vehicle.vehicle_number.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredVehicles(filtered);
  }, [searchQuery, vehicles]);

  const fetchVehicles = async () => {
    try {
      const response = await axios.get("http://localhost:10000/api/vehicle");
      const validVehicles = response.data.filter(
        (vehicle) => vehicle.vehicle_number
      );
      setVehicles(validVehicles);
      setFilteredVehicles(validVehicles);
    } catch (error) {
      console.error("Error fetching vehicles data", error);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (isEditing) {
      try {
        const response = await axios.put(
          `http://localhost:10000/api/vehicle/${selectedVehicle.vehicle_id}`,
          newVehicle
        );
        setVehicles((prevVehicles) =>
          prevVehicles.map((vehicle) =>
            vehicle.vehicle_id === selectedVehicle.vehicle_id
              ? { ...vehicle, ...newVehicle }
              : vehicle
          )
        );
        showSuccess(response.data.message || "Vehicle updated successfully!");
      } catch (error) {
        showSuccess(
          error.response?.data?.message || "Failed to update vehicle."
        );
      }
    } else {
      try {
        const response = await axios.post(
          "http://localhost:10000/api/vehicle",
          newVehicle
        );
        setVehicles([...vehicles, response.data]);
        fetchVehicles();
        showSuccess(response.data.message || "Vehicle added successfully!");
      } catch (error) {
        showSuccess(error.response?.data?.message || "Failed to add vehicle.");
      }
    }
    resetModal();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewVehicle({ ...newVehicle, [name]: value });
  };

  const resetModal = () => {
    setNewVehicle({
      vehicle_number: "",
      type: "",
      driver_name: "",
      brand: "",
      purchase_date: "",
      status: "Active",
    });
    setSelectedVehicle(null);
    setIsEditing(false);
    setShowModal(false);
  };

  const confirmDelete = async (vehicle_id) => {
    try {
      const response = await axios.delete(
        `http://localhost:10000/api/vehicle/${vehicle_id}`
      );
      setVehicles((prevVehicles) =>
        prevVehicles.filter((vehicle) => vehicle.vehicle_id !== vehicle_id)
      );
      showSuccess(response.data.message || "Vehicle deleted successfully!");
    } catch (error) {
      console.error("Error deleting vehicle", error);
      showSuccess(error.response?.data?.message || "Failed to delete vehicle.");
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

  const handleUpdate = (vehicle) => {
    setSelectedVehicle(vehicle);
    setNewVehicle(vehicle);
    setIsEditing(true);
    setShowModal(true);
  };

  const openDeleteConfirmation = (vehicle) => {
    setVehicleToDelete(vehicle);
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
          <h1 className="Detail-heading">Vehicles</h1>
          <div className="header-controls">
            <button className="add-button" onClick={() => setShowModal(true)}>
              Add New Vehicle
            </button>
            <input
              type="text"
              placeholder="Search by Vehicle Number"
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
                {isEditing ? "Update Vehicle Details" : "Add Vehicle Details"}
              </h2>
              <input
                type="text"
                name="vehicle_number"
                placeholder="Vehicle Number"
                value={newVehicle.vehicle_number}
                onChange={handleInputChange}
                required
              />
              <input
                type="text"
                name="type"
                placeholder="Vehicle Type"
                value={newVehicle.type}
                onChange={handleInputChange}
                required
              />
              <input
                type="text"
                name="brand"
                placeholder="Brand"
                value={newVehicle.brand}
                onChange={handleInputChange}
                required
              />
              <input
                type="date"
                name="purchase_date"
                placeholder="Purchase Date"
                value={newVehicle.purchase_date}
                onChange={handleInputChange}
                required
              />
              <select
                name="status"
                value={newVehicle.status}
                onChange={handleInputChange}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
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
              <p>Are you sure you want to delete the vehicle?</p>
              <div className="modal-buttons">
                <button
                  className="modal-submit-button"
                  onClick={() => confirmDelete(vehicleToDelete.vehicle_id)}
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
                <th>Vehicle Type</th>
                <th>Brand</th>
                <th>Purchase Date</th>
                <th>Status</th>
                <th>Driver Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVehicles.map((vehicle) => (
                <tr key={vehicle.id}>
                  <td>{vehicle.vehicle_number}</td>
                  <td>{vehicle.type}</td>
                  <td>{vehicle.brand}</td>
                  <td>{vehicle.purchase_date}</td>
                  <td>{vehicle.status}</td>
                  <td>
                    {vehicle.drivers.map((driver, index) => (
                      <div key={index}>{driver.name}</div>
                    ))}
                  </td>
                  <td>
                    <div className="action">
                      <button
                        className="update-button"
                        onClick={() => handleUpdate(vehicle)}
                      >
                        Update
                      </button>
                      <button
                        className="delete-button"
                        onClick={() => openDeleteConfirmation(vehicle)}
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
        <footer className="detail-footer">
          <p>
            Solution by DraveSpace<br></br>077 673 4021
          </p>
        </footer>
      </div>
    </div>
  );
};

export default DetailVehicle;
