import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import Swal from "sweetalert2";

import Parcel from "../components/origin";
// import Details from "../components/parcel";
import Spread from "../components/spread";
import Branch from "../components/successbranch";
import ParcelWait from "../components/parcelwaitsave";
// import { Sidebar } from "../components/sidebar";
import "../style/font-style.css";
import axios from "axios";
import { BarLoader } from "react-spinners";

const ListParcelDashboard = ({ onDetailsChange }) => {
  const navigate = useNavigate();
  const { username, role } = useAuth();

  const [activePage, setActivePage] = useState("distribution");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  // const storedRole = localStorage.getItem("role");
  const storedBranch = localStorage.getItem("branch");
  const storedRole = localStorage.getItem("role");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedRole = localStorage.getItem("role");

    if (!token) {
      navigate("/login");
    } else if (storedRole !== "admin" && storedRole !== "branch") {
      navigate("/forbidden");
    }
  }, [navigate]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 770);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const sidebarLinkStyle = (page) => ({
    display: "block",
    color: "white",
    textDecoration: "none",
    padding: "10px",
    marginBottom: "5px",
    borderRadius: "5px",
    paddingRight: "10px",
    backgroundColor: activePage === page ? "#34495e" : "transparent",
    transition: "background-color 0.3s",
  });

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const [parcelData, setParcelData] = useState({});
  const [detailsData, setDetailsData] = useState({
    typeParcel: "",
    width: "",
    height: "",
    length: "",
    weight: "",
    amount: "",
    price: "",
  });
  // const [detailsData, setDetailsData] = useState({});

  const handleParcelChange = (data) => {
    setParcelData(data);
  };
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const checkEmptyFields = Object.values(detailsData).some(
      (value) => value === "" || value === null || value === undefined
    );
    const checkEmptyParcel = Object.values(parcelData).some(
      (value) => value === "" || value === null || value === undefined
    );

    if (checkEmptyFields || checkEmptyParcel) {
      Swal.fire({
        title: "ຂໍ້ມູນບໍ່ຄົບຖ້ວນ",
        text: "ກະລຸນາຕື່ມຂໍ້ມູນໃສ່ທຸກຊ່ອງໃຫ້ຄົບຖ້ວນ.",
        icon: "info",
      });
      return;
    }

    setLoading(true);

    try {
      const checkCredit = await axios.post(
        "https://kyelao.com/api/checkcredit",
        { branch: parcelData.branch }
      );

      const userCredit = checkCredit.data.credit;

      if (userCredit < parseInt(detailsData.price.replace(/,/g, ""), 10)) {
        Swal.fire({
          title: "ບໍ່ພຽງພໍ",
          text: `ຍອດສິນເຊື່ອໃນສາຂາ ${parcelData.branch} ບໍ່ພຽງພໍບໍ?`,
          icon: "error",
        });
        setLoading(false);
        return;
      }

      const fullData = {
        parcel: parcelData,
        detail: {
          ...detailsData,
          price: parseInt(detailsData.price.replace(/,/g, ""), 10),
        },
      };
      console.log("Sending data", fullData);
      const response = await axios.post(
        "https://kyelao.com/api/saveData",
        fullData
      );

      if (response.status === 200 && checkCredit.status === 200) {
        console.log("Data Save Successfully:", response.data);
        setLoading(false);
        Swal.fire({
          title: "ສໍາເລັດ",
          text: "ຂໍ້ມູນ parcel ໄດ້ຖືກບັນທຶກໄວ້.",
          icon: "success",
        }).then(() => {
          window.location.reload();
        });
      }
    } catch (error) {
      console.log("Error Save data | Try again", error);
      Swal.fire({
        title: "ຜິດພາດ",
        text: error?.response?.data?.message || "ລອງໃໝ່ອີກຄັ້ງ",
        icon: "error",
      });
    }
  };

  // -----------------Detail Data---------------------------
  const [rateChina, setRateChina] = useState(0);
  const [rateThai, setRateThai] = useState(0);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDetailsData((prevData) => {
      const updatedData = { ...prevData, [name]: value };
      console.log(updatedData);
      if (onDetailsChange) {
        onDetailsChange(updatedData);
      }
      return updatedData;
    });
  };

  useEffect(() => {
    const fetchRate = async () => {
      try {
        const response = await axios.get("https://kyelao.com/api/rate");
        setRateChina(response.data.china);
        setRateThai(response.data.thai);
      } catch (error) {
        console.error("Error fetching rateChina", error);
      }
    };
    fetchRate();
  }, []);

  const handlePriceChange = (e) => {
    const price = e.target.value.replace(/,/g, "");
    setDetailsData((prevData) => ({
      ...prevData,
      price,
    }));
  };
  const formatPrice = () => {
    setDetailsData((prevData) => ({
      ...prevData,
      price: Number(prevData.price).toLocaleString("en-US"),
    }));
  };
  // console.log("Calculating price with data:", detailsData);

  const calculatePrice = useCallback(() => {
    let price = 0;
    let cbm = 0;
    const width = parseFloat(detailsData.width) || 0;
    const length = parseFloat(detailsData.length) || 0;
    const height = parseFloat(detailsData.height) || 0;
    const weight = parseFloat(detailsData.weight) || 0;
    const amount = parseFloat(detailsData.amount) || 1;

    const size = width * length * height;
    const ton = weight / 1000;

    switch (detailsData.typeParcel) {
      case "O":
        price = 25 * rateThai;
        break;
      case "A":
        price = 35 * rateThai;
        break;
      case "2A":
        price = 45 * rateThai;
        break;
      case "B":
        price = 60 * rateThai;
        break;
      case "C":
        price = 80 * rateThai;
        break;
      case "D":
        price = 95 * rateThai;
        break;
      case "E":
        price = 120 * rateThai;
        break;
      case "F":
        price = 150 * rateThai;
        break;
      case "G":
        price = 200 * rateThai;
        break;
      case "H":
        price = 250 * rateThai;
        break;
      case "I":
        price = 300 * rateThai;
        break;
      case "Genaral":
        if (weight > 0 && weight <= 0.5) {
          price = 8000;
        } else if (weight > 0.5 && weight <= 1) {
          price = 15000;
        } else {
          let floatWeight = Math.floor(weight);
          let mainWeight = weight - floatWeight;

          price = floatWeight * 15000;

          if (mainWeight > 0 && mainWeight <= 0.5) {
            price += 8000;
          } else if (mainWeight > 0.5 && mainWeight < 1) {
            price += 15000;
          }
        }
        break;
      case "Electrical":
        cbm = size / 1000000;
        price = cbm * 700 * rateChina;
        break;
      case "Big-But-Light":
        cbm = size / 1000000;
        price = cbm * 650 * rateChina;
        break;
      case "Lots-of-Weight":
        price = ton * 1400 * rateChina;
        break;
      default:
        price = 0;
    }

    price = Math.round(price);

    setDetailsData((prevData) => ({
      ...prevData,
      price: (price * amount).toLocaleString("en-US"),
    }));
  }, [detailsData, rateChina]);

  useEffect(() => {
    calculatePrice();
  }, [
    detailsData.typeParcel,
    detailsData.weight,
    detailsData.width,
    detailsData.length,
    detailsData.height,
    detailsData.amount,
    rateChina,
    // rateThai,
    // calculatePrice
  ]);

  useEffect(() => {
    console.log(detailsData);
  }, [detailsData]);

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div>
        {loading ? (
          <div className="absolute inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
            <BarLoader color="#b104e0" loading={loading} size={50} />
          </div>
        ) : null}
      </div>

      {/* <Sidebar/> */}

      {/* Sidebar */}
     <aside
             style={{
               width: isMobile ? (sidebarOpen ? "100%" : "0") : "250px",
               height: "100vh",
               color: "white",
               padding: sidebarOpen ? "20px" : "0",
               display: "flex",
               flexDirection: "column",
               transition: "all 0.3s",
               overflow: "hidden",
               position: isMobile ? "fixed" : "relative",
               zIndex: 1000,
               left: isMobile ? (sidebarOpen ? "0" : "-100%") : "0",
             }}
             className="bg-gray-800"
           >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h2 style={{ fontSize: "24px", margin: 0 }}>ການຈັດການ</h2>
          {isMobile && (
            <button
              onClick={toggleSidebar}
              style={{
                background: "none",
                border: "none",
                color: "white",
                fontSize: "24px",
                cursor: "pointer",
              }}
            >
              ✕
            </button>
          )}
        </div>
        <nav style={{ flex: 1 }}>
          <Link
            to="/homeAdmin/main"
            style={sidebarLinkStyle("inventorystatistics")}
            onClick={() => {
              setActivePage("inventorystatistics");
              isMobile && toggleSidebar();
            }}
          >
            ໜ້າທຳອິດ
          </Link>
          <Link
            to="/homeAdmin/list"
            style={sidebarLinkStyle("inventory")}
            onClick={() => {
              setActivePage("inventory");
              isMobile && toggleSidebar();
            }}
          >
            ລາຍການພັດດຸ
          </Link>
          <Link
            to="/homeAdmin/distribution"
            style={sidebarLinkStyle("distribution")}
            onClick={() => {
              setActivePage("distribution");
              isMobile && toggleSidebar();
            }}
          >
            ກະຈາຍພັດດຸ
          </Link>

          {storedRole !== "branch" ? (
            <>
              <Link
                to="https://wx.lqfast.com/wx/waybillquery/#/?companyid=zJ0JeBq%2FsADQTY6mmRSZMA%3D%3D&translated=translated"
                style={sidebarLinkStyle("branches")}
                onClick={() => {
                  setActivePage("branches");
                  isMobile && toggleSidebar();
                }}
              >
                ຕິດຕາມພັດສະດຸຈາກຈີນ
              </Link>
            </>
          ) : (
            <>
              <Link
                to="../../"
                style={sidebarLinkStyle("branches")}
                onClick={() => {
                  setActivePage("branches");
                  isMobile && toggleSidebar();
                }}
              >
                ຕິດຕາມພັດສະດຸ
              </Link>
            </>
          )}
        </nav>
        <button
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: "#e74c3c",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            transition: "background-color 0.3s",
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = "#c0392b")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "#e74c3c")}
          onClick={handleLogout}
        >
          LOGOUT
        </button>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflow: "auto", padding: "20px" }}>
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            {isMobile && (
              <button
                onClick={toggleSidebar}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  marginRight: "10px",
                }}
              >
                ☰
              </button>
            )}
            <h1 style={{ fontSize: "24px", margin: "0" }}>ການກະຈາຍພັດດຸ</h1>
          </div>
          {!isMobile && (
            <div style={{ display: "flex", alignItems: "center" }}>
              <span style={{ marginRight: "20px" }}>
                {" "}
                {new Date().toLocaleDateString("th-TH")}
              </span>
              <span style={{ marginRight: "20px" }}>
                {new Date().toLocaleTimeString("th-TH", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              <span>
                {username} | {role}
              </span>
              <Link
                to="/"
                style={{
                  marginLeft: "20px",
                  padding: "8px 16px",
                  backgroundColor: "#4a69bd",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  textDecoration: "none",
                  cursor: "pointer",
                }}
              >
                ໜ້າເເຣກ
              </Link>
            </div>
          )}
        </header>

        <div style={{ overflowX: "auto" }}>
          {storedBranch === "LAO Warehouse" ? (
            <>
              <Parcel onParcelChange={handleParcelChange} />
              {/* <Details onDetailsChange={handleDetailChange} /> */}

              <div>
                <div
                  id="admin-lao"
                  style={{
                    borderRadius: "10px",
                    overflow: "hidden",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                  }}
                >
                  <div style={gradientHeaderStyle("#0031e0", "#0ad5f5")}>
                    <h2 style={{ margin: 0, color: "white" }}>ຂໍ້ມູນພັດດຸ</h2>
                  </div>
                  <div style={bodyStyle}>
                    <div
                      style={{
                        display: "grid",
                        gap: "15px",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(200px, 1fr))",
                      }}
                    >
                      <div>
                        <label style={labelStyle}>ປະເພດ :</label>
                        <select
                          style={inputStyle}
                          onChange={handleInputChange}
                          value={detailsData.typeParcel}
                          name="typeParcel"
                        >
                          <option value="" disabled>
                            ເລືອກປະເພດ
                          </option>
                          <option value="O"> O </option>
                          <option value="A"> A </option>
                          <option value="2A"> 2A</option>
                          <option value="B"> B</option>
                          <option value="C"> C</option>
                          <option value="D"> D</option>
                          <option value="E"> E</option>
                          <option value="F"> F</option>
                          <option value="G"> G</option>
                          <option value="H"> H</option>
                          <option value="I"> I</option>
                          <option value="Genaral"> ເຄື່ອງໃຊ້ທົ່ວໄປ</option>
                          <option value="Electrical"> ເຄື່ອງໃຊ້ໄຟຟ້າ</option>
                          <option value="Big-But-Light">
                            {" "}
                            ເຄື່ອງໃຫຍ່ນ້ຳໜັກເບົາ
                          </option>
                          <option value="Lots-of-Weight">ນ້ຳໜັກຫຼາຍ</option>
                        </select>
                      </div>
                      <div>
                        <label style={labelStyle}>ຂະໜາດ(cm) :</label>
                        <div style={{ display: "flex", gap: "5px" }}>
                          <input
                            name="width"
                            type="number"
                            onChange={handleInputChange}
                            value={detailsData.width}
                            placeholder="ກວ້າງ"
                            style={{ ...inputStyle, flex: 1 }}
                          />
                          <input
                            name="length"
                            type="number"
                            onChange={handleInputChange}
                            value={detailsData.length}
                            placeholder="ຍາວ"
                            style={{ ...inputStyle, flex: 1 }}
                          />
                          <input
                            name="height"
                            type="number"
                            onChange={handleInputChange}
                            value={detailsData.height}
                            placeholder="ສູງ"
                            style={{ ...inputStyle, flex: 1 }}
                          />
                        </div>
                      </div>
                      <div>
                        <label style={labelStyle}>ນ້ຳໜັກ(kg) :</label>
                        <input
                          name="weight"
                          type="number"
                          onChange={handleInputChange}
                          value={detailsData.weight}
                          placeholder="ນ້ຳໜັກ"
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>ຈຳນວນ :</label>
                        <input
                          name="amount"
                          type="number"
                          onChange={handleInputChange}
                          value={detailsData.amount}
                          placeholder="ຈຳນວນ(ຊິ້ນ)"
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>ລາຄາ :</label>
                        <input
                          name="price"
                          type="text"
                          onChange={handlePriceChange}
                          onBlur={formatPrice}
                          value={detailsData.price}
                          placeholder="ລາຄາ"
                          style={inputStyle}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex align-center justify-end mt-4">
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="text-lg font-medium px-14 text-white bg-gradient-to-br from-orange-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
                >
                  Save
                </button>
              </div>

              <hr className="my-6" />
              <ParcelWait />
            </>
          ) : null}

          {storedRole === "branch" ? (
            <>
              <Branch />
            </>
          ) : null}

          {/* Item Details Section */}
          {storedBranch !== "LAO Warehouse" && storedRole !== "branch" ? (
            <>
              <Spread />
            </>
          ) : null}
        </div>
      </main>
    </div>
  );
};
const gradientHeaderStyle = (color1, color2) => ({
  background: `linear-gradient(to right, ${color1}, ${color2})`,
  padding: "15px 20px",
  borderRadius: "20px 20px 0 0",
  color: "white",
});

const bodyStyle = {
  backgroundColor: "#f9f9f9",
  padding: "20px",
};

const labelStyle = {
  display: "block",
  marginBottom: "5px",
  fontWeight: "bold",
  color: "#333",
};

const inputStyle = {
  width: "100%",
  padding: "8px",
  borderRadius: "5px",
  border: "1px solid #ccc",
  boxSizing: "border-box",
};

export default ListParcelDashboard;
