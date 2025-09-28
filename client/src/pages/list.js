import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import "../style/font-style.css";
import Listproduct from "../components/listproduct";
import ParcelBranch from "../components/parcelbranch";
// import "../components/spread"

const InventoryDashboard = () => {
  const { username, role } = useAuth();

  const navigate = useNavigate();
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const [activePage, setActivePage] = useState("inventory");
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
            <h1 style={{ fontSize: "24px", margin: "0" }}>ລາຍການພັດດຸ</h1>
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


        {storedRole === "branch" ? (
          <ParcelBranch></ParcelBranch>
        ) : (
          <>
            <Listproduct />
          </>
        )}
      </main>
    </div>
  );
};

export default InventoryDashboard;
