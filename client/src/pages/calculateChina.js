import React from "react";
// import { Link } from "react-router-dom";
import Price3 from "../assets/price.png";
import Navbar from "../components/navbar";

function CalculateChina() {
  return (
    <div>
        <Navbar></Navbar>
      <div className="pt-14 w-full flex flex-col align-center justify-center items-center 2xl:px-[20vw]">
        <img src={Price3} alt="calculate" className="w-full mt-2" />
      </div>
    </div>
  );
}

export default CalculateChina;
