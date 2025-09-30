import React, { useState } from "react";
import "../style/home.css";
import "../style/main.css";
import "../style/font-style.css";
import "../style/responsive.css";
import { Link, useNavigate } from "react-router-dom";
// import axios from "axios";
import Logo from "../assets/logo.png";
import Banner from "../assets/banner.png";
import Thai from "../assets/thailand.png";
import China from "../assets/china.png";
import Branch from "../assets/branch.png";
import Navbar from "../components/navbar";
import Facebook from "../assets/facebook.png";
import IconSlide from "../components/iconslide";
import Card from "../components/card";

function Home() {
  const [id, setId] = useState("");
  // const [result, setResult] = useState("");
  const navigate = useNavigate();

  const handleNormalShippingClick = () => {
    navigate("/normalShipping");
  };

  const handleExpressShippingClick = () => {
    navigate("/expressShipping");
  };

  const handleInputChange = (event) => {
    setId(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!id) {
      console.error("ID is required");
      return;
    }
    navigate(`/data_parcel/${id}`);
  };
  return (
    <div className="maincontainer scroll-smooth" id="home">
      <Navbar />

      <div className="headBanner pt-20 2xl:px-40">
        <img src={Banner} alt="logo" />
      </div>

      <div className="containerContent">
        <div className="contentBelow">
          <div className="search">
            <h1>ຕິດຕາມພັດສະດຸຂອງທ່ານ</h1>

            <div className="inputSearch">
              <input
                placeholder=" ໝາຍເລກພັດສະດຸຂອງທ່ານ"
                type="text"
                value={id}
                onChange={handleInputChange}
              />

              <button
                type="submit"
                className="submitSearch"
                onClick={handleSubmit}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                  />
                </svg>
                ຄົ້ນຫາ
              </button>
            </div>
          </div>
          {/* <div className="buttonLink">
            <a className="firstButton" href="#address">
              <img src={Branch} alt="branch icon" />
              <h3>ຕິດຕາມພັດສະດຸຈາກຈີນທັງໝົດ</h3>
            </a>

            <h1>|</h1>

            <Link className="thirdButton" to="/calculateChina">
              <img src={China} alt="china icon" />
              <h3>ຄ່າບໍລິການຂົນສົ່ງ ຈີນ</h3>
            </Link>
          </div> */}
        </div>

        <div className="loginLink mt-12">
          <Link to="/login" className="buttonLogin">
            <p className="text-base md:text-xl">ສະໝັກສະມາຊິກ & ເຂົ້າສູ່ລະບົບ</p>
          </Link>
        </div>
      </div>

      <Card />

      <div className="containerDetails">
        <h1>
          <span>|</span> ລາຍລະອຽດສາງຂົນສົ່ງ
        </h1>

        <div className="contentButtonPosition" id="address">
          <section className="first" onClick={handleNormalShippingClick} style={{ cursor: 'pointer' }}>
            <div className="buttonFirst">
              <p>ຄ່າຂົນສົ່ງແບບທົ່ວໄປ</p>
            </div>
            {/* <div className="buttonSecond">
              <a href="/">ທີ່ຢູ່ສາງປະເທດ ຈີນ</a>
            </div> */}
          </section>

          <section className="second" onClick={handleExpressShippingClick} style={{ cursor: 'pointer' }}>
            <div className="buttonThird">
              <p>ຄ່າຂົນສົ່ງແບບດ່ວນ</p>
            </div>
            {/* <div className="buttonFour">
              <a href="/">ທີ່ຢູ່ສາງປະເທດ ຫວຽດນາມ</a>
            </div> */}
          </section>
        </div>
      </div>

      <div className="containerAbout mx-60" id="about">
        <h1>
          <span>|</span> ພາລະກິດຂອງພວກເຮົາ
        </h1>

        <div className="content bg-transparent">
          <p className="bg-transparent">
            &emsp;
            ພວກເຮົາມີຄວາມມຸງໝັ້ນທີ່ຈະສ້າງເຄືອຄ່າຍຜູ້ໜອງສີນຄ້າຈາກຕ່າງປະເທດໃຫ້ມີຄຸນະພາບທີ່ສຸດເພື່ອໃຫ້ລູກຄ້າໄດ້ຮັບຜົນປະໂຫຍດສູງສຸດຈາກການໃຊ້ບໍລິການກັບພວກເຮົາ
            ໂດຍເຮົາເນັ້ນການເຊື່ອມໂຍງກັບບັນດາກຸ່ມປະເທດອ້ອມຂ້າງໃນທຸກມິຕິຂອງການຂົນສົ່ງ
            ແລະ ການຈັດຫາສິນຄ້າພ້ອມບໍລິການເພື່ອໃຫ້ບັນລຸ 3 ເງື່ອນໄຂດັ່ງລຸ່ມນີ້:
            <br />
            <br />
            ຕົ້ນທຶນຕໍ່າທີ່ສຸດ &gt; ຄຸນະພາບດີທີ່ສຸດ &gt; ການຂົນສົ່ງໄວທີ່ສຸດ
            ພວກເຮົາສາມາດກະຈາຍສິນຄ້າພາຍໃນປະເທດໄດ້ຢ່າງມີປະສິດທິພາບ ສະດວກ
            ປອດໄພພ້ອມກົງຕໍ່ເວລາ
          </p>
        </div>
      </div>

      <div className="contentSlide">
        <h1>
          <span>|</span> ບໍລິການຂອງພວກເຮົາ
        </h1>
      </div>
      <IconSlide />

      <footer>
        <div className="logo w-full h-auto mt-10">
        <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold text-[#ff8c00] drop-shadow-md">XJL Express</span>
          </Link>
        </div>
        <div className="navfooter">
          <ul className="flex flex-wrap justify-center gap-2 sm:gap-4 text-sm sm:text-base">
            <li>
              <a href="/" className="px-2 sm:px-5 py-1 sm:py-2 text-white hover:text-orange-200 transition-colors">| Home</a>
            </li>
            <li>
              <a href="/" className="px-2 sm:px-5 py-1 sm:py-2 text-white hover:text-orange-200 transition-colors">| About</a>
            </li>
            <li>
              <a href="/" className="px-2 sm:px-5 py-1 sm:py-2 text-white hover:text-orange-200 transition-colors">| ຕິດຕາມພັດສະດຸ</a>
            </li>
            <li>
              <a href="/">| ຄຳນວນຄ່າຂົນສົ່ງ</a>
            </li>
          </ul>
        </div>
        <h1>Contact</h1>
        <div className="w-full flex items-center justify-center mt-2 pb-4">
          <Link
            to="https://www.facebook.com/share/1FP8T7v2SC/?mibextid=wwXIfr"
            className="flex items-center justify-center p-4 sm:p-5 bg-[#126cfd] rounded-full hover:bg-[#0d5bb8] transition-colors duration-200"
          >
            <img src={Facebook} className="w-8 h-8 sm:w-10 sm:h-10" alt="facebook"></img>
          </Link>
        </div>
      </footer>
    </div>
  );
}

export default Home;
