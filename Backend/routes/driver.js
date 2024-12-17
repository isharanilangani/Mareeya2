const express = require("express");
const db = require("../config/db");
const router = express.Router();
const moment = require("moment");

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
    SELECT 
      drivers.driver_id, 
      drivers.license_number, 
      drivers.name, 
      drivers.contact, 
      vehicles.vehicle_id, 
      vehicles.vehicle_number
    FROM 
      drivers
    LEFT JOIN 
      driverby ON drivers.driver_id = driverby.driver_id
    LEFT JOIN 
      vehicles ON driverby.vehicle_id = vehicles.vehicle_id
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error(
        "Error fetching drivers, vehicle IDs, and vehicle numbers:",
        err
      );
      res.status(500).send("Error fetching details.");
      return;
    }

    // Group by license number and include all relevant driver details
    const groupedResults = results.reduce((acc, row) => {
      const { license_number, driver_id, name, contact, vehicle_number } = row;

      // Initialize the entry if it doesn't exist
      if (!acc[license_number]) {
        acc[license_number] = {
          driver_id,
          license_number,
          name,
          contact,
          vehicles: [],
        };
      }

      // Add the vehicle details to the array
      acc[license_number].vehicles.push({
        vehicle_number,
      });

      return acc;
    }, {});

    // Convert the grouped result to an array for response
    const finalResponse = Object.values(groupedResults);

    res.json(finalResponse);
  });
});

