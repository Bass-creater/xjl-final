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
    padding: "14px 18px",
    marginBottom: "8px",
    borderRadius: "12px",
    backgroundColor: activePage === page ? "rgba(255, 255, 255, 0.15)" : "transparent",
    border: activePage === page ? "1px solid rgba(255, 255, 255, 0.2)" : "1px solid transparent",
    transition: "0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    fontSize: "15px",
    fontWeight: "500",
    backdropFilter: "blur(10px)",
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
          width: isMobile ? (sidebarOpen ? "100%" : "0") : "280px",
          height: "100vh",
          background: "linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)",
          color: "white",
          padding: sidebarOpen ? "25px" : "0",
          display: "flex",
          flexDirection: "column",
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          overflow: "hidden",
          position: isMobile ? "fixed" : "relative",
          zIndex: 1000,
          left: isMobile ? (sidebarOpen ? "0" : "-100%") : "0",
          boxShadow: "4px 0 20px rgba(0, 0, 0, 0.1)",
        }}
      >
        {/* Decorative background elements */}
        <div style={{
          position: "absolute",
          top: "0",
          right: "0",
          width: "200px",
          height: "200px",
          background: "radial-gradient(circle, rgba(251, 146, 60, 0.12) 0%, transparent 70%)",
          filter: "blur(50px)",
        }} />
        <div style={{
          position: "absolute",
          bottom: "0",
          left: "0",
          width: "150px",
          height: "150px",
          background: "radial-gradient(circle, rgba(234, 88, 12, 0.06) 0%, transparent 70%)",
          filter: "blur(40px)",
        }} />
        
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "35px",
            padding: "20px",
            background: "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(248, 250, 252, 0.08) 100%)",
            borderRadius: "18px",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            backdropFilter: "blur(15px)",
            boxShadow: "0 8px 25px rgba(0, 0, 0, 0.1)",
            position: "relative",
            zIndex: 2,
          }}
        >
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}>
            <div style={{
              width: "40px",
              height: "40px",
              background: "linear-gradient(135deg, rgba(251, 146, 60, 0.3) 0%, rgba(234, 88, 12, 0.2) 100%)",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid rgba(251, 146, 60, 0.4)",
            }}>
              <span style={{ fontSize: "18px" }}>📊</span>
            </div>
            <h2 style={{ 
              fontSize: "28px", 
              margin: 0, 
              fontWeight: "800", 
              background: "linear-gradient(135deg, #FB923C 0%, #F97316 50%, #EA580C 100%)", 
              WebkitBackgroundClip: "text", 
              WebkitTextFillColor: "transparent",
              letterSpacing: "-0.5px",
            }}>
              ການຈັດການ
            </h2>
          </div>
          {isMobile && (
            <button
              onClick={toggleSidebar}
              style={{
                background: "linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%)",
                border: "none",
                color: "white",
                fontSize: "18px",
                cursor: "pointer",
                padding: "10px 14px",
                borderRadius: "14px",
                transition: "all 0.3s ease",
                boxShadow: "0 6px 20px rgba(239, 68, 68, 0.3)",
                fontWeight: "600",
              }}
              onMouseOver={(e) => {
                e.target.style.transform = "scale(1.1) rotate(90deg)";
                e.target.style.boxShadow = "0 8px 25px rgba(239, 68, 68, 0.4)";
              }}
              onMouseOut={(e) => {
                e.target.style.transform = "scale(1) rotate(0deg)";
                e.target.style.boxShadow = "0 6px 20px rgba(239, 68, 68, 0.3)";
              }}
            >
              ✕
            </button>
          )}
        </div>
        
        <nav style={{ flex: 1, position: "relative", zIndex: 2 }}>
          <Link
            to="/homeAdmin/main"
            style={sidebarLinkStyle("inventorystatistics")}
            onClick={() => {
              setActivePage("inventorystatistics");
              isMobile && toggleSidebar();
            }}
          >
            <span style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              fontSize: "16px",
              fontWeight: "600",
            }}>
              <span style={{ fontSize: "20px" }}>📊</span>
              ໜ້າທຳອິດ
            </span>
          </Link>
          <Link
            to="/homeAdmin/list"
            style={sidebarLinkStyle("inventory")}
            onClick={() => {
              setActivePage("inventory");
              isMobile && toggleSidebar();
            }}
          >
            <span style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              fontSize: "16px",
              fontWeight: "600",
            }}>
              <span style={{ fontSize: "20px" }}>📦</span>
              ລາຍການພັດດຸ
            </span>
          </Link>
          <Link
            to="/homeAdmin/distribution"
            style={sidebarLinkStyle("distribution")}
            onClick={() => {
              setActivePage("distribution");
              isMobile && toggleSidebar();
            }}
          >
            <span style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              fontSize: "16px",
              fontWeight: "600",
            }}>
              <span style={{ fontSize: "20px" }}>🚚</span>
              ກະຈາຍພັດດຸ
            </span>
          </Link>

          <Link
            to="/homeAdmin/tableparcels"
            style={sidebarLinkStyle("tableparcels")}
            onClick={() => {
              setActivePage("tableparcels");
              isMobile && toggleSidebar();
            }}
          >
            <span style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              fontSize: "16px",
              fontWeight: "600",
            }}>
              <span style={{ fontSize: "20px" }}>📋</span>
              ຕາຕະລາງພັດດຸ
            </span>
          </Link>

          {storedRole === "admin" && (
            <Link
              to="/homeAdmin/smallParcels"
              style={sidebarLinkStyle("smallParcels")}
              onClick={() => {
                setActivePage("smallParcels");
                isMobile && toggleSidebar();
              }}
            >
              <span style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                fontSize: "16px",
                fontWeight: "600",
              }}>
                <span style={{ fontSize: "20px" }}>📦</span>
                ສ້າງການສົ່ງພັດສະດຸລວມ
              </span>
            </Link>
          )}

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
                <span style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  fontSize: "16px",
                  fontWeight: "600",
                }}>
                  <span style={{ fontSize: "20px" }}>🌏</span>
                  ຕິດຕາມພັດສະດຸຈາກຈີນ
                </span>
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
                <span style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  fontSize: "16px",
                  fontWeight: "600",
                }}>
                  <span style={{ fontSize: "20px" }}>📍</span>
                  ຕິດຕາມພັດສະດຸ
                </span>
              </Link>
            </>
          )}
        </nav>
        
        <button
          style={{
            width: "100%",
            padding: "18px",
            background: "linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%)",
            color: "white",
            border: "none",
            borderRadius: "18px",
            cursor: "pointer",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            fontSize: "17px",
            fontWeight: "700",
            boxShadow: "0 10px 30px rgba(239, 68, 68, 0.25)",
            position: "relative",
            overflow: "hidden",
            zIndex: 2,
          }}
          onMouseOver={(e) => {
            e.target.style.transform = "translateY(-3px)";
            e.target.style.boxShadow = "0 15px 40px rgba(239, 68, 68, 0.35)";
          }}
          onMouseOut={(e) => {
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "0 10px 30px rgba(239, 68, 68, 0.25)";
          }}
          onClick={handleLogout}
        >
          <span style={{ 
            position: "relative", 
            zIndex: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            fontSize: "17px",
            fontWeight: "700",
          }}>
            <span style={{ fontSize: "20px" }}>🚪</span>
            LOGOUT
          </span>
          
          {/* Animated background overlay */}
          <div style={{
            position: "absolute",
            top: "0",
            left: "-100%",
            width: "100%",
            height: "100%",
            background: "linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, transparent 100%)",
            transition: "left 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
          }} />
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
            padding: "30px 25px",
            backgroundColor: "white",
            boxShadow: "0 4px 15px rgba(0, 0, 0, 0.12)",
            borderRadius: "15px",
            marginBottom: "25px",
            minHeight: "80px",
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
            <span style={{ fontSize: "24px", marginRight: "10px" }}>🏠</span>
            <h1 style={{ fontSize: "28px", margin: "0", color: "#374151", fontWeight: "800" }}>ໜ້າທຳອິດ</h1>
          </div>
          {!isMobile && (
            <>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                padding: "12px 20px",
                background: "linear-gradient(135deg, rgba(251, 146, 60, 0.18) 0%, rgba(249, 115, 22, 0.15) 100%)",
                borderRadius: "15px",
                border: "1px solid rgba(251, 146, 60, 0.2)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "16px" }}>📅</span>
                  <span style={{ fontWeight: "600", color: "#FB923C", fontSize: "14px" }}>
                    {new Date().toLocaleDateString("th-TH")}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "16px" }}>🕐</span>
                  <span style={{ fontWeight: "600", color: "#FB923C", fontSize: "14px" }}>
                    {new Date().toLocaleTimeString("th-TH", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "16px" }}></span>
                  <span style={{ fontWeight: "600", color: "#FB923C", fontSize: "15px" }}>
                    {username} | {role}
                  </span>
                </div>
              </div>
              <Link
                to="/"
                style={{
                  padding: "12px 20px",
                  backgroundColor: "#3B82F6",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  textDecoration: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "15px",
                  fontWeight: "700",
                  boxShadow: "0 3px 12px rgba(59, 130, 246, 0.3)",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#2563EB";
                  e.target.style.transform = "translateY(-1px)";
                  e.target.style.boxShadow = "0 4px 12px rgba(59, 130, 246, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "#3B82F6";
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 2px 8px rgba(59, 130, 246, 0.3)";
                }}
              >
                <span style={{ fontSize: "16px" }}>🏠</span>
                ໜ້າເເຣກ
              </Link>
            </>
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
                  background: "linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 30%, #FED7AA 70%, #FDBA74 100%)",
                  minHeight: "150px",
                  position: "relative",
                  overflow: "hidden",
                }}
                className="w-full"
              >
                {/* White fade overlay */}
                <div style={{
                  position: "absolute",
                  top: "0",
                  left: "0",
                  width: "100%",
                  height: "100%",
                  background: "linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 50%, transparent 100%)",
                  borderRadius: "10px",
                }} />
                <div style={{ position: "relative", zIndex: 2 }}>
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
                </div>

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
                    background: "linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 30%, #A7F3D0 70%, #6EE7B7 100%)",
                    flex: 1,
                    minWidth: "200px",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {/* White fade overlay */}
                  <div style={{
                    position: "absolute",
                    top: "0",
                    left: "0",
                    width: "100%",
                    height: "100%",
                    background: "linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 50%, transparent 100%)",
                    borderRadius: "10px",
                  }} />
                  <div style={{ position: "relative", zIndex: 2 }}>
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
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "20px",
              }}>
                <div style={{
                  width: "40px",
                  height: "40px",
                  background: "linear-gradient(135deg, #FED7AA 0%, #FDBA74 50%, #FB923C 100%)",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid rgba(254, 215, 170, 0.4)",
                  boxShadow: "0 4px 12px rgba(254, 215, 170, 0.3)",
                }}>
                  <span style={{ fontSize: "20px" }}>📦</span>
                </div>
                <h2 style={{
                  fontSize: "24px",
                  fontWeight: "600",
                  color: "#F97316",
                  margin: 0,
                  textShadow: "0 2px 4px rgba(249, 115, 22, 0.15)",
                }}>
                  ພັດດຸທີ່ຢູ່ໃນໂກດັງ
                </h2>
              </div>
              {/* Data Table */}
              <div style={{
                background: "white",
                borderRadius: "15px",
                boxShadow: "0 8px 25px rgba(0, 0, 0, 0.12)",
                border: "1px solid rgba(0, 0, 0, 0.05)",
                overflow: "hidden"
              }}>
                <table className="min-w-full leading-normal">
                  <thead>
                    <tr style={{
                      background: "linear-gradient(135deg, #FED7AA 0%, #FDBA74 50%, #FB923C 100%)",
                      borderRadius: "15px 15px 0 0",
                      boxShadow: "0 4px 12px rgba(251, 146, 60, 0.2)",
                    }}>
                    {/* คอลัมน์ลำดับ */}
                    <th style={{
                      padding: "16px 24px",
                      color: "#374151",
                      textAlign: "left",
                      fontSize: "13px",
                      fontWeight: "700",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      borderRight: "none",
                    }}>
                      No.
                    </th>
                    <th style={{
                      padding: "16px 24px",
                      color: "#374151",
                      textAlign: "left",
                      fontSize: "13px",
                      fontWeight: "700",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      borderRight: "none",
                    }}>
                      ID
                    </th>
                    <th style={{
                      padding: "16px 24px",
                      color: "#374151",
                      textAlign: "left",
                      fontSize: "13px",
                      fontWeight: "700",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      borderRight: "none",
                    }}>
                      STATUS
                    </th>
                    <th style={{
                      padding: "16px 24px",
                      color: "#374151",
                      textAlign: "left",
                      fontSize: "13px",
                      fontWeight: "700",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      borderRight: "none",
                    }}>
                      FROM
                    </th>
                    <th style={{
                      padding: "16px 24px",
                      color: "#374151",
                      textAlign: "left",
                      fontSize: "13px",
                      fontWeight: "700",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                    }}>
                      TIME
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {listParcel &&
                    listParcel.map((product, index) => (
                      <tr key={product.id_parcel} style={{ 
                        transition: "background-color 0.2s ease",
                        borderBottom: "1px solid rgba(0, 0, 0, 0.05)"
                      }}>
                        {/* ลำดับ */}
                        <td style={{
                          padding: "16px 24px",
                          backgroundColor: "white",
                          fontSize: "14px",
                          fontWeight: "500",
                          color: "#374151"
                        }}>
                          {index + 1}
                        </td>
                        <td style={{
                          padding: "16px 24px",
                          backgroundColor: "white",
                          fontSize: "14px",
                          fontWeight: "500",
                          color: "#374151"
                        }}>
                          {product.id_parcel}
                        </td>
                        <td style={{
                          padding: "16px 24px",
                          backgroundColor: "white",
                          fontSize: "14px",
                          fontWeight: "500",
                          color: "#374151"
                        }}>
                          <span style={{
                            display: "inline-block",
                            padding: "4px 12px",
                            background: product.status ? "linear-gradient(135deg, #10B981 0%, #059669 100%)" : "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
                            color: "white",
                            borderRadius: "12px",
                            fontSize: "12px",
                            fontWeight: "600"
                          }}>
                            {product.status ? "ພັດສະດຸຢູ່ສາງ" : "ລໍຖ້າ"}
                          </span>
                        </td>
                        <td style={{
                          padding: "16px 24px",
                          backgroundColor: "white",
                          fontSize: "14px",
                          fontWeight: "500",
                          color: "#374151"
                        }}>
                          {product.from}
                        </td>
                        <td style={{
                          padding: "16px 24px",
                          backgroundColor: "white",
                          fontSize: "14px",
                          fontWeight: "500",
                          color: "#374151"
                        }}>
                          {product.time}
                        </td>
                      </tr>
                    ))}
                </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
};

