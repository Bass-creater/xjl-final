import Logo from "../assets/logo.png";
import React, { useState } from "react";
import "../style/login.css";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/navbar";
import Facebook from "../assets/facebook.png";
import '../style/font-style.css'
import axios from "axios";
import { BarLoader } from "react-spinners";

function Signup() {
  const navigate = useNavigate();

  const [formSignup, setFormSignup] = useState({
    username: "",
    email: "",
    passwrd: "",
    confirmPasswrd: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormSignup({ ...formSignup, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formSignup.passwrd !== formSignup.confirmPasswrd) {
      setMessage("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:1000/api/signup", formSignup );
      setMessage(response.data.message);

      if (response.status === 201) {
        navigate("/login");
      }
    } catch (error) {
      if(error.response) {
        setMessage(error.response.data.message);
      }else {
        setMessage("Signup failed");
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <div>
      <Navbar></Navbar>
      {loading && (
        <div className="loading-overlay">
          <BarLoader color="#ff6b35" size={80} />
        </div>
      )}
      <section className="bg-gray-50 pt-14">
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
          <div className="w-full bg-white rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0">
            <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
              <h1 className="text-center text-5xl font-bold leading-tight tracking-tight text-[#ff6b35] md:text-4xl ">
                SIGN-UP
              </h1>
              <p className="text-red-500">{message}</p>
              <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900 ">
                    Your username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formSignup.username}
                    onChange={handleChange}
                    id="username"
                    className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 "
                    placeholder="Enter username"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900 ">
                    Your email
                  </label>
                  <input
                    type="email"
                    name="email"
                    onChange={handleChange}
                    value={formSignup.email}
                    id="email"
                    className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 "
                    placeholder="Enter email address"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900 ">
                    Password
                  </label>
                  <input
                    type="password"
                    name="passwrd"
                    onChange={handleChange}
                    value={formSignup.passwrd}
                    id="password"
                    placeholder="••••••••"
                    className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 "
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900 ">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirmPasswrd"
                    onChange={handleChange}
                    value={formSignup.confirmPasswrd}
                    id="password"
                    placeholder="••••••••"
                    className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 "
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full text-white bg-[#ff6b35] hover:bg-orange-600 focus:ring-4 focus:outline-none focus:ring-orange-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                  disabled={loading}
                >
                  {loading ? "Signing up..." : "Sign in"}
                </button>
                <p className="text-center text-sm font-light text-gray-500 ">
                ມີບັນຊີຢູ່ແລ້ວບໍ??{" "}
                  <Link
                    to="/login"
                    className="font-medium text-[#ff6b35] hover:underline "
                  >
                    ເຂົ້າສູ່ລະບົບ
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>
      <footer>
        <div className="logo">
          <img src={Logo} alt="logo" />
        </div>
        <div className="navfooter">
          <ul>
            <li>
              <a href="/">| Home</a>
            </li>
            <li>
              <a href="/">| About</a>
            </li>
            <li>
              <a href="/">| ຕິດຕາມພັດດຸ</a>
            </li>
            <li>
              <a href="/">| ຄິດໄລ່ຄ່າຂົນສົ່ງ</a>
            </li>
          </ul>
        </div>
        <h1>Contact</h1>
        <Link
          to="https://www.facebook.com/profile.php?id=61551089827548&mibextid=LQQJ4d"
          className="flex items-center justify-center pt-9"
        >
          <img src={Facebook} className="w-12" alt="facebook"></img>
        </Link>
      </footer>
    </div>
  );
}

export default Signup;
