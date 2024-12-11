const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth");
const vehicleRoutes = require("./routes/vehicles");

dotenv.config();
const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
  })
);
app.use(bodyParser.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/vehicle", vehicleRoutes);

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
