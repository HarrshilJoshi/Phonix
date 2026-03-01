import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth, provider, signInWithPopup } from "../firebase";
import Orb from "./Orb";
import "./Home.css";

const SignIn = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate("/player", { replace: true });
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleAuth = async (mode) => {
    try {
      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        // console.log(`${mode} successful for:`, result.user.displayName);
        navigate("/player", { replace: true }); // go to player
      }
    } catch (error) {
      console.error(`${mode} failed:`, error);
    }
  };

  return (
    <div className="home-container">
      <Orb hoverIntensity={5} rotateOnHover={true} hue={5} forceHoverState={false} />
       <div className="home-title" style={{ padding: '20px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
  <img src="/icons/phonix-horizontal.png" alt="PhoniX Symbol" style={{ height: '100px', width: 'auto' }} />
  {/* <img src="/icons/phonix-name.png" alt="PhoniX" style={{ height: '50px', width: 'auto' }} /> */}
</div>
      {/* <h1 className="home-title">PhoniX</h1> */}
      <div className="button-container">
        <button
          className="get-started-button"
          onClick={() => handleAuth("Sign up")}
        >
          Sign up
        </button>
        <button
          className="get-started-button2"
          onClick={() => handleAuth("Login")}
        >
          Login
        </button>
      </div>
    </div>
  );
};

export default SignIn;
