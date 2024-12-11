const express = require("express");
const db = require("../config/db");
const router = express.Router();

// Add or Update Vehicle Repair Record
router.put("/:vehicle_number", (req, res) => {
  const { vehicle_number } = req.params;
  const { date, description, amount } = req.body;

  // Ensure all required fields are provided
  if (!vehicle_number || !date || !description || !amount) {
    return res.status(400).json({ message: "All fields are required." });
  }

  // Fetch vehicle_id from vehicle_number
  const vehicleQuery =
    "SELECT vehicle_id FROM vehicles WHERE vehicle_number = ?";
  db.query(vehicleQuery, [vehicle_number], (err, vehicleRows) => {
    if (err) {
      console.error(err);
      return res
        .status(500)
        .json({ message: "Database error occurred while fetching vehicle." });
    }

    if (vehicleRows.length === 0) {
      return res.status(404).json({ message: "Vehicle not found." });
    }

    const vehicle_id = vehicleRows[0].vehicle_id;

    // Check if a repair record exists for the vehicle and date
    const repairQuery =
      "SELECT expense_id FROM expenses WHERE vehicle_id = ? AND date = ?";
    db.query(repairQuery, [vehicle_id, date], (err, repairRows) => {
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
        const repairId = repairRows[0].expense_id;
        const updateRepairQuery =
          "UPDATE expenses SET description = ?, amount = ?, date =? WHERE expense_id = ?";
        db.query(
          updateRepairQuery,
          [description, amount, date, repairId],
          (err) => {
            if (err) {
              console.error(err);
              return res
                .status(500)
                .json({ message: "Failed to update repair record." });
            }
            res
              .status(200)
              .json({ message: "Repair record updated successfully." });
          }
        );
      } else {
        // Insert a new repair record
        const insertRepairQuery =
          "INSERT INTO expenses (vehicle_id, date, description, amount) VALUES (?, ?, ?, ?)";
        db.query(
          insertRepairQuery,
          [vehicle_id, date, description, amount],
          (err) => {
            if (err) {
              console.error(err);
              return res
                .status(500)
                .json({ message: "Failed to insert repair record." });
            }
            res
              .status(200)
              .json({ message: "Repair record added successfully." });
          }
        );
      }
    });
  });
});

// Get All Repair Records
router.get("/", (req, res) => {
  const query = `
    SELECT expenses.*, vehicles.vehicle_number 
    FROM expenses
    LEFT JOIN vehicles ON expenses.vehicle_id = vehicles.vehicle_id
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
  const { vehicle_number, date, description, amount } = req.body;

  if (!vehicle_number || !date || !description || !amount) {
    return res.status(400).json({ message: "All fields are required." });
  }

  // Fetch vehicle_id from vehicle_number
  const vehicleQuery =
    "SELECT vehicle_id FROM vehicles WHERE vehicle_number = ?";
  db.query(vehicleQuery, [vehicle_number], (err, vehicleRows) => {
    if (err) {
      console.error(err);
      return res
        .status(500)
        .json({ message: "Database error occurred while fetching vehicle." });
    }

    if (vehicleRows.length === 0) {
      return res.status(404).json({ message: "Vehicle not found." });
    }

    const vehicle_id = vehicleRows[0].vehicle_id;

    // Check if a repair record exists for the vehicle and date
    const repairQuery =
      "SELECT expense_id FROM expenses WHERE vehicle_id = ? AND date = ?";
    db.query(repairQuery, [vehicle_id, date], (err, repairRows) => {
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
        const repairId = repairRows[0].expense_id;
        const updateRepairQuery =
          "UPDATE expenses SET description = ?, amount = ?, date =? WHERE expense_id = ?";
        db.query(
          updateRepairQuery,
          [description, amount, date, repairId],
          (err) => {
            if (err) {
              console.error(err);
              return res
                .status(500)
                .json({ message: "Failed to update repair record." });
            }
            res
              .status(200)
              .json({ message: "Repair record updated successfully." });
          }
        );
      } else {
        // Insert a new repair record
        const insertRepairQuery =
          "INSERT INTO expenses (vehicle_id, date, description, amount) VALUES (?, ?, ?, ?)";
        db.query(
          insertRepairQuery,
          [vehicle_id, date, description, amount],
          (err) => {
            if (err) {
              console.error(err);
              return res
                .status(500)
                .json({ message: "Failed to insert repair record." });
            }
            res
              .status(200)
              .json({ message: "Repair record added successfully." });
          }
        );
      }
    });
  });
});

// Delete a Repair Record by ID
router.delete("/:vehicle_number/:date", (req, res) => {
  const { vehicle_number, date } = req.params;

  if (!vehicle_number || !date) {
    return res.status(400).json({ message: "Vehicle number and date are required." });
  }

  // Fetch vehicle_id from vehicle_number
  const vehicleQuery = "SELECT vehicle_id FROM vehicles WHERE vehicle_number = ?";
  db.query(vehicleQuery, [vehicle_number], (err, vehicleRows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database error occurred while fetching vehicle." });
    }

    if (vehicleRows.length === 0) {
      return res.status(404).json({ message: "Vehicle not found." });
    }

    const vehicle_id = vehicleRows[0].vehicle_id;

    // Check if a repair record exists for the vehicle and date
    const repairQuery = "SELECT expense_id FROM expenses WHERE vehicle_id = ? AND date = ?";
    db.query(repairQuery, [vehicle_id, date], (err, repairRows) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Database error occurred while fetching repair record." });
      }

      if (repairRows.length === 0) {
        return res.status(404).json({ message: "Repair record not found." });
      }

      const expense_id = repairRows[0].expense_id;

      // Delete the repair record
      const deleteRepairQuery = "DELETE FROM expenses WHERE expense_id = ?";
      db.query(deleteRepairQuery, [expense_id], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: "Failed to delete repair record." });
        }

        res.status(200).json({ message: "Repair record deleted successfully." });
      });
    });
  });
});

module.exports = router;
