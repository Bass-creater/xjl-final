import React from "react";
import Navbar from "../components/navbar";
import "../style/font-style.css";

function forbidden() {
  return (
    <div>
      <Navbar></Navbar>
      <h1
        className="pt-14"
        style={{
          textAlign: "center",
          color: "#8710cc",
          fontWeight: "800",
          fontSize: "60px",
          marginTop: "100px",
        }}
      >
        <span
          style={{
            color: "orange",
          }}
        >
          403
        </span>
        Forbidden!
      </h1>
    </div>
  );
}

export default forbidden;
