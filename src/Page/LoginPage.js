// src/LoginPage.js
import React, { useState } from "react";
import "./LoginPage.css";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(""); // Reset previous error
    setSuccess(false); // Reset previous success state
    setLoading(true); // Set loading state to true

    // Basic validation for username and password
    if (!username || !password) {
      setError("Both fields are required.");
      setLoading(false); // Stop loading if validation fails
      return;
    }

    try {
      // Send POST request to the backend
      const response = await fetch("http://localhost:10000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      // Check if the response is OK
      if (!response.ok) {
        throw new Error("Invalid username or password");
      }

      // Parse the response
      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        console.log("Login successful:", data);
      } else {
        setError("Invalid username or password");
      }
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false); // Reset loading state
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
