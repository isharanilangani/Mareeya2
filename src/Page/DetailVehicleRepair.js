import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Dashboard.css";
import "./Detail.css";

const DetailVehicleRepair = () => {
  const [repairs, setRepairs] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [filteredRepairs, setFilteredRepairs] = useState([]);
  const [, setCurrentRepairId] = useState(null);
  const [vehicleFetchError, setVehicleFetchError] = useState(null);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(false);
  const [selectedRepair, setSelectedRepair] = useState(null);
  const [newRepair, setNewRepair] = useState({
    vehicleNumber: "",
    repairDate: "",
    repairDetails: "",
    costAmount: "0",
    costCents: "00",
  });
  const [vehicleNumbers, setVehicleNumbers] = useState([]);
  const navigate = useNavigate();

  // Fetch vehicle numbers on component mount
  const handleVehicleDropdownClick = async () => {
    setIsLoadingVehicles(true);
    setVehicleFetchError(null);
    try {
      const response = await axios.get(
        "http://localhost:10000/api/vehicle/numbers"
      );
      setVehicleNumbers(response.data.map((v) => v.vehicle_number));
    } catch (error) {
      setVehicleFetchError("Failed to fetch vehicle numbers.");
      console.error("Error fetching vehicle numbers:", error);
    } finally {
      setIsLoadingVehicles(false);
    }
  };

  // Fetch repair records on component mount
  useEffect(() => {
    axios
      .get("http://localhost:10000/api/vehicle/repair")
      .then((response) => {
        setRepairs(response.data);
      })
      .catch((error) => {
        console.error("There was an error fetching the repair records:", error);
      });
  }, []);

  useEffect(() => {
    const filtered = repairs.filter(
      (repair) =>
        repair.vehicle_number &&
        repair.vehicle_number.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredRepairs(filtered);
  }, [searchQuery, repairs]);

  // Handle numeric part of the cost input change
  const handleAmountChange = (e) => {
    let value = e.target.value.replace(/[^0-9]/g, "");
    setNewRepair({ ...newRepair, costAmount: value });
  };

  // Handle cents part of the cost input change
  const handleCentsChange = (e) => {
    let value = e.target.value.replace(/[^0-9]/g, "");
    if (value.length > 2) {
      value = value.substring(0, 2);
    }
    setNewRepair({ ...newRepair, costCents: value });
  };

  // Handle the form submission for adding new repair
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const fullCost =
      parseInt(newRepair.costAmount || "0", 10) +
      parseInt(newRepair.costCents || "0", 10) / 100;

    const repairData = {
      vehicle_number: newRepair.vehicleNumber,
      date: newRepair.repairDate,
      description: newRepair.repairDetails,
      amount: isNaN(fullCost) ? 0 : fullCost,
    };

    try {
      if (isEditing) {
        try {
          // Update repair
          console.log('Sending data:', newRepair);
          await axios.put(
            `http://localhost:10000/api/vehicle/repair/${selectedRepair.vehicle_number}`,
            repairData
          );

          setRepairs((prevRepairs) =>
            prevRepairs.map((repair) =>
              repair.vehicle_number === selectedRepair.vehicle_number
                ? { ...repair, ...newRepair }
                : repair
            )
          );
        } catch (error) {
          console.error("Error updating vehicle", error);
        }
      } else {
        // Add new repair
        const response = await axios.post(
          "http://localhost:10000/api/vehicle/repair",
          repairData
        );
        setRepairs([...repairs, { id: response.data.id, ...repairData }]);
      }
      resetModal();
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const handleUpdate = (repair) => {
    setSelectedRepair(repair); // Set the selected repair
    setNewRepair({
      vehicleNumber: repair.vehicle_number,
      repairDate: repair.date, // Ensure the date is formatted correctly
      repairDetails: repair.description,
      costAmount: Math.floor(repair.amount), // Extract the whole number part
      costCents: ((repair.amount % 1) * 100).toFixed(0).padStart(2, "0"), // Extract the cents part
    });
    setIsEditing(true); // Enable editing mode
    setShowModal(true); // Show the modal
  };

  // Reset modal state
  const resetModal = () => {
    setNewRepair({
      vehicleNumber: "",
      repairDate: "",
      repairDetails: "",
      costAmount: "0",
      costCents: "00",
    });
    setIsEditing(false);
    setCurrentRepairId(null);
    setShowModal(false);
  };

  const openDeleteConfirmation = (repair) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete repair for vehicle ${repair.vehicle_number}?`
    );
    if (confirmDelete) {
      handleDelete(repair.id); // Call the delete function (you'll need to implement this)
    }
  };

  const handleDelete = (repairId) => {
    axios
      .delete(`http://localhost:10000/api/vehicle/repair/${repairId}`)
      .then(() => {
        setRepairs(repairs.filter((repair) => repair.id !== repairId));
      })
      .catch((error) => {
        console.error("Error deleting repair:", error);
      });
  };

  const handleSignOut = () => {
    navigate("/"); // navigate to the sign out page
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
        </nav>
        <button onClick={handleSignOut} className="sign-out-button">
          <i className="fa fa-sign-out"></i> Sign Out
        </button>
      </aside>

      <div className="Detail-main">
        <div className="header-actions">
          <h1 className="Detail-heading">Vehicle Repair Details</h1>
          <div className="header-controls">
            <button className="add-button" onClick={() => setShowModal(true)}>
              Add New Repair
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
                {isEditing ? "Update Repair Details" : "Add Repair Details"}
              </h2>

              {/* Vehicle Number Dropdown */}
              <select
                value={newRepair.vehicleNumber}
                onClick={handleVehicleDropdownClick}
                onChange={(e) =>
                  setNewRepair({ ...newRepair, vehicleNumber: e.target.value })
                }
                required
                disabled={isEditing} // Disable the dropdown in update mode
              >
                <option value="">Select Vehicle Number</option>
                {isLoadingVehicles && <option>Loading...</option>}
                {vehicleFetchError && (
                  <option disabled>{vehicleFetchError}</option>
                )}
                {!isLoadingVehicles &&
                  !vehicleFetchError &&
                  vehicleNumbers.map((number) => (
                    <option key={number} value={number}>
                      {number}
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

        <div className="Detail-table-container">
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
              {filteredRepairs.map((repair) => (
                <tr key={repair.id}>
                  <td>{repair.vehicle_number}</td>
                  <td>{repair.date}</td>
                  <td>{repair.description}</td>
                  <td>{repair.amount.toFixed(2)}</td>
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
    </div>
  );
};

export default DetailVehicleRepair;
