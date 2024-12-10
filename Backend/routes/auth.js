const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const router = express.Router();

// Register User
router.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const sql = "INSERT INTO user (Username, Password) VALUES (?, ?)";
  db.query(sql, [username, hashedPassword], (err) => {
    if (err) return res.status(500).send(err);
    res.send({ message: "User registered successfully" });
  });
});

// Login User
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .send({ message: "Username and password are required" });
  }

  const sql = "SELECT * FROM user WHERE Username = ?";
  db.query(sql, [username], async (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).send({ message: "Server error" });
    }

    if (results.length === 0) {
      return res.status(401).send({ message: "Invalid credentials" });
    }

    const hashedPassword = results[0].password;
    console.log("Password:", password); // Log plain-text password
    console.log("Hashed Password:", hashedPassword); // Log hashed password from DB

    try {
      const isPasswordMatch = await bcrypt.compare(password, hashedPassword);
      if (!isPasswordMatch) {
        return res.status(401).send({ message: "Invalid credentials" });
      }

      const token = jwt.sign(
        { userId: results[0].id },
        process.env.JWT_SECRET || "default_secret",
        { expiresIn: "1h" }
      );

      res.send({ token });
    } catch (err) {
      console.error("Error comparing passwords:", err);
      return res.status(500).send({ message: "Error processing login" });
    }
  });
});

// API to update username, password, and image_url
router.put("/update", async (req, res) => {
  const { username, password, userId } = req.body;

  if (!userId) {
    return res.status(400).send({ message: "User ID is required for updating profile." });
  }

  // Basic validation
  if (!username || !password ) {
    return res.status(400).send({ message: "Username and password are required." });
  }

  try {
    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // SQL query to update the user's details
    const sql = `
      UPDATE user
      SET username = ?, password = ?
      WHERE pk_id = ?
    `;

    db.query(sql, [username, hashedPassword, userId], (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).send({ message: "Internal server error" });
      }

      if (results.affectedRows === 0) {
        return res.status(404).send({ message: "User not found" });
      }

      // Respond with success
      res.send({ message: "User details updated successfully" });
    });
  } catch (err) {
    console.error("Error updating user details:", err);
    return res.status(500).send({ message: "Error processing update" });
  }
});


module.exports = router;
