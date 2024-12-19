const express = require("express");
const db = require("../config/db");
const router = express.Router();
const moment = require("moment");

// Register or Update Vehicle and Driver
router.put("/:driver_id", (req, res) => {
  const { driver_id } = req.params;
  const { driver_name, contact, license_number, vehicle_numbers } = req.body;

  // Validate required fields
  if (!driver_id || !contact || !driver_name || !license_number || !vehicle_numbers || !Array.isArray(vehicle_numbers)) {
    return res.status(400).json({ message: "All fields are required and vehicle_numbers must be an array." });
  }

  // Validate if the array of vehicle numbers is not empty
  if (vehicle_numbers.length === 0) {
    return res.status(400).json({ message: "At least one vehicle number is required." });
  }

  // Query to check if driver exists
  const driverQuery = "SELECT * FROM drivers WHERE driver_id = ?";
  db.query(driverQuery, [driver_id], (err, driverRows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database error occurred." });
    }

    if (driverRows.length > 0) {
      const createdDate = moment().format("YYYY-MM-DD HH:mm:ss");

      // Update driver details
      const updateDriverQuery = "UPDATE drivers SET name = ?, contact = ?, license_number = ?, created_date = ? WHERE driver_id = ?";
      db.query(updateDriverQuery, [driver_name, contact, license_number, createdDate, driver_id], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: "Failed to update driver details." });
        }

        // Get vehicle IDs for the relevant vehicle numbers
        const vehicleQuery = "SELECT vehicle_id FROM vehicles WHERE vehicle_number IN (?)";
        db.query(vehicleQuery, [vehicle_numbers], (err, vehicleRows) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ message: "Failed to fetch vehicle IDs." });
          }

          if (vehicleRows.length === 0) {
            return res.status(404).json({ message: "No vehicles found with the given vehicle numbers." });
          }

          // Delete driver ID from the driverby table for relevant vehicles
          const deleteDriverQuery = "DELETE FROM driverby WHERE driver_id = ?";
          db.query(deleteDriverQuery, [driver_id], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({ message: "Failed to delete driver associations from driverby table." });
            }

            // Insert new driver ID for the relevant vehicles
            const insertDriverQuery = "INSERT INTO driverby (vehicle_id, driver_id) VALUES ?";
            const vehicleIds = vehicleRows.map((row) => [row.vehicle_id, driver_id]);

            db.query(insertDriverQuery, [vehicleIds], (err) => {
              if (err) {
                console.error(err);
                return res.status(500).json({ message: "Failed to associate vehicles with driver." });
              }

              return res.status(200).json({ message: "Driver details and vehicle associations updated successfully." });
            });
          });
        });
      });
    } else {
      return res.status(404).json({ message: "Driver not found." });
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
        return res
          .status(500)
          .json({ message: "Failed to delete from driverby table." });
      }

      const deletePaymentsQuery = "DELETE FROM payments WHERE driver_id = ?";
      db.query(deletePaymentsQuery, [driver_id], (err) => {
        if (err) {
          console.error("Error deleting from payments table:", err);
          return res
            .status(500)
            .json({ message: "Failed to delete from payments table." });
        }

        const deleteDriverQuery = "DELETE FROM drivers WHERE driver_id = ?";
        db.query(deleteDriverQuery, [driver_id], (err) => {
          if (err) {
            console.error("Error deleting driver:", err);
            return res
              .status(500)
              .json({ message: "Failed to delete driver." });
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

// Insert new driver
router.post("/", (req, res) => {
  const { driver_name, contact, license_number, vehicle_numbers } = req.body;

  // Validate required fields
  if (!vehicle_numbers || !contact || !driver_name || !license_number) {
    return res.status(400).json({ message: "All fields are required." });
  }

  // Step 1: Check if the license number already exists in the drivers table
  const vehicleQuery = "SELECT * FROM drivers WHERE license_number = ?";
  db.query(vehicleQuery, [license_number], (err, vehicleRows) => {
    if (err) {
      console.error("Error checking driver existence:", err);
      return res.status(500).json({ message: "Database error occurred." });
    }

    // Step 2: If the license number exists, get the driver_id
    if (vehicleRows.length > 0) {
      const driverId = vehicleRows[0].driver_id;

      // Step 3: Process each vehicle number
      processVehicleNumbers(driverId, vehicle_numbers, res);
    } else {
      // Step 4: If the license number does not exist, create the driver
      const createdDate = moment().format("YYYY-MM-DD HH:mm:ss");

      const insertDriverQuery = "INSERT INTO drivers (name, contact, license_number, created_date) VALUES (?, ?, ?, ?)";
      db.query(insertDriverQuery, [driver_name, contact, license_number, createdDate], (err, driverResult) => {
        if (err) {
          console.error("Error inserting driver details:", err);
          return res.status(500).json({ message: "Failed to insert driver details." });
        }

        const driverId = driverResult.insertId; // Get the inserted driver ID

        // Step 5: Process each vehicle number for the newly created driver
        processVehicleNumbers(driverId, vehicle_numbers, res);
      });
    }
  });
});

// Helper function to process each vehicle number
const processVehicleNumbers = (driverId, vehicleNumbers, res) => {
  let vehiclesAssigned = 0;
  let failedAssignments = [];

  // Loop through each vehicle number
  vehicleNumbers.forEach((vehicle_number) => {
    // Check if the vehicle exists
    const vehicleIdQuery = "SELECT vehicle_id FROM vehicles WHERE vehicle_number = ?";
    db.query(vehicleIdQuery, [vehicle_number], (err, vehicleResult) => {
      if (err) {
        console.error("Error checking vehicle existence:", err);
        return res.status(500).json({ message: "Database error occurred." });
      }

      if (vehicleResult.length > 0) {
        // Check if the vehicle is already assigned to this driver
        const driverByQuery = "SELECT * FROM driverby WHERE vehicle_id = ? AND driver_id = ?";
        db.query(driverByQuery, [vehicleResult[0].vehicle_id, driverId], (err, driverByResult) => {
          if (err) {
            console.error("Error checking driver-by table:", err);
            return res.status(500).json({ message: "Database error occurred." });
          }

          if (driverByResult.length === 0) {
            // Assign the driver to the vehicle
            const insertDriverByQuery = "INSERT INTO driverby (vehicle_id, driver_id) VALUES (?, ?)";
            db.query(insertDriverByQuery, [vehicleResult[0].vehicle_id, driverId], (err) => {
              if (err) {
                console.error("Error inserting into driver-by table:", err);
                failedAssignments.push(vehicle_number);
              } else {
                vehiclesAssigned++;
              }
            });
          } else {
            failedAssignments.push(vehicle_number); // Vehicle already assigned
          }
        });
      } else {
        failedAssignments.push(vehicle_number); // Vehicle not found
      }
    });
  });

  // After processing all vehicles, send the response
  setTimeout(() => {
    if (failedAssignments.length === 0) {
      return res.status(200).json({
        message: `${vehiclesAssigned} vehicle(s) assigned to driver successfully.`,
      });
    } else {
      return res.status(400).json({
        message: `Some vehicles could not be assigned: ${failedAssignments.join(", ")}`,
      });
    }
  }, 2000); // Adjust the timeout if needed to allow for database query responses
};

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

router.get("/vehicle/numbers", (req, res) => {
  const { license_number } = req.query;

  if (!license_number) {
    return res.status(400).json({ message: "License number is required" });
  }

  // Query to find the driver by license number and get their driver_id
  const driverQuery = `
    SELECT driver_id
    FROM drivers
    WHERE license_number = ?
  `;

  db.query(driverQuery, [license_number], (err, driverResults) => {
    if (err) {
      console.error("Error fetching driver data:", err);
      return res.status(500).send("Error fetching driver data.");
    }

    // Check if the driver was found
    if (driverResults.length === 0) {
      return res.status(404).json({ message: "Driver not found with the given license number." });
    }

    const driver_id = driverResults[0].driver_id;

    // Query to find all vehicle_ids associated with this driver_id from driverby table
    const vehicleQuery = `
      SELECT vehicle_id
      FROM driverby
      WHERE driver_id = ?
    `;

    db.query(vehicleQuery, [driver_id], (err, vehicleResults) => {
      if (err) {
        console.error("Error fetching vehicle data:", err);
        return res.status(500).send("Error fetching vehicle data.");
      }

      // Check if vehicles are found for this driver
      if (vehicleResults.length === 0) {
        return res.status(404).json({ message: "No vehicles found for this driver." });
      }

      // Get all vehicle_ids
      const vehicleIds = vehicleResults.map(row => row.vehicle_id);

      // Now, fetch the vehicle numbers for the corresponding vehicle_ids
      const vehicleNumbersQuery = `
        SELECT vehicle_number
        FROM vehicles
        WHERE vehicle_id IN (?)
      `;

      db.query(vehicleNumbersQuery, [vehicleIds], (err, vehicleNumbersResults) => {
        if (err) {
          console.error("Error fetching vehicle numbers:", err);
          return res.status(500).send("Error fetching vehicle numbers.");
        }

        // Return the list of vehicle numbers associated with the driver
        const vehicleNumbers = vehicleNumbersResults.map(row => row.vehicle_number);
        return res.status(200).json({ vehicle_numbers: vehicleNumbers });
      });
    });
  });
});

module.exports = router;
