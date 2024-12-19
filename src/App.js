// src/App.js
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext"; // Import the AuthProvider
import LoginPage from "./Page/LoginPage";
import Dashboard from "./Page/Dashboard";
import Settings from "./Page/Settings";
import Vehicle from "./Page/DetailVehicle";
import VehicleRepair from "./Page/DetailVehicleRepair";
import Driver from "./Page/DetailDriver";
import DriverPayments from "./Page/DetailDriverPayments";
import ManageVehicle from "./Page/ManageVehicle";
import ManageDriver from "./Page/ManageDriver";
import PrivateRoute from "./components/PrivateRoute"; // Import the PrivateRoute component

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LoginPage />} />

          {/* Protected Routes */}
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/vehicle" element={<Vehicle />} />
            <Route path="/vehicleRepair" element={<VehicleRepair />} />
            <Route path="/driver" element={<Driver />} />
            <Route path="/driverPayments" element={<DriverPayments />} />
            <Route path="/manageVehicle" element={<ManageVehicle />} />
            <Route path="/manageDriver" element={<ManageDriver />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
