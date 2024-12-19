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
  const [driverToDelete, setDriverToDelete] = useState(null);
  const [newDriver, setNewDriver] = useState({
    vehicle_numbers: [""],
    name: "",
    license_number: "",
    contact: "",
  });

  const [vehicleNumbers, setVehicleNumbers] = useState([]);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(false);
  const [vehicleFetchError, setVehicleFetchError] = useState(null);
  const [, setSelectedDriver] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewDriver((prevDriver) => ({
      ...prevDriver,
      [name]: value,
    }));
  };

  const handleVehicleChange = (e, index) => {
    const { value } = e.target;
    const updatedVehicles = [...newDriver.vehicle_numbers];
    updatedVehicles[index] = value;
    setNewDriver((prevDriver) => ({
      ...prevDriver,
      vehicle_numbers: updatedVehicles,
    }));
  };

  const addVehicle = () => {
    setNewDriver((prevDriver) => ({
      ...prevDriver,
      vehicle_numbers: [...prevDriver.vehicle_numbers, ""],
    }));
  };

  const removeVehicle = (index) => {
    const updatedVehicles = newDriver.vehicle_numbers.filter(
      (_, i) => i !== index
    );
    setNewDriver((prevDriver) => ({
      ...prevDriver,
      vehicle_numbers: updatedVehicles,
    }));
  };

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
        const payload = {
          driver_name: newDriver.name,
          contact: newDriver.contact,
          license_number: newDriver.license_number,
          vehicle_numbers: newDriver.vehicle_numbers,
        };

        const response = await axios.put(
          `http://localhost:10000/api/driver/${newDriver.driver_id}`,
          payload
        );

        setDrivers((prevDrivers) =>
          prevDrivers.map((driver) =>
            driver.driver_id === newDriver.driver_id
              ? { ...driver, ...payload }
              : driver
          )
        );
        fetchDrivers();
        showSuccess(response.data.message || "Driver updated successfully!");
      } catch (error) {
        showSuccess(
          error.response?.data?.message || "Failed to update drivers."
        );
      }
    } else {
      try {
        const addDriver = {
          driver_name: newDriver.name,
          license_number: newDriver.license_number,
          contact: newDriver.contact,
          vehicle_numbers: newDriver.vehicle_numbers,
        };

        console.log("Adding new driver:", addDriver);

        // Post the request to the backend
        const response = await axios.post(
          "http://localhost:10000/api/driver",
          addDriver
        );

        // Assuming successful response, add the driver and show success message
        setDrivers([...drivers, response.data]);
        fetchDrivers(); // Refresh drivers list
        showSuccess(response.data.message || "Driver added successfully!");
      } catch (error) {
        // Show error message if something goes wrong
        showSuccess(error.response?.data?.message || "Failed to add drivers.");
      }
    }
    resetModal();
  };

  const resetModal = () => {
    setNewDriver({
      vehicle_numbers: [""], // Always start with one empty vehicle number field
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
      const response = await axios.delete(
        `http://localhost:10000/api/driver/${driverToDelete.driver_id}`
      );
      setDrivers(
        drivers.filter(
          (driver) => driver.driver_id !== driverToDelete.driver_id
        )
      );
      showSuccess(response.data.message || "Driver deleted successfully!");
    } catch (error) {
      showSuccess(error.response?.data?.message || "Failed to delete drivers.");
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

  const handleUpdate = async (driver) => {
    setSelectedDriver(driver);
    setIsEditing(true);
    setShowModal(true); // Open modal early if needed for UX

    try {
      // Fetch vehicle numbers for the driver
      const response = await fetch(
        `http://localhost:10000/api/driver/vehicle/numbers?license_number=${driver.license_number}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch vehicle numbers");
      }

      const vehicleData = await response.json();
      console.log("Fetched Vehicle Numbers:", vehicleData); // Debugging

      // Ensure you access the `vehicle_numbers` array from the object
      if (
        !vehicleData.vehicle_numbers ||
        !Array.isArray(vehicleData.vehicle_numbers)
      ) {
        throw new Error("Invalid vehicle numbers format");
      }

      // Update newDriver with fetched vehicle numbers
      setNewDriver({
        ...driver,
        vehicle_numbers: vehicleData.vehicle_numbers || [""], // Use the array directly
      });
    } catch (error) {
      console.error("Error fetching vehicle numbers:", error);
      setNewDriver({
        ...driver,
        vehicle_numbers: [], // Fallback to empty array if fetching fails
      });
    }
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

              {/* Multiple vehicle numbers */}
              <div>
                <label htmlFor="vehicle_numbers">Vehicle Numbers</label>
                <div id="vehicle_numbers">
                  {newDriver.vehicle_numbers?.map((vehicle, index) => (
                    <div key={index} className="vehicle-input">
                      <select
                        name={`vehicle_number_${index}`}
                        value={vehicle}
                        onChange={(e) => handleVehicleChange(e, index)}
                        onClick={handleVehicleDropdownClick} // Trigger on click to fetch data
                        required
                      >
                        <option value="">Select Vehicle Number</option>
                        {isLoadingVehicles ? (
                          <option>Loading...</option>
                        ) : vehicleFetchError ? (
                          <option>{vehicleFetchError}</option>
                        ) : (
                          vehicleNumbers
                            .filter(
                              (vehicleOption) =>
                                !newDriver.vehicle_numbers.includes(
                                  vehicleOption.vehicle_number
                                ) || vehicleOption.vehicle_number === vehicle
                            ) // Keep the selected vehicle number in the options list
                            .map((vehicleOption) => (
                              <option
                                key={vehicleOption.vehicle_number}
                                value={vehicleOption.vehicle_number}
                              >
                                {vehicleOption.vehicle_number}
                              </option>
                            ))
                        )}
                      </select>

                      {/* Show remove button (X) only if a vehicle number is selected */}
                      {newDriver.vehicle_numbers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeVehicle(index)}
                          className="remove-vehicle-btn"
                        >
                          &times; {/* This is the "X" symbol */}
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    className="action-button"
                    type="button"
                    onClick={addVehicle}
                  >
                    Add Vehicle
                  </button>
                </div>
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
        <footer className="login-footer">
          <p>
            Solution by DraveSpace<br></br>077 673 4021
          </p>
        </footer>
      </div>
    </div>
  );
};

export default DetailDriver;