const cardStyle = {
  padding: "28px",
  borderRadius: "20px",
  color: "#1F2937",
  boxShadow: "0 10px 40px rgba(0, 0, 0, 0.08), 0 4px 20px rgba(0, 0, 0, 0.04)",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  border: "1px solid rgba(0, 0, 0, 0.03)",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  position: "relative",
  overflow: "hidden",
  background: "linear-gradient(135deg, #ffffff 0%, #fafafa 100%)",
};

const titleStyle = {
  fontSize: "22px",
  fontWeight: "700",
  color: "#1F2937",
  marginBottom: "8px",
  lineHeight: "1.3",
  letterSpacing: "-0.02em",
};

const valueContainerStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
};

const valueStyle = { 
  fontSize: "44px", 
  fontWeight: "800", 
  color: "#1F2937",
  lineHeight: "1",
  letterSpacing: "-0.03em",
};

const unitStyle = { 
  fontSize: "18px", 
  fontWeight: "600", 
  color: "#1F2937",
  marginLeft: "6px",
  opacity: 0.8,
};

const noteStyle = { 
  fontSize: "11px", 
  fontStyle: "normal", 
  marginTop: "6px", 
  color: "#1F2937",
  opacity: 0.7,
  fontWeight: "500",
  lineHeight: "1.4",
};

export default InventoryStatistics;
