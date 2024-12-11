import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Dashboard.css";
import "./Detail.css";

const DetailVehicle = () => {
  const [vehicles, setVehicles] = useState([]);
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
    status: "Active",
  });

  const navigate = useNavigate();

  // Fetch vehicles data from API
  useEffect(() => {
    fetchVehicles();
  }, []);

    const fetchVehicles = async () => {
      try {
        const response = await axios.get("http://localhost:10000/api/vehicle");
        setVehicles(response.data);
      } catch (error) {
        console.error("Error fetching vehicles data", error);
      }
    };

  // Handle form submission (add/update vehicle)
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (isEditing) {
      try {
        await axios.post(
          `http://localhost:10000/api/vehicle/${selectedVehicle.id}`,
          newVehicle
        );
        setVehicles((prevVehicles) =>
          prevVehicles.map((vehicle) =>
            vehicle.id === selectedVehicle.id ? { ...vehicle, ...newVehicle } : vehicle
          )
        );
      } catch (error) {
        console.error("Error updating vehicle", error);
      }
    } else {
      try {
        const response = await axios.post("http://localhost:10000/api/vehicle", newVehicle);
        setVehicles([...vehicles, response.data]);
        fetchVehicles();
      } catch (error) {
        console.error("Error adding new vehicle", error);
      }
    }

    resetModal();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewVehicle({ ...newVehicle, [name]: value });
  };

  // Reset modal and form state
  const resetModal = () => {
    setNewVehicle({
      vehicle_number: "",
      type: "",
      driver_name: "",
      brand: "",
      status: "Active",
    });
    setSelectedVehicle(null);
    setIsEditing(false);
    setShowModal(false);
  };

  // Confirm delete
  const confirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:10000/api/vehicle/${vehicleToDelete.id}`);
      setVehicles(vehicles.filter((vehicle) => vehicle.id !== vehicleToDelete.id));
      setVehicleToDelete(null);
      setShowDeleteConfirmation(false);
    } catch (error) {
      console.error("Error deleting vehicle", error);
    }
  };

  // Handle sign out
  const handleSignOut = () => {
    navigate("/");
  };

  // Toggle details section
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const toggleDetails = () => {
    setIsDetailsOpen((prev) => !prev);
  };

  // Open modal to update vehicle
  const handleUpdate = (vehicle) => {
    setSelectedVehicle(vehicle);
    setNewVehicle(vehicle);
    setIsEditing(true);
    setShowModal(true);
  };

  // Open delete confirmation modal
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
                className={`fa ${isDetailsOpen ? "fa-chevron-up" : "fa-chevron-down"}`}
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
        <h1 className="Detail-heading">Vehicles</h1>
        <button className="add-button" onClick={() => setShowModal(true)}>
          Add New Vehicle
        </button>

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
                name="driver_name"
                placeholder="Driver Name"
                value={newVehicle.driver_name}
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
                <button type="button" className="modal-close-button" onClick={resetModal}>
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
                <button className="modal-submit-button" onClick={confirmDelete}>
                  Yes
                </button>
                <button className="modal-close-button" onClick={() => setShowDeleteConfirmation(false)}>
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
              <th>Driver Name</th>
              <th>Vehicle Type</th>
              <th>Brand</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((vehicle) => (
              <tr key={vehicle.id}>
                <td>{vehicle.vehicle_number}</td>
                <td>{vehicle.driver_name}</td>
                <td>{vehicle.type}</td>
                <td>{vehicle.brand}</td>
                <td>{vehicle.status}</td>
                <td>
                  <div className="action">
                    <button className="update-button" onClick={() => handleUpdate(vehicle)}>
                      Update
                    </button>
                    <button className="delete-button" onClick={() => openDeleteConfirmation(vehicle)}>
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

export default DetailVehicle;
