const express = require("express");
const db = require("../config/db");
const router = express.Router();
const moment = require("moment");

// Add or Update Vehicle Repair Record
router.put("/:license_number", (req, res) => {
  const { license_number } = req.params;
  const { date, purpose, amount } = req.body;

  // Input Validation
  if (!license_number || !date || !purpose || !amount) {
    return res.status(400).json({ message: "All fields are required." });
  }

  // Step 1: Fetch driver_id from drivers table
  const driverQuery = "SELECT driver_id FROM drivers WHERE license_number = ?";
  db.query(driverQuery, [license_number], (err, driverRows) => {
    if (err) {
      console.error("Error fetching driver:", err);
      return res
        .status(500)
        .json({ message: "Database error occurred while fetching driver." });
    }

    if (driverRows.length === 0) {
      return res.status(404).json({ message: "Driver not found." });
    }

    const driverId = driverRows[0].driver_id;

    // Step 2: Check if payment record exists for the driver
    const paymentQuery =
      "SELECT payment_id FROM payments WHERE driver_id = ?";
    db.query(paymentQuery, [driverId], (err, paymentRows) => {
      if (err) {
        console.error("Error fetching payments:", err);
        return res
          .status(500)
          .json({ message: "Database error occurred while checking payments." });
      }

      if (paymentRows.length > 0) {
        // Step 3: Update the existing payment record
        const paymentId = paymentRows[0].payment_id;
        const createdDate = moment().format("YYYY-MM-DD HH:mm:ss");

        const updatePaymentQuery =
          "UPDATE payments SET purpose = ?, amount = ?, payment_date = ?, created_date = ? WHERE payment_id = ?";
        db.query(
          updatePaymentQuery,
          [purpose, amount, date, createdDate, paymentId],
          (err) => {
            if (err) {
              console.error("Error updating payment:", err);
              return res
                .status(500)
                .json({ message: "Failed to update payment record." });
            }
            res.status(200).json({ message: "Payment record updated successfully." });
          }
        );
      } else {
        // Step 4: Payment record does not exist
        res
          .status(404)
          .json({ message: "No payment record found for this driver." });
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
router.post("/", async (req, res) => {
  const { license_number, date, purpose, amount, name } = req.body;

  if (!license_number || !date || !purpose || !amount || !name) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    // Fetch driver_id from drivers table
    const [driverRows] = await db.promise().query(
      "SELECT driver_id FROM drivers WHERE license_number = ?",
      [license_number]
    );

    if (driverRows.length === 0) {
      return res.status(404).json({ message: "Driver not found." });
    }

    const driverId = driverRows[0].driver_id;

    // Check for existing payment record
    const [paymentRows] = await db.promise().query(
      "SELECT payment_id FROM payments WHERE driver_id = ? AND payment_date = ?",
      [driverId, date]
    );

    if (paymentRows.length > 0) {
      return res
        .status(409)
        .json({ message: "Payment record already exists for this date." });
    }

    // Insert a new payment record
    const createdDate = moment().format("YYYY-MM-DD HH:mm:ss");
    await db.promise().query(
      "INSERT INTO payments (driver_id, payment_date, purpose, amount, created_date) VALUES (?, ?, ?, ?, ?)",
      [driverId, date, purpose, amount, createdDate]
    );

    res.status(201).json({ message: "Payment record added successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred while processing." });
  }
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
    const repairQuery = "SELECT payment_id FROM payments WHERE driver_id = ? AND payment_date = ?";
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
