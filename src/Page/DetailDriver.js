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
  const [, setSelectedDriver] = useState(null);
  const [driverToDelete, setDriverToDelete] = useState(null);
  const [newDriver, setNewDriver] = useState({
    vehicle_number: "",
    name: "",
    license_number: "",
    contact: "",
  });

  const [vehicleNumbers, setVehicleNumbers] = useState([]);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(false);
  const [vehicleFetchError, setVehicleFetchError] = useState(null);

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setShowSuccessModal(true);
    setTimeout(() => setShowSuccessModal(false), 1000);
  };

  const navigate = useNavigate();

  useEffect(() => {
    fetchDrivers();
  }, []);

  const handleVehicleDropdownClick = async () => {
    setIsLoadingVehicles(true);
    setVehicleFetchError(null);

    try {
      const response = await axios.get(
        "http://localhost:10000/api/vehicle/active"
      );

      // Use the data as-is since it matches the expected format
      const vehicleData = response.data;

      setVehicleNumbers(vehicleData);
    } catch (error) {
      setVehicleFetchError("Failed to fetch vehicles' data.");
      console.error("Error fetching vehicles' data:", error);
    } finally {
      setIsLoadingVehicles(false);
    }
  };

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
        if (!newDriver.vehicle_no) {
          console.error("Vehicle number is missing for update!");
          return;
        }

        const payload = {
          driver_name: newDriver.name,
          contact: newDriver.contact,
          license_number: newDriver.license_number,
        };

        console.log(
          "Updating driver with vehicle number:",
          newDriver.vehicle_no
        );

        await axios.put(
          `http://localhost:10000/api/driver/${newDriver.vehicle_no}`,
          payload
        );

        setDrivers((prevDrivers) =>
          prevDrivers.map((driver) =>
            driver.vehicle_number === newDriver.vehicle_no
              ? { ...driver, ...payload }
              : driver
          )
        );
        fetchDrivers();
        showSuccess("Driver updated successfully!");
      } catch (error) {
        console.error("Error updating driver", error);
      }
    } else {
      try {
        const addDriver = {
          vehicle_number: newDriver.vehicle_number,
          driver_name: newDriver.name,
          license_number: newDriver.license_number,
          contact: newDriver.contact,
        };

        console.log("Adding new driver:", addDriver);

        const response = await axios.post(
          "http://localhost:10000/api/driver",
          addDriver
        );

        setDrivers([...drivers, response.data]);
        fetchDrivers();
        showSuccess(response.data.message || "Driver added successfully!");
      } catch (error) {
        showSuccess(error.response?.data?.message || "Failed to add drivers.");
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

  const confirmDelete = async () => {
    try {
      await axios.delete(
        `http://localhost:10000/api/driver/${driverToDelete.driver_id}`
      );
      setDrivers(
        drivers.filter(
          (driver) => driver.driver_id !== driverToDelete.driver_id
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
              <select
                name="vehicle_number"
                value={newDriver.vehicle_number}
                onChange={handleInputChange}
                onClick={handleVehicleDropdownClick}
                required
              >
                <option value="">Select Vehicle Number</option>
                {isLoadingVehicles ? (
                  <option>Loading...</option>
                ) : vehicleFetchError ? (
                  <option>{vehicleFetchError}</option>
                ) : (
                  vehicleNumbers.map((vehicle) => (
                    <option key={vehicle.vehicle_number} value={vehicle.vehicle_number}>
                      {vehicle.vehicle_number}
                    </option>
                  ))
                )}
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
              <p>Are you sure you want to delete the driver?</p>
              <div className="modal-buttons">
                <button
                  className="modal-submit-button"
                  onClick={() => confirmDelete(driverToDelete.driver_id)}
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
                <th>Driver Name</th>
                <th>license Number</th>
                <th>Contact No</th>
                <th>Vehicle Numbers</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDrivers.map((driver) => (
                <tr key={driver.id}>
                  <td>{driver.name}</td>
                  <td>{driver.license_number}</td>
                  <td>{driver.contact}</td>
                  <td>
                    {driver.vehicles.map((vehicle, index) => (
                      <div key={index}>{vehicle.vehicle_number}</div>
                    ))}
                  </td>
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
