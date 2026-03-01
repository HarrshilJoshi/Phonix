import { useState } from "react";
import { auth } from "../firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");

  const handleReset = async (e) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent! Check your inbox.");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="auth-container">
      <h2>Reset Password</h2>
      <form onSubmit={handleReset}>
        <input type="email" placeholder="Enter your email" onChange={(e) => setEmail(e.target.value)} required />
        <button type="submit">Send Reset Link</button>
      </form>
      <Link to="/">Back to Login</Link>
    </div>
  );
}