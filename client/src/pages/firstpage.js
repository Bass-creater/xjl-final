import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import "../style/font-style.css";
import axios from "axios";

const InventoryStatistics = () => {
  const navigate = useNavigate();
  const { username, role } = useAuth();
  const [totalParcels, setTotalParcels] = useState([]);
  const [totalParcelsLao, setTotalParcelsLao] = useState([]);
  const [totalParcelsBranch, setTotalParcelsBranch] = useState([]);
  const [credit, setCredit] = useState(null);

  const [listParcel, setListParcel] = useState();

  const storedRole = localStorage.getItem("role");
  const storedBranch = localStorage.getItem("branch");
  // const storedCredit = localStorage.getItem("credit");

  useEffect(() => {
    const countParcels = async () => {
      try {
        const response = await axios.post(
          "http://localhost:1000/api/parcels/count",
          { from: storedBranch }
        );
        setTotalParcels(response.data.total);
      } catch (error) {
        console.log("ERROR Count parcels | Try again");
      }
    };
    countParcels();
  }, [storedBranch]);

  useEffect(() => {
    const countParcelsLao = async () => {
      try {
        const response = await axios.post(
          "http://localhost:1000/api/parcels/countwarehouse"
        );
        setTotalParcelsLao(response.data.total);
      } catch (error) {
        console.log("ERROR Count parcels | Try again");
      }
    };
    countParcelsLao();
  }, [storedBranch]);

  useEffect(() => {
    const fetchCredit = async () => {
      try {
        const response = await axios.post(
          "http://localhost:1000/api/credit",
          {
            username,
          }
        );
        setCredit(response.data.credit);
      } catch (error) {
        console.error("Error fetch credit", error);
      }
    };

    fetchCredit();
  }, [username]);

  useEffect(() => {
    const listParcel = async () => {
      try {
        const response = await axios.post(
          "http://localhost:1000/api/listparcel"
        );
        setListParcel(response.data);
      } catch (error) {
        console.error("Error to fetch list parcel", error);
      }
    };
    listParcel();
  }, []);

  useEffect(() => {
    const countParcelBranch = async () => {
      try {
        const response = await axios.post(
          "http://localhost:1000/api/parcels/countbranch",
          {
            username: username,
          }
        );
        setTotalParcelsBranch(response.data.total);
      } catch (error) {
        console.error("Error Count Parcels | Try again");
      }
    };
    countParcelBranch();
  }, [username]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedRole = localStorage.getItem("role");

    if (!token) {
      navigate("/login");
    } else if (storedRole !== "admin" && storedRole !== "branch") {
      navigate("/forbidden");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // const handleLogout = useState();

  const [activePage, setActivePage] = useState("inventorystatistics");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 870);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        fontFamily: "Arial, sans-serif",
      }}
    >
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

      {/* Main Content */}
      <main
        style={{
          flex: 1,
          overflow: "auto",
          padding: "20px",
          transition: "margin-left 0.3s",
        }}
      >
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
            <h1 style={{ fontSize: "24px", margin: "0" }}>ໜ້າທຳອິດ</h1>
          </div>
          {!isMobile && (
            <div style={{ display: "flex", alignItems: "center" }}>
              <span style={{ marginRight: "20px" }}>
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

        <div style={{ overflowX: "auto" }} className="w-full">
          <div
            style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}
            className="w-full"
          >
            <div
              style={{ display: "flex", flexDirection: "row", gap: "20px" }}
              className="flex flex-row w-full"
            >
              {/* Total Inventory Card */}
              <div
                style={{
                  ...cardStyle,
                  background: "linear-gradient(135deg, #6d03aa, #4596fc)",
                  minHeight: "150px",
                }}
                className="w-full"
              >
                {storedRole === "branch" ? (
                  <div>
                    <h2 style={titleStyle}>ຈຳນວນພັດດຸທັງໝົດ</h2>
                    <h2 style={titleStyle}>ທີ່ຖືກສົ່ງມາຍັງສາຂາ</h2>
                  </div>
                ) : (
                  <div>
                    <h2 style={titleStyle}>ຈຳນວນພັດດຸທັງໝົດ</h2>
                    <h2 style={titleStyle}>ທີ່ຢູ່ໃນໂກດັງ</h2>
                  </div>
                )}

                <div
                  style={{
                    flexDirection: "column",
                    justifyContent: "end",
                    display: "flex",
                    alignItems: "end",
                  }}
                >
                  <div style={valueContainerStyle}>
                    {storedRole === "branch" ? (
                      <span style={valueStyle} className="font-semibold">
                        {totalParcelsBranch}
                      </span>
                    ) : storedBranch === "LAO Warehouse" ? (
                      <span style={valueStyle} className="font-semibold">
                        {totalParcelsLao}
                      </span>
                    ) : (
                      <span style={valueStyle} className="font-semibold">
                        {totalParcels}
                      </span>
                    )}

                    <span style={unitStyle}>ຊິ້ນ</span>
                  </div>
                  <p style={noteStyle}>
                    ຈຳນວນທັງໝົດນັບຈາກຂໍ້ມູນພັດດຸທີ່ຖືກເພີ່ມ
                  </p>
                </div>
              </div>

              {/* Branch Inventory Card */}
              <div
                style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}
                className="w-full"
              >
                {/* Total Credit Card */}
                <div
                  style={{
                    ...cardStyle,
                    background: "linear-gradient(135deg, #11998e, #38ef7d)",
                    flex: 1,
                    minWidth: "200px",
                  }}
                >
                  <h2 style={titleStyle}>ເຄຣດິດ</h2>

                  <div style={valueContainerStyle}>
                    <span style={valueStyle}>
                      {credit !== null && typeof credit !== "object"
                        ? Number(credit).toLocaleString("en-US")
                        : "Loading..."}
                    </span>
                    <span style={unitStyle}>LAK</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <hr
            style={{
              margin: "40px 0",
              borderTop: "2px solid #ddd",
              opacity: 0.5,
            }}
          />

          {storedBranch === "LAO Warehouse" ? (
            <div>
              <h2>ພັດດຸທີ່ຢູ່ໃນໂກດັງ</h2>
              {/* Data Table */}
              <table className="min-w-full leading-normal">
                <thead>
                  <tr>
                    {/* คอลัมน์ลำดับ */}
                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      No
                    </th>
                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      FROM
                    </th>
                    <th className="text-center px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-end px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {listParcel &&
                    listParcel.map((product, index) => (
                      <tr key={product.id_parcel} className="hover:bg-gray-100">
                        {/* ลำดับ */}
                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                          <p className="text-gray-900 whitespace-no-wrap">
                            {index + 1}
                          </p>
                        </td>
                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                          <p className="text-gray-900 whitespace-no-wrap">
                            {product.id_parcel}
                          </p>
                        </td>
                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                          <p className="text-gray-900 whitespace-no-wrap">
                            {product.from}
                          </p>
                        </td>
                        <td className="text-center px-5 py-5 border-b border-gray-200 bg-white text-sm">
                          <span className="relative inline-block px-3 py-1 font-semibold text-green-900 leading-tight">
                            <span
                              aria-hidden
                              className="absolute inset-0 bg-green-200 opacity-50 rounded-full"
                            ></span>
                            {product.status ? (
                              <span className="relative">ພັດສະດຸຢູ່ສາງ</span>
                            ) : null}
                          </span>
                        </td>
                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-end">
                          <p className="text-gray-900 whitespace-no-wrap">
                            {product.time}
                          </p>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
};

const cardStyle = {
  padding: "20px",
  borderRadius: "10px",
  color: "white",
  boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const titleStyle = {
  fontSize: "24px",
  fontWeight: "bold",
  // marginBottom: "10px",
};
const textStyle = {
  fontSize: "18px",
  fontWeight: "500",
};

const valueContainerStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
};

const valueStyle = { fontSize: "38px", fontWeight: "bold" };

const unitStyle = { fontSize: "24px" };

const noteStyle = { fontSize: "12px", fontStyle: "italic", marginTop: "10px" };

const tableHeaderStyle = {
  padding: "10px",
  borderBottom: "2px solid #ddd",
  textAlign: "left",
};

const tableCellStyle = {
  padding: "10px",
  borderBottom: "1px solid #ddd",
  textAlign: "left",
};

export default InventoryStatistics;
