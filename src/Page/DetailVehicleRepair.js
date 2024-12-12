import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Dashboard.css";
import "./Detail.css";

const DetailVehicleRepair = () => {
  const [repairs, setRepairs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedRepair, setSelectedRepair] = useState(null);
  const [repairToDelete, setRepairToDelete] = useState(null);
  const [vehicleFetchError, setVehicleFetchError] = useState(null);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(false);

  const [newRepair, setNewRepair] = useState({
    vehicleNumber: "",
    repairDate: "",
    repairDetails: "",
    costAmount: "0",
    costCents: "00",
  });

  const [vehicleNumbers, setVehicleNumbers] = useState([]);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
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

  // Handle the search query change
  const handleSearchQueryChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Filter repairs based on search query
  const filteredRepairs = repairs.filter((repair) =>
    repair.vehicle_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Function to handle numeric part of the cost input change
  const handleAmountChange = (e) => {
    let value = e.target.value.replace(/[^0-9]/g, "");
    setNewRepair({ ...newRepair, costAmount: value });
  };

  // Function to handle cents part of the cost input change
  const handleCentsChange = (e) => {
    let value = e.target.value.replace(/[^0-9]/g, "");
    if (value.length > 2) {
      value = value.substring(0, 2);
    }
    setNewRepair({ ...newRepair, costCents: value });
  };

  // Function to handle the form submission
  const handleFormSubmit = (e) => {
    e.preventDefault();

    // Combine the costAmount and costCents to form the full cost
    const fullCost =
      parseInt(newRepair.costAmount || "0", 10) +
      parseInt(newRepair.costCents || "0", 10) / 100;

    // Ensure fullCost is a number
    const repairData = {
      vehicle_number: newRepair.vehicleNumber,
      date: newRepair.repairDate,
      description: newRepair.repairDetails,
      amount: isNaN(fullCost) ? 0 : fullCost, // fallback to 0 if fullCost is NaN
    };
    if (isEditing) {
      // Update repair details (you might need an endpoint for this)
      axios
        .put(
          `http://localhost:10000/api/vehicle/repair/${selectedRepair.vehicle_number}`,
          repairData
        )
        .then(() => {
          setRepairs((prevRepairs) =>
            prevRepairs.map((repair) =>
              repair.vehicle_number === selectedRepair.vehicle_number
                ? { ...selectedRepair, ...repairData }
                : repair
            )
          );
          resetModal();
        })
        .catch((error) => {
          console.error("Error updating repair:", error);
        });
    } else {
      // Add new repair
      axios
        .post("http://localhost:10000/api/vehicle/repair", repairData)
        .then((response) => {
          setRepairs([...repairs, { id: response.data.id, ...repairData }]);
          resetModal();
        })
        .catch((error) => {
          console.error("Error adding new repair:", error);
        });
    }
  };

  const resetModal = () => {
    setNewRepair({
      vehicleNumber: "",
      repairDate: "",
      repairDetails: "",
      costAmount: "0",
      costCents: "00",
    });
    setSelectedRepair(null);
    setIsEditing(false);
    setShowModal(false);
  };

  const confirmDelete = () => {
    axios
      .delete(`http://your-backend-url/api/repairs/${repairToDelete.id}`) // Replace with your API URL
      .then(() => {
        setRepairs(repairs.filter((repair) => repair.id !== repairToDelete.id));
        setRepairToDelete(null);
        setShowDeleteConfirmation(false);
      })
      .catch((error) => {
        console.error("Error deleting repair:", error);
      });
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

  const handleSignOut = () => {
    navigate("/"); // navigate to the sign out page
  };

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
              onChange={handleSearchQueryChange}
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
                  <td>
                    {repair.amount && !isNaN(repair.amount)
                      ? repair.amount.toFixed(2)
                      : "0.00"}
                  </td>
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
