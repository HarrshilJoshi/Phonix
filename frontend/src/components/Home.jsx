import React from "react";
import { useNavigate } from "react-router-dom";
import Orb from "./Orb.jsx";
import "./Home.css"; // ✅ import CSS here

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
  <Orb
    hoverIntensity={5}
    rotateOnHover={true}
    hue={3}
    forceHoverState={false}
  />

  <h1 className="home-title">PhoniX</h1>

  <div className="button-container">
    <button
      className="get-started-button"
      onClick={() => navigate("/player")}
    >
      Get Started
    </button>

    <button
      className="get-started-button2"
      onClick={() => navigate("/player")}
    >
      Learn More
    </button>
  </div>
</div>

  );
}

export default Home;
