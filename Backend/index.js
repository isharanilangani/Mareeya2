const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth");
const vehicleRoutes = require("./routes/vehicles");
const vehicleRepairRoutes = require("./routes/repair");
const driverRoutes = require("./routes/driver");
const driverPaymentRoutes = require("./routes/payment");

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
app.use("/api/vehicle/repair", vehicleRepairRoutes);
app.use("/api/driver", driverRoutes);
app.use("/api/driver/payment", driverPaymentRoutes);

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
