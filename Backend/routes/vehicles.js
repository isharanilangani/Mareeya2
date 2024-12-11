const express = require("express");
const db = require("../config/db");
const router = express.Router();

// Register or Update Vehicle and Driver
router.post("/", (req, res) => {
  const { vehicleNumber, driverName, type, brand, status } = req.body;

  if (!vehicleNumber || !type || !brand || !status || !driverName) {
    return res.status(400).json({ message: "All fields are required." });
  }

  // Check if the vehicle already exists
  const vehicleQuery = "SELECT vehicle_id FROM vehicles WHERE vehicle_number = ?";
  db.query(vehicleQuery, [vehicleNumber], (err, vehicleRows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database error occurred." });
    }

    if (vehicleRows.length > 0) {
      // Vehicle exists, update details
      const vehicleId = vehicleRows[0].vehicle_id;
      const updateVehicleQuery =
        "UPDATE vehicles SET type = ?, brand = ?, status = ? WHERE vehicle_id = ?";
      db.query(updateVehicleQuery, [type, brand, status, vehicleId], (err) => {
        if (err) {
          console.error(err);
          return res
            .status(500)
            .json({ message: "Failed to update vehicle details." });
        }
        manageDriver(vehicleId);
      });
    } else {
      // Insert a new vehicle
      const insertVehicleQuery =
        "INSERT INTO vehicles (vehicle_number, type, brand, status) VALUES (?, ?, ?, ?)";
      db.query(
        insertVehicleQuery,
        [vehicleNumber, type, brand, status],
        (err, result) => {
          if (err) {
            console.error(err);
            return res
              .status(500)
              .json({ message: "Failed to insert vehicle details." });
          }
          const vehicleId = result.insertId; // Get the inserted vehicle ID
          manageDriver(vehicleId);
        }
      );
    }

    // Function to manage driver
    function manageDriver(vehicleId) {
      const driverQuery = "SELECT driver_id FROM drivers WHERE vehicle_id = ?";
      db.query(driverQuery, [vehicleId], (err, driverRows) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: "Failed to fetch driver." });
        }

        if (driverRows.length > 0) {
          // Update existing driver name
          const updateDriverQuery =
            "UPDATE drivers SET name = ? WHERE vehicle_id = ?";
          db.query(updateDriverQuery, [driverName, vehicleId], (err) => {
            if (err) {
              console.error(err);
              return res
                .status(500)
                .json({ message: "Failed to update driver details." });
            }
            res.status(200).json({
              message: "Vehicle and driver details updated successfully.",
              vehicleId,
            });
          });
        } else {
          // Insert a new driver
          const insertDriverQuery =
            "INSERT INTO drivers (name, vehicle_id) VALUES (?, ?)";
          db.query(insertDriverQuery, [driverName, vehicleId], (err) => {
            if (err) {
              console.error(err);
              return res
                .status(500)
                .json({ message: "Failed to insert driver details." });
            }
            res.status(200).json({
              message: "Vehicle and driver details updated successfully.",
            });
          });
        }
      });
    }
  });
});

module.exports = router;
