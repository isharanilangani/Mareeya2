const express = require("express");
const db = require("../config/db");
const router = express.Router();
const moment = require("moment");

// Register or Update Vehicle and Driver
router.put("/:vehicle_id", (req, res) => {
  const { vehicle_id } = req.params;
  const { vehicle_number, type, brand, purchase_date, status } = req.body;

  // Ensure all required fields are provided
  if (
    !vehicle_id ||
    !vehicle_number ||
    !type ||
    !brand ||
    !status ||
    !purchase_date
  ) {
    return res.status(400).json({ message: "All fields are required." });
  }

  // Check if the vehicle exists
  const vehicleQuery = "SELECT * FROM vehicles WHERE vehicle_id = ?";
  db.query(vehicleQuery, [vehicle_id], (err, vehicleRows) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Database error occurred." });
    }

    if (vehicleRows.length > 0) {
      // Check if the vehicle number is already in use by another vehicle
      const checkVehicleNumberQuery =
        "SELECT * FROM vehicles WHERE vehicle_number = ? AND vehicle_id != ?";
      db.query(
        checkVehicleNumberQuery,
        [vehicle_number, vehicle_id],
        (err, result) => {
          if (err) {
            console.error("Database error:", err);
            return res
              .status(500)
              .json({ message: "Database error occurred." });
          }

          if (result.length > 0) {
            return res
              .status(400)
              .json({ message: "The vehicle number is already in use." });
          }
          // Update vehicle details
          const updateVehicleQuery =
            "UPDATE vehicles SET vehicle_number = ?, type = ?, brand = ?, purchase_date = ?, status = ?, created_date = ? WHERE vehicle_id = ?";
          const createdDate = moment().format("YYYY-MM-DD HH:mm:ss");

          db.query(
            updateVehicleQuery,
            [
              vehicle_number,
              type,
              brand,
              purchase_date,
              status,
              createdDate,
              vehicle_id,
            ],
            (err) => {
              if (err) {
                console.error("Update error:", err);
                return res
                  .status(500)
                  .json({ message: "Failed to update vehicle details." });
              }

              res.status(200).json({
                message: "Vehicle details updated successfully.",
                vehicle_id,
              });
            }
          );
        }
      );
    } else {
      return res.status(404).json({ message: "Vehicle not found." });
    }
  });
});

// API to get all vehicles
router.get("/", (req, res) => {
  const query = `
    SELECT *
    FROM vehicles
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching vehicles and driver names:", err);
      res.status(500).send("Error fetching vehicles and driver names.");
      return;
    }

    res.json(results);
  });
});

// Add vehicles
router.post("/", (req, res) => {
  const { vehicle_number, type, brand, status, purchase_date } = req.body;

  // Validate input fields
  if (!vehicle_number || !type || !brand || !status || !purchase_date) {
    return res.status(400).json({ message: "All fields are required." });
  }

  // Query to check if the vehicle already exists
  const vehicleQuery =
    "SELECT vehicle_id FROM vehicles WHERE vehicle_number = ?";
  db.query(vehicleQuery, [vehicle_number], (err, vehicleRows) => {
    if (err) {
      console.error("Error checking vehicle existence:", err);
      return res.status(500).json({ message: "Database error occurred." });
    }

    if (vehicleRows.length > 0) {
      return res.status(409).json({ message: "Vehicle is already added." });
    } else {
      // Query to insert a new vehicle
      const insertVehicleQuery =
        "INSERT INTO vehicles (vehicle_number, type, brand, status, purchase_date, created_date) VALUES (?, ?, ?, ?, ?, ?)";
      const createdDate = moment().format("YYYY-MM-DD HH:mm:ss");

      db.query(
        insertVehicleQuery,
        [vehicle_number, type, brand, status, purchase_date, createdDate],
        (err, result) => {
          if (err) {
            console.error("Error inserting vehicle details:", err);
            return res
              .status(500)
              .json({ message: "Failed to insert vehicle details." });
          }
          return res.status(201).json({
            message: "Vehicle details added successfully.",
            vehicle_id: result.insertId, // Optionally return the inserted ID
          });
        }
      );
    }
  });
});

// DELETE API to remove a vehicle by vehicle_number
router.delete("/:vehicle_id", (req, res) => {
  const { vehicle_id } = req.params;

  if (!vehicle_id) {
    return res.status(400).json({ message: "Vehicle id is required." });
  }

  // First, delete the vehicle associated with the driver by
  const deleteDriverQuery = "DELETE FROM driverby WHERE vehicle_id = ?";
  db.query(deleteDriverQuery, [vehicle_id], (err) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Failed to delete vehicle in driver by table." });
    }

    // second, delete the vehicle associated with the expenses by
    const deleteExpensesQuery = "DELETE FROM expenses WHERE vehicle_id = ?";
    db.query(deleteExpensesQuery, [vehicle_id], (err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to delete expenses." });
      }

      const deleteVehicleQuery = "DELETE FROM vehicles WHERE vehicle_id = ?";
      db.query(deleteVehicleQuery, [vehicle_id], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: "Failed to delete vehicle." });
        }

        res.status(200).json({
          message: "Vehicle deleted successfully.",
        });
      });
    });
  });
});

// API to get all vehicles numbers
router.get("/numbers", (req, res) => {
  const query = `
    SELECT vehicle_number
    FROM vehicles
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching vehicles and driver names:", err);
      res.status(500).send("Error fetching vehicles and driver names.");
      return;
    }

    res.json(results);
  });
});

// API to get all active vehicle numbers
router.get("/active", (req, res) => {
  const query = `
    SELECT vehicle_number
    FROM vehicles
    WHERE status = 'Active'
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching active vehicles:", err);
      res.status(500).send("Error fetching active vehicles.");
      return;
    }

    res.json(results);
  });
});

module.exports = router;
