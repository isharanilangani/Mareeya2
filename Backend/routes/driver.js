const express = require("express");
const db = require("../config/db");
const router = express.Router();

// Register or Update Vehicle and Driver
router.put("/:vehicle_number", (req, res) => {
  const { vehicle_number } = req.params;
  const { driver_name, contact, license_number } = req.body;

  // Validate required fields
  if (!vehicle_number || !contact || !driver_name || !license_number) {
    return res.status(400).json({ message: "All fields are required." });
  }

  const vehicleQuery =
    "SELECT vehicle_id FROM vehicles WHERE vehicle_number = ?";
  db.query(vehicleQuery, [vehicle_number], (err, vehicleRows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database error occurred." });
    }

    if (vehicleRows.length > 0) {
      // Vehicle exists, update the driver details
      const vehicleId = vehicleRows[0].vehicle_id;
      const updateDriverQuery =
        "UPDATE drivers SET name = ?, contact = ?, license_number = ? WHERE vehicle_id = ?";
      db.query(
        updateDriverQuery,
        [driver_name, contact, license_number, vehicleId],
        (err) => {
          if (err) {
            console.error(err);
            return res
              .status(500)
              .json({ message: "Failed to update driver details." });
          }
          return res
            .status(200)
            .json({ message: "Driver details updated successfully." });
        }
      );
    } else {
      // Vehicle doesn't exist, insert a new vehicle and driver
      const insertVehicleQuery =
        "INSERT INTO vehicles (vehicle_number) VALUES (?)";
      db.query(insertVehicleQuery, [vehicle_number], (err, result) => {
        if (err) {
          console.error(err);
          return res
            .status(500)
            .json({ message: "Failed to insert vehicle details." });
        }

        const vehicleId = result.insertId;
        const insertDriverQuery =
          "INSERT INTO drivers (name, contact, license_number, vehicle_id) VALUES(?, ?, ?, ?)";
        db.query(
          insertDriverQuery,
          [driver_name, contact, license_number, vehicleId],
          (err) => {
            if (err) {
              console.error(err);
              return res
                .status(500)
                .json({ message: "Failed to insert driver details." });
            }

            return res.status(200).json({
              message: "Vehicle and driver details added successfully.",
              vehicleId,
            });
          }
        );
      });
    }
  });
});

// API to get all drivers
router.get("/", (req, res) => {
  const query = `
    SELECT drivers.*, vehicles.vehicle_number AS vehicle_no
    FROM drivers
    RIGHT JOIN vehicles ON drivers.vehicle_id = vehicles.vehicle_id
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

// DELETE API to remove a vehicle by vehicle_number
router.delete("/:vehicle_number", (req, res) => {
  const { vehicle_number } = req.params;

  if (!vehicle_number) {
    return res.status(400).json({ message: "License number is required." });
  }

  // Query to fetch the vehicle ID associated with the driver
  const getVehicleIdQuery = `
      SELECT vehicle_id 
      FROM vehicles 
      WHERE vehicle_number = ?
    `;

  db.query(getVehicleIdQuery, [vehicle_number], (err, rows) => {
    if (err) {
      console.error("Error fetching vehicle ID:", err);
      return res.status(500).json({ message: "Database error occurred." });
    }

    if (rows.length === 0) {
      return res.status(404).json({
        message:
          "No driver or associated vehicle found for the given vehicle number.",
      });
    }

    const vehicleId = rows[0].vehicle_id;

    // Begin deletion process
    const deleteDriverQuery = "DELETE FROM drivers WHERE vehicle_id = ?";
    db.query(deleteDriverQuery, [vehicleId], (err) => {
      if (err) {
        console.error("Error deleting driver:", err);
        return res.status(500).json({ message: "Failed to delete driver." });
      }

      const deleteVehicleQuery = "DELETE FROM vehicles WHERE vehicle_id = ?";
      db.query(deleteVehicleQuery, [vehicleId], (err) => {
        if (err) {
          console.error("Error deleting vehicle:", err);
          return res.status(500).json({ message: "Failed to delete vehicle." });
        }

        res.status(200).json({
          message: "Vehicle and associated driver deleted successfully.",
        });
      });
    });
  });
});

// API to get all vehicles numbers
router.get("/numbers", (req, res) => {
  const query = `
    SELECT license_number
    FROM drivers
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

//insert new driver
router.post("/", (req, res) => {
  const { vehicle_number, driver_name, contact, license_number } = req.body;

  // Validate required fields
  if (!vehicle_number || !contact || !driver_name || !license_number) {
    return res.status(400).json({ message: "All fields are required." });
  }

  const vehicleQuery =
    "SELECT vehicle_id FROM vehicles WHERE vehicle_number = ?";
  db.query(vehicleQuery, [vehicle_number], (err, vehicleRows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database error occurred." });
    }

    if (vehicleRows.length > 0) {
      // Vehicle exists, update the driver details
      const vehicleId = vehicleRows[0].vehicle_id;
      const updateDriverQuery =
        "UPDATE drivers SET name = ?, contact = ?, license_number = ? WHERE vehicle_id = ?";
      db.query(
        updateDriverQuery,
        [driver_name, contact, license_number, vehicleId],
        (err) => {
          if (err) {
            console.error(err);
            return res
              .status(500)
              .json({ message: "Failed to update driver details." });
          }
          return res
            .status(200)
            .json({ message: "Driver details updated successfully." });
        }
      );
    } else {
      // Vehicle doesn't exist, insert a new vehicle and driver
      const insertVehicleQuery =
        "INSERT INTO vehicles (vehicle_number) VALUES (?)";
      db.query(insertVehicleQuery, [vehicle_number], (err, result) => {
        if (err) {
          console.error(err);
          return res
            .status(500)
            .json({ message: "Failed to insert vehicle details." });
        }

        const vehicleId = result.insertId;
        const insertDriverQuery =
          "INSERT INTO drivers (name, contact, license_number, vehicle_id) VALUES(?, ?, ?, ?)";
        db.query(
          insertDriverQuery,
          [driver_name, contact, license_number, vehicleId],
          (err) => {
            if (err) {
              console.error(err);
              return res
                .status(500)
                .json({ message: "Failed to insert driver details." });
            }

            return res.status(200).json({
              message: "Vehicle and driver details added successfully.",
              vehicleId,
            });
          }
        );
      });
    }
  });
});

// API to get all drivers name
router.get("/name", (req, res) => {
  const query = `
    SELECT name, license_number
    FROM drivers
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


module.exports = router;
