// src/LoginPage.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./LoginPage.css";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:10000/api/auth/login",
        {
          username,
          password,
        }
      );

      console.log("Login successful:", response.data);

      // Save the token in localStorage for future requests
      localStorage.setItem("token", response.data.token);

      // Redirect to the dashboard page
      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err.response?.data || err.message);
      setError(
        err.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="login-container">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="USERNAME"
            />
          </div>
          <div>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="PASSWORD"
            />
          </div>
          {error && <div style={{ color: "red" }}>{error}</div>}
          {success && <div style={{ color: "green" }}>Login successful!</div>}
          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
      <footer className="login-footer">
        <p>
          Solution by DraveSpace<br></br>077 673 4021
        </p>
      </footer>
    </div>
  );
};

export default LoginPage;
