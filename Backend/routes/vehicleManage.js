const express = require("express");
const db = require("../config/db");
const router = express.Router();

// API to get total payments
router.get("/total", (req, res) => {
  const query = `
      SELECT SUM(amount) AS total_expenses
      FROM expenses
    `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching total expenses:", err);
      res.status(500).send("Error fetching total expenses.");
      return;
    }

    res.json(results);
  });
});

// API to get expenses details for selected vehicle_number and month-year
router.post("/details", (req, res) => {
  const { vehicle_number, start_date, end_date } = req.body; 

  if (!vehicle_number || !start_date || !end_date) {
    return res
      .status(400)
      .send("Vehicle number, start date, and end date are required.");
  }

  // Step 3: Format the dates for MySQL query (ensure they're YYYY-MM-DD)
  const formattedStartDate = new Date(start_date).toISOString().split("T")[0];
  const formattedEndDate = new Date(end_date).toISOString().split("T")[0];

  // Query to get payment details between start_date and end_date
  const query = `
    SELECT e.payment_date, e.description, e.amount
    FROM expenses e
    JOIN vehicles v ON e.vehicle_id = v.vehicle_id
    WHERE v.vehicle_number = ? 
    AND e.payment_date BETWEEN ? AND ?
  `;

  db.query(query, [vehicle_number, formattedStartDate, formattedEndDate], (err, results) => {
    if (err) {
      console.error("Error fetching expenses details:", err);
      return res.status(500).send("Error fetching expenses details.");
    }

    if (results.length === 0) {
      return res
        .status(404)
        .send(
          "No expenses details found for the selected vehicle number and date range."
        );
    }

    // Calculate total payments in JavaScript
    const totalPayments = results.reduce(
      (acc, payment) => acc + parseFloat(payment.amount),
      0
    );

    res.json({
      payments: results,
      total_payments: totalPayments, // Send total payments in response
    });
  });
});

module.exports = router;
