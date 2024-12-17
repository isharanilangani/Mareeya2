const express = require("express");
const db = require("../config/db");
const router = express.Router();

// API to get total payments
router.get("/total", (req, res) => {
  const query = `
      SELECT SUM(amount) AS total_payments
      FROM payments
    `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching total payment:", err);
      res.status(500).send("Error fetching total payment.");
      return;
    }

    res.json(results);
  });
});

// API to get payment details for selected license_number and month-year
router.post("/details", (req, res) => {
  const { license_number, start_date, end_date } = req.body; // Extract data from the request body

  if (!license_number || !start_date || !end_date) {
    return res
      .status(400)
      .send("License number, start date, and end date are required.");
  }

  // Step 3: Format the dates for MySQL query (ensure they're YYYY-MM-DD)
  const formattedStartDate = new Date(start_date).toISOString().split("T")[0];
  const formattedEndDate = new Date(end_date).toISOString().split("T")[0];

  // Query to get payment details between start_date and end_date
  const query = `
    SELECT p.payment_date, p.purpose, p.amount
    FROM payments p
    JOIN drivers d ON p.driver_id = d.driver_id
    WHERE d.license_number = ? 
    AND p.payment_date BETWEEN ? AND ?
  `;

  db.query(query, [license_number, formattedStartDate, formattedEndDate], (err, results) => {
    if (err) {
      console.error("Error fetching payment details:", err);
      return res.status(500).send("Error fetching payment details.");
    }

    if (results.length === 0) {
      return res
        .status(404)
        .send(
          "No payment details found for the selected license number and date range."
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
