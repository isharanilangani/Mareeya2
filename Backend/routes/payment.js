const express = require("express");
const db = require("../config/db");
const router = express.Router();

// Add or Update Vehicle Repair Record
router.put("/:license_number/:date", (req, res) => {
  const { license_number, date } = req.params;
  const { purpose, amount } = req.body;

  // Ensure all required fields are provided
  if (!license_number || !date || !purpose || !amount) {
    return res.status(400).json({ message: "All fields are required." });
  }

  // Fetch vehicle_id from vehicle_number
  const vehicleQuery =
    "SELECT driver_id FROM drivers WHERE license_number = ?";
  db.query(vehicleQuery, [license_number], (err, vehicleRows) => {
    if (err) {
      console.error(err);
      return res
        .status(500)
        .json({ message: "Database error occurred while fetching vehicle." });
    }

    if (vehicleRows.length === 0) {
      return res.status(404).json({ message: "Driver not found." });
    }

    const driverId = vehicleRows[0].driver_id;

    // Check if a repair record exists for the vehicle and date
    const repairQuery =
      "SELECT payment_id FROM payments WHERE driver_id = ? AND date = ?";
    db.query(repairQuery, [driverId, date], (err, repairRows) => {
      if (err) {
        console.error(err);
        return res
          .status(500)
          .json({
            message: "Database error occurred while checking repair records.",
          });
      }

      if (repairRows.length > 0) {
        // Repair record exists, update it
        const repairId = repairRows[0].payment_id;
        const updateRepairQuery =
          "UPDATE payments SET purpose = ?, amount = ? WHERE payment_id = ? AND date = ?";
        db.query(
          updateRepairQuery,
          [purpose, amount, repairId, date],
          (err) => {
            if (err) {
              console.error(err);
              return res
                .status(500)
                .json({ message: "Failed to update payment record." });
            }
            res
              .status(200)
              .json({ message: "Payments record updated successfully." });
          }
        );
      } else {
        // Insert a new repair record
        const insertRepairQuery =
          "INSERT INTO payments (driver_id, date, amount, purpose) VALUES (?, ?, ?, ?)";
        db.query(
          insertRepairQuery,
          [driverId, date, amount, purpose],
          (err) => {
            if (err) {
              console.error(err);
              return res
                .status(500)
                .json({ message: "Failed to insert payments record." });
            }
            res
              .status(200)
              .json({ message: "Payment record added successfully." });
          }
        );
      }
    });
  });
});

// Get All Repair Records
router.get("/", (req, res) => {
  const query = `
    SELECT payments.*, drivers.license_number, drivers.name
    FROM payments
    LEFT JOIN drivers ON payments.driver_id = drivers.driver_id
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching repair records:", err);
      res.status(500).send("Error fetching repair records.");
      return;
    }

    res.json(results);
  });
});

// Add a New Repair Record
router.post("/", (req, res) => {
  const { license_number, date, purpose, amount, name} = req.body;

  if (!license_number || !date || !purpose || !amount || !name ) {
    return res.status(400).json({ message: "All fields are required." });
  }

  // Fetch vehicle_id from vehicle_number
  const vehicleQuery =
    "SELECT driver_id FROM drivers WHERE license_number = ?";
  db.query(vehicleQuery, [license_number], (err, vehicleRows) => {
    if (err) {
      console.error(err);
      return res
        .status(500)
        .json({ message: "Database error occurred while fetching vehicle." });
    }

    if (vehicleRows.length === 0) {
      return res.status(404).json({ message: "Driver not found." });
    }

    const driverId = vehicleRows[0].driver_id;

    // Check if a repair record exists for the vehicle and date
    const repairQuery =
      "SELECT payment_id FROM payments WHERE driver_id = ? AND date = ?";
    db.query(repairQuery, [driverId, date], (err, repairRows) => {
      if (err) {
        console.error(err);
        return res
          .status(500)
          .json({
            message: "Database error occurred while checking payments records.",
          });
      }

      if (repairRows.length > 0) {
        // Repair record exists, update it
        const paymentId = repairRows[0].payment_id;
        const updateRepairQuery =
          "UPDATE payments SET purpose = ?, amount = ? WHERE payment_id = ? AND date= ? ";
        db.query(
          updateRepairQuery,
          [purpose, amount, paymentId, date],
          (err) => {
            if (err) {
              console.error(err);
              return res
                .status(500)
                .json({ message: "Failed to update payment record." });
            }
            res
              .status(200)
              .json({ message: "payment record updated successfully." });
          }
        );
      } else {
        // Insert a new repair record
        const insertRepairQuery =
          "INSERT INTO payments (driver_id, date, purpose, amount) VALUES (?, ?, ?, ?)";
        db.query(
          insertRepairQuery,
          [driverId, date, purpose, amount],
          (err) => {
            if (err) {
              console.error(err);
              return res
                .status(500)
                .json({ message: "Failed to insert payment record." });
            }
            res
              .status(200)
              .json({ message: "Payments record added successfully." });
          }
        );
      }
    });
  });
});

// Delete a Repair Record by ID
router.delete("/:license_number/:date", (req, res) => {
  const { license_number, date } = req.params;

  if (!license_number || !date) {
    return res.status(400).json({ message: "Vehicle number and date are required." });
  }

  // Fetch vehicle_id from vehicle_number
  const vehicleQuery = "SELECT driver_id FROM drivers WHERE license_number = ?";
  db.query(vehicleQuery, [license_number], (err, vehicleRows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database error occurred while fetching driver." });
    }

    if (vehicleRows.length === 0) {
      return res.status(404).json({ message: "Driver not found." });
    }

    const driverId = vehicleRows[0].driver_id;

    // Check if a repair record exists for the vehicle and date
    const repairQuery = "SELECT payment_id FROM payments WHERE driver_id = ? AND date = ?";
    db.query(repairQuery, [driverId, date], (err, repairRows) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Database error occurred while fetching payment record." });
      }

      if (repairRows.length === 0) {
        return res.status(404).json({ message: "Payment record not found." });
      }

      const paymentId = repairRows[0].payment_id;

      // Delete the repair record
      const deleteRepairQuery = "DELETE FROM payments WHERE payment_id = ?";
      db.query(deleteRepairQuery, [paymentId], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: "Failed to delete payment record." });
        }

        res.status(200).json({ message: "Payment record deleted successfully." });
      });
    });
  });
});

module.exports = router;
