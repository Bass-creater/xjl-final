import React from "react";
// import { Link } from "react-router-dom";
import Price1 from "../assets/price1.jpg";
import Navbar from "../components/navbar";

function CalculateTH() {
  return (
    <div>
        <Navbar></Navbar>
      <div className="pt-14 w-full flex flex-col align-center justify-center items-center 2xl:px-[20vw]">
        <h1 className="text-center text-[20px] text-[#fff] font-semibold px-10 py-2  rounded-md bg-[#8044CC]">ສຳລັບສາງ ໜອງຄາຍ</h1>

        <img src={Price1} alt="calculate" className="w-full mt-4" />
      </div>
    </div>
  );
}

export default CalculateTH;
