import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

function VerifyOtp() {
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  if (!email) {
    return <p style={{ textAlign: "center" }}>Invalid access</p>;
  }

  const handleVerifyOtp = async () => {
    if (!otp) {
      setMessage("Please enter OTP");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:8080/api/auth/verify-otp",
        { email, otp }
      );

      // ✅ STORE JWT
      localStorage.setItem("token", res.data);

      // ✅ REDIRECT TO HOME
      navigate("/home");

    } catch (err) {
      setMessage(err.response?.data || "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: "320px", margin: "50px auto" }}>
      <h2>Verify OTP</h2>

      <p>
        OTP sent to <b>{email}</b>
      </p>

      <input
        type="text"
        placeholder="Enter 6-digit OTP"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        style={{ width: "100%", marginBottom: "10px" }}
      />

      <button
        onClick={handleVerifyOtp}
        disabled={loading}
        style={{ width: "100%" }}
      >
        {loading ? "Verifying..." : "Verify OTP"}
      </button>

      {message && <p style={{ marginTop: "10px" }}>{message}</p>}
    </div>
  );
}

export default VerifyOtp;
