// import { auth } from "../firebase";
// import { sendEmailVerification, signOut } from "firebase/auth";
// import { useNavigate } from "react-router-dom";

// export default function VerifyEmail() {
//   const navigate = useNavigate();

//   const checkVerificationStatus = async () => {
//     await auth.currentUser.reload(); // 🔥 Crucial: Updates the local user data from Firebase
//     if (auth.currentUser.emailVerified) {
//       navigate("/player");
//     } else {
//       alert("Email not verified yet. Please check your inbox (and spam).");
//     }
//   };

//   const resendEmail = async () => {
//     try {
//       await sendEmailVerification(auth.currentUser);
//       alert("Verification link resent!");
//     } catch (err) {
//       alert(err.message);
//     }
//   };

//   return (
//     <div className="verify-container" style={{ textAlign: "center", padding: "50px" }}>
//       <h1>📧 Verify Your Email</h1>
//       <p>A verification link was sent to <strong>{auth.currentUser?.email}</strong>.</p>
//       <div style={{ marginTop: "20px", display: "flex", gap: "10px", justifyContent: "center" }}>
//         <button onClick={checkVerificationStatus} style={{ background: "#5227FF", color: "white" }}>
//           I've Verified My Email
//         </button>
//         <button onClick={resendEmail}>Resend Link</button>
//         <button onClick={() => { signOut(auth); navigate("/"); }} style={{ background: "#444" }}>
//           Logout
//         </button>
//       </div>
//     </div>
//   );
// }






import { auth } from "../firebase";
import { sendEmailVerification, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "../Auth.css";

const VerifyEmail = () => {
  const navigate = useNavigate();

  // Force Firebase to check if the user clicked the link
  const handleCheckStatus = async () => {
    await auth.currentUser.reload();
    if (auth.currentUser.emailVerified) {
      navigate("/player");
    } else {
      alert("Still not verified. Check your email!");
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h1>Verify Email</h1>
        <p>Check <b>{auth.currentUser?.email}</b> and click the link.</p>
        <button onClick={handleCheckStatus}>I've Verified My Email</button>
        <button onClick={() => sendEmailVerification(auth.currentUser)} style={{marginTop: "10px"}}>
            Resend Link
        </button>
        <button onClick={() => { signOut(auth); navigate("/"); }} className="close-btn">
            Back to Login
        </button>
      </div>
    </div>
  );
};

export default VerifyEmail;