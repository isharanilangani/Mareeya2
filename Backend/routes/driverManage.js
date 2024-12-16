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

module.exports = router;