// DELETE API to remove a driver
router.delete("/:driver_id", (req, res) => {
  const { driver_id } = req.params;

  if (!driver_id) {
    return res.status(400).json({ message: "Driver ID is required." });
  }

  // Step 1: Check if the driver exists
  const checkDriverQuery = `
    SELECT * FROM drivers WHERE driver_id = ?
  `;

  db.query(checkDriverQuery, [driver_id], (err, rows) => {
    if (err) {
      console.error("Error fetching driver ID:", err);
      return res.status(500).json({ message: "Database error occurred." });
    }

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Driver not found.",
      });
    }

    // Step 2: Begin deletion process
    const deleteDriverByQuery = "DELETE FROM driverby WHERE driver_id = ?";
    db.query(deleteDriverByQuery, [driver_id], (err) => {
      if (err) {
        console.error("Error deleting from driverby table:", err);
        return res.status(500).json({ message: "Failed to delete from driverby table." });
      }

      const deletePaymentsQuery = "DELETE FROM payments WHERE driver_id = ?";
      db.query(deletePaymentsQuery, [driver_id], (err) => {
        if (err) {
          console.error("Error deleting from payments table:", err);
          return res.status(500).json({ message: "Failed to delete from payments table." });
        }

        const deleteDriverQuery = "DELETE FROM drivers WHERE driver_id = ?";
        db.query(deleteDriverQuery, [driver_id], (err) => {
          if (err) {
            console.error("Error deleting driver:", err);
            return res.status(500).json({ message: "Failed to delete driver." });
          }

          return res.status(200).json({
            message: "Driver deleted successfully.",
          });
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
  const { vehicle_numbers, driver_name, contact, license_number } = req.body;

  // Validate required fields
  if (!vehicle_numbers || !Array.isArray(vehicle_numbers) || vehicle_numbers.length === 0 || !contact || !driver_name || !license_number) {
    return res.status(400).json({ message: "All fields, including vehicle numbers array, are required." });
  }

  // Step 1: Check if the license number already exists in the drivers table
  const vehicleQuery = "SELECT * FROM drivers WHERE license_number = ?";
  db.query(vehicleQuery, [license_number], (err, vehicleRows) => {
    if (err) {
      console.error("Error checking driver existence:", err);
      return res.status(500).json({ message: "Database error occurred." });
    }

    if (vehicleRows.length > 0) {
      const driverId = vehicleRows[0].driver_id;

      // Process each vehicle number in the array
      const processVehicles = vehicle_numbers.map((vehicle_number) => {
        return new Promise((resolve, reject) => {
          const driverByQuery =
            "SELECT * FROM driverby WHERE vehicle_id = (SELECT vehicle_id FROM vehicles WHERE vehicle_number = ?) AND driver_id = ?";
          db.query(driverByQuery, [vehicle_number, driverId], (err, driverByResult) => {
            if (err) return reject({ message: "Database error occurred while checking driver-by table.", error: err });

            if (driverByResult.length > 0) {
              return reject({ message: `Driver is already assigned to vehicle ${vehicle_number}.` });
            }

            // Step 2: Insert into driver-by table to link driver and vehicle
            const vehicleIdQuery = "SELECT vehicle_id FROM vehicles WHERE vehicle_number = ?";
            db.query(vehicleIdQuery, [vehicle_number], (err, vehicleResult) => {
              if (err || vehicleResult.length === 0) {
                return reject({ message: `Vehicle ${vehicle_number} not found.` });
              }

              const insertDriverByQuery = "INSERT INTO driverby (vehicle_id, driver_id) VALUES (?, ?)";
              db.query(insertDriverByQuery, [vehicleResult[0].vehicle_id, driverId], (err) => {
                if (err) return reject({ message: `Failed to assign driver to vehicle ${vehicle_number}.`, error: err });
                resolve(`Driver assigned to vehicle ${vehicle_number} successfully.`);
              });
            });
          });
        });
      });

      // Process all vehicle numbers
      Promise.allSettled(processVehicles)
        .then((results) => {
          const successMessages = results.filter((r) => r.status === "fulfilled").map((r) => r.value);
          const errorMessages = results.filter((r) => r.status === "rejected").map((r) => r.reason.message);

          return res.status(200).json({
            message: "Processed vehicle numbers.",
            successes: successMessages,
            errors: errorMessages,
          });
        })
        .catch(() => res.status(500).json({ message: "Unexpected error occurred." }));
    } else {
      // Step 3: Insert driver details if license does not exist
      const createdDate = moment().format("YYYY-MM-DD HH:mm:ss");

      const insertDriverQuery =
        "INSERT INTO drivers (name, contact, license_number, created_date) VALUES (?, ?, ?, ?)";
      db.query(insertDriverQuery, [driver_name, contact, license_number, createdDate], (err, driverResult) => {
        if (err) {
          console.error("Error inserting driver details:", err);
          return res.status(500).json({ message: "Failed to insert driver details." });
        }

        const driverId = driverResult.insertId; // Get the inserted driver ID

        // Process each vehicle number in the array
        const processVehicles = vehicle_numbers.map((vehicle_number) => {
          return new Promise((resolve, reject) => {
            const vehicleIdQuery = "SELECT vehicle_id FROM vehicles WHERE vehicle_number = ?";
            db.query(vehicleIdQuery, [vehicle_number], (err, vehicleResult) => {
              if (err || vehicleResult.length === 0) {
                return reject({ message: `Vehicle ${vehicle_number} not found.` });
              }

              const insertDriverByQuery = "INSERT INTO driverby (vehicle_id, driver_id) VALUES (?, ?)";
              db.query(insertDriverByQuery, [vehicleResult[0].vehicle_id, driverId], (err) => {
                if (err) return reject({ message: `Failed to assign driver to vehicle ${vehicle_number}.`, error: err });
                resolve(`Driver assigned to vehicle ${vehicle_number} successfully.`);
              });
            });
          });
        });

        // Process all vehicle numbers
        Promise.allSettled(processVehicles)
          .then((results) => {
            const successMessages = results.filter((r) => r.status === "fulfilled").map((r) => r.value);
            const errorMessages = results.filter((r) => r.status === "rejected").map((r) => r.reason.message);

            return res.status(201).json({
              message: "Driver added and vehicle numbers processed.",
              driver_id: driverId,
              successes: successMessages,
              errors: errorMessages,
            });
          })
          .catch(() => res.status(500).json({ message: "Unexpected error occurred." }));
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
