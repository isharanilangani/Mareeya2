// src/App.js
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LoginPage from "./Page/LoginPage";
import Dashboard from "./Page/Dashboard";
import Settings from "./Page/Settings";

function App() {
  return (
    <Router>
      <Routes>
        {/* Add routes for different pages */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Router>
  );
}

export default App;
