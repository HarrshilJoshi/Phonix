import { useState } from "react";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        // LOGIN LOGIC
        const userCred = await signInWithEmailAndPassword(auth, email, password);
        if (!userCred.user.emailVerified) {
          alert("Please verify your email first! Check your inbox.");
        }
      } else {
        // SIGNUP LOGIC
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        
        // 1. Create the user document in Firestore immediately
        await setDoc(doc(db, "users", userCred.user.uid), {
          email: email,
          likedSongs: [],
          createdAt: new Date()
        });

        // 2. 📧 Send Verification Email
        await sendEmailVerification(userCred.user);
        alert("Signup successful! A verification email has been sent to " + email);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="auth-container">
      <h2>{isLogin ? "Login" : "Sign Up"}</h2>
      <form onSubmit={handleAuth}>
        <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
        <button type="submit">{isLogin ? "Login" : "Register"}</button>
      </form>
      <p onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? "Need an account? Sign Up" : "Already have an account? Login"}
      </p>
    </div>
  );
};

export default Auth;