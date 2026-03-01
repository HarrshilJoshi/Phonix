// import { auth } from "../firebase";
// import { sendEmailVerification, signOut } from "firebase/auth";
// import { useNavigate } from "react-router-dom";

// const VerifyEmail = () => {
//   const navigate = useNavigate();

//   const handleResend = async () => {
//     if (auth.currentUser) {
//       await sendEmailVerification(auth.currentUser);
//       alert("New verification link sent!");
//     }
//   };

//   return (
//     <div className="verify-container">
//       <h1>Verify your Email</h1>
//       <p>We sent a link to {auth.currentUser?.email}. Please click it to access the player.</p>
//       <button onClick={() => window.location.reload()}>I've Verified My Email</button>
//       <button onClick={handleResend}>Resend Email</button>
//       <button onClick={() => { signOut(auth); navigate("/"); }}>Back to Login</button>
//     </div>
//   );
// };

// export default VerifyEmail;







import React, { useState } from "react";
import { auth } from "../firebase";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import "../Auth.css";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Send verification link
      await sendEmailVerification(userCredential.user);
      navigate("/verify-email");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h2>Join phoniX</h2>
        <form onSubmit={handleSignUp}>
          <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} required />
          <button type="submit">Create Account</button>
        </form>
        <p>Already have an account? <Link to="/">Login</Link></p>
      </div>
    </div>
  );
};

export default SignUp;