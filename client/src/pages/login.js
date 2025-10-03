import React, { useState } from "react";
import "../style/login.css";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/navbar";
import Facebook from "../assets/facebook.png";
// import Swal from "sweetalert2";
import axios from "axios";
import { ClipLoader } from "react-spinners";

function Login() {
  const navigate = useNavigate();

  const [formLogin, setFormLogin] = useState({
    email: "",
    passwrd: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormLogin({ ...formLogin, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:1000/api/login",
        formLogin,
        { withCredentials: true }
      );
      console.log(response.data);

      if (
        response.data.token &&
        response.data.username &&
        response.data.role &&
        response.data.branch
        // response.data.credit
      ) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("username", response.data.username);
        localStorage.setItem("role", response.data.role);
        localStorage.setItem("branch", response.data.branch);
        // localStorage.setItem("credit", response.data.credit);

        if (response.data.role === "admin") {
          setMessage(response.data.message);
          navigate("/homeAdmin/main");
        } else if (response.data.role === "branch") {
          setMessage(response.data.message);
          navigate("/homeAdmin/main");
        } else {
          setMessage(response.data.message);
          navigate("/");
        }
      } else {
        setMessage("Login failed. No data found.");
      }
    } catch (error) {
      if (error.response) {
        setMessage(error.response.data.message);
      } else {
        setMessage("Login failed");
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
          <ClipLoader color="#ff6b35" size={80} />
        </div>
      )}
      <section className="bg-gray-50 pt-14">
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
          <div className="w-full bg-white rounded-lg shadow  md:mt-0 sm:max-w-md xl:p-0">
            <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
              <p className="text-center text-red-500">{message}</p>

              <h1 className="text-center text-5xl font-bold leading-tight tracking-tight text-[#7d00d1] md:text-4xl text-orange-500">
                LOGIN
              </h1>
              <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-500">
                    Username or Email
                  </label>
                  <input
                    type="text"
                    id="email"
                    name="email"
                    className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                    placeholder="Enter username or email"
                    onChange={handleChange}
                    value={formLogin.email}
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="password"
                    className="block mb-2 text-sm font-medium text-gray-500"
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    name="passwrd"
                    id="passwrd"
                    placeholder="••••••••"
                    className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                    onChange={handleChange}
                    value={formLogin.passwrd}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full text-white bg-orange-500 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                >
                  Login
                </button>
                <p className="text-center text-sm font-light text-gray-500 ">
                  ຍັງບໍ່ມີບັນຊີບໍ?{" "}
                  <Link
                    to="/signup"
                    className="font-medium text-orange-500 hover:underline"
                  >
                    ສະໝັກສະມາຊິກ!
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>
      <footer>
      <div>
        <div className="text-white text-center text-2xl font-bold">
          XJL Express
        </div>
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

export default Login;
