import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import "../style/font-style.css";
import axios from "axios";

const TableParcels = () => {
  const navigate = useNavigate();
  const { username, role } = useAuth();
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const storedRole = localStorage.getItem("role");

  // Sidebar states
  const [activePage, setActivePage] = useState("tableparcels");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const fetchParcels = async () => {
      try {
        const response = await axios.get("https://xjllao.com/v1/api/parcels-table");
        
        // Map API response to match the expected format
        const mappedParcels = response.data.map((parcel, index) => ({
          id: index + 1,
          parcelId: parcel.id_parcel,
          recipient: parcel.branch || "-",
          phone: parcel.tel || "-",
          from: parcel.from || "ຈີນ",
          to: parcel.branch || "-",
          status: parcel.status || "ລໍຖ້າຮັບ",
          weight: parcel.weight || "0",
          volume: parcel.volume || "0",
          amount: parcel.amount || "0",
          price: parcel.price || "0",
          time: parcel.time, // Keep original time for filtering
          dateReceived: parcel.origin ? new Date(parcel.origin).toLocaleDateString('th-TH') : "-",
          dateSent: parcel.acceptorigin ? new Date(parcel.acceptorigin).toLocaleDateString('th-TH') : "-"
        }));
        
        setParcels(mappedParcels);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching parcels:", error);
        setLoading(false);
      }
    };

    fetchParcels();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 870);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

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

  // Filter parcels based on search term and date range
  const filteredParcels = parcels.filter(parcel => {
    // Search filter
    const matchesSearch = parcel.parcelId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parcel.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parcel.phone.includes(searchTerm);
    
    // Date range filter
    let matchesDateRange = true;
    if (startDate || endDate) {
      const parcelDate = new Date(parcel.time);
      
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // Include the entire end date
        matchesDateRange = parcelDate >= start && parcelDate <= end;
      } else if (startDate) {
        const start = new Date(startDate);
        matchesDateRange = parcelDate >= start;
      } else if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        matchesDateRange = parcelDate <= end;
      }
    }
    
    return matchesSearch && matchesDateRange;
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentParcels = filteredParcels.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredParcels.length / itemsPerPage);

  const getStatusColor = (status) => {
    switch (status) {
      case "accepted":
        return "bg-green-100 text-green-800";
      case "success":
        return "bg-emerald-100 text-emerald-800";
      case "ສຳເລັດ":
        return "bg-green-100 text-green-800";
      case "ກຳລັງສົ່ງ":
        return "bg-blue-100 text-blue-800";
      case "ລໍຖ້າຮັບ":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusDisplay = (status) => {
    if (status === "accepted") {
      return (
        <span style={{ fontSize: "20px", fontWeight: "bold" }}>✓</span>
      );
    }
    if (status === "success") {
      return (
        <span style={{ 
          fontSize: "18px", 
          fontWeight: "bold",
          display: "flex",
          alignItems: "center",
          gap: "2px"
        }}>
          📦
        </span>
      );
    }
    return status;
  };

  // คำนวณน้ำหนัก, ปริมาตร และจำนวนรวม
  const totalWeight = filteredParcels.reduce((sum, parcel) => {
    return sum + (parseFloat(parcel.weight) || 0);
  }, 0);

  const totalVolume = filteredParcels.reduce((sum, parcel) => {
    return sum + (parseFloat(parcel.volume) || 0);
  }, 0);

  const totalAmount = filteredParcels.reduce((sum, parcel) => {
    return sum + (parseInt(parcel.amount) || 0);
  }, 0);

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
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
          background: "radial-gradient(circle, rgba(251, 146, 60, 0.08) 0%, transparent 70%)",
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
      <main style={{ flex: 1, overflow: "auto", backgroundColor: "#f9fafb" }}>
        {/* Header */}
        <header style={{ 
          backgroundColor: "white", 
          boxShadow: "0 4px 15px rgba(0, 0, 0, 0.12)", 
          borderRadius: "15px",
          margin: "20px",
          padding: "30px 25px",
          minHeight: "80px",
        }}>
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center" 
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}>
              {isMobile && (
                <button
                  onClick={toggleSidebar}
                  style={{
                    background: "linear-gradient(135deg, #FB923C 0%, #F97316 50%, #EA580C 100%)",
                    border: "none",
                    color: "white",
                    fontSize: "18px",
                    cursor: "pointer",
                    padding: "10px 14px",
                    borderRadius: "14px",
                    transition: "all 0.3s ease",
                    boxShadow: "0 6px 20px rgba(251, 146, 60, 0.3)",
                    fontWeight: "600",
                  }}
                  onMouseOver={(e) => {
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow = "0 8px 25px rgba(251, 146, 60, 0.4)";
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "0 6px 20px rgba(251, 146, 60, 0.3)";
                  }}
                >
                  ☰
                </button>
              )}
              <h2 style={{ 
                fontSize: "28px", 
                margin: 0, 
                fontWeight: "bold",
                color: "#374151",
              }}>
                ຕາຕະລາງພັດດຸ
              </h2>
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
                    e.target.style.boxShadow = "0 3px 12px rgba(59, 130, 246, 0.3)";
                  }}
                >
                  <span style={{ fontSize: "16px" }}>🏠</span>
                  ໜ້າເເຣກ
                </Link>
              </>
            )}
          </div>
        </header>

        {/* Content */}
        <div style={{ padding: "24px" }}>
          {/* Search and Controls */}
          <div style={{ 
            marginBottom: "24px", 
            display: "flex", 
            flexDirection: "column", 
            gap: "16px"
          }}>
            {/* Search Box */}
            <div style={{ position: "relative", flex: "1", minWidth: "250px" }}>
              <input
                type="text"
                placeholder="ຄົ້ນຫາດ້ວຍ ID ພັດດຸ (id_parcel)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 16px 8px 40px",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "14px",
                  outline: "none",
                  transition: "border-color 0.3s, box-shadow 0.3s",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#3b82f6";
                  e.target.style.boxShadow = "0 0 0 2px rgba(59, 130, 246, 0.2)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#d1d5db";
                  e.target.style.boxShadow = "none";
                }}
              />
              <div style={{ 
                position: "absolute", 
                top: "50%", 
                left: "12px", 
                transform: "translateY(-50%)", 
                pointerEvents: "none" 
              }}>
                <svg style={{ width: "20px", height: "20px", color: "#9ca3af" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Date Range Filter */}
            <div style={{ 
              display: "flex", 
              gap: "16px", 
              alignItems: "center",
              flexWrap: "wrap",
              padding: "20px",
              background: "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%)",
              borderRadius: "16px",
              border: "1px solid rgba(203, 213, 225, 0.5)",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)"
            }}>
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "10px",
                padding: "12px 16px",
                background: "linear-gradient(135deg, rgba(251, 146, 60, 0.08) 0%, rgba(249, 115, 22, 0.05) 100%)",
                borderRadius: "12px",
                border: "1px solid rgba(251, 146, 60, 0.2)"
              }}>
                <span style={{ fontSize: "18px" }}>📅</span>
                <label style={{ 
                  fontSize: "14px", 
                  color: "#374151", 
                  fontWeight: "600",
                  minWidth: "100px"
                }}>
                  ວັນທີເລີ່ມຕົ້ນ:
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  style={{
                    padding: "10px 14px",
                    border: "2px solid #e5e7eb",
                    borderRadius: "10px",
                    fontSize: "14px",
                    fontWeight: "500",
                    outline: "none",
                    transition: "all 0.3s ease",
                    backgroundColor: "white",
                    minWidth: "160px"
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#FB923C";
                    e.target.style.boxShadow = "0 0 0 3px rgba(251, 146, 60, 0.15)";
                    e.target.style.transform = "translateY(-1px)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e5e7eb";
                    e.target.style.boxShadow = "none";
                    e.target.style.transform = "translateY(0)";
                  }}
                />
              </div>

              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "10px",
                padding: "12px 16px",
                background: "linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(37, 99, 235, 0.05) 100%)",
                borderRadius: "12px",
                border: "1px solid rgba(59, 130, 246, 0.2)"
              }}>
                <span style={{ fontSize: "18px" }}>📅</span>
                <label style={{ 
                  fontSize: "14px", 
                  color: "#374151", 
                  fontWeight: "600",
                  minWidth: "100px"
                }}>
                  ວັນທີສິ້ນສຸດ:
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  style={{
                    padding: "10px 14px",
                    border: "2px solid #e5e7eb",
                    borderRadius: "10px",
                    fontSize: "14px",
                    fontWeight: "500",
                    outline: "none",
                    transition: "all 0.3s ease",
                    backgroundColor: "white",
                    minWidth: "160px"
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#3B82F6";
                    e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.15)";
                    e.target.style.transform = "translateY(-1px)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e5e7eb";
                    e.target.style.boxShadow = "none";
                    e.target.style.transform = "translateY(0)";
                  }}
                />
              </div>

              {(startDate || endDate) && (
                <button
                  onClick={() => {
                    setStartDate("");
                    setEndDate("");
                    setCurrentPage(1);
                  }}
                  style={{
                    padding: "12px 20px",
                    background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                    color: "white",
                    border: "none",
                    borderRadius: "12px",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    boxShadow: "0 4px 12px rgba(239, 68, 68, 0.25)",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "#dc2626";
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow = "0 6px 16px rgba(239, 68, 68, 0.35)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)";
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "0 4px 12px rgba(239, 68, 68, 0.25)";
                  }}
                >
                  <span style={{ fontSize: "16px" }}>🗑️</span>
                  ລ້າງການກັ່ນຕອງ
                </button>
              )}
            </div>

            <div style={{ 
              display: "flex", 
              gap: "20px", 
              flexWrap: "wrap",
              alignItems: "center"
            }}>
              <div style={{ 
                fontSize: "14px", 
                color: "#6b7280",
                fontWeight: "600"
              }}>
                ທັງໝົດ {filteredParcels.length} ລາຍການ
              </div>
              <div style={{
                padding: "8px 16px",
                background: "linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.1) 100%)",
                borderRadius: "8px",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                fontSize: "14px",
                fontWeight: "600",
                color: "#059669"
              }}>
                ⚖️ ນ້ຳໜັກທັງໝົດ: {totalWeight.toFixed(2)} kg
              </div>
              <div style={{
                padding: "8px 16px",
                background: "linear-gradient(135deg, rgba(251, 146, 60, 0.15) 0%, rgba(249, 115, 22, 0.1) 100%)",
                borderRadius: "8px",
                border: "1px solid rgba(251, 146, 60, 0.3)",
                fontSize: "14px",
                fontWeight: "600",
                color: "#EA580C"
              }}>
                📦 ປະລິມານທັງໝົດ: {totalVolume.toFixed(2)} CBM
              </div>
              <div style={{
                padding: "8px 16px",
                background: "linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.1) 100%)",
                borderRadius: "8px",
                border: "1px solid rgba(59, 130, 246, 0.3)",
                fontSize: "14px",
                fontWeight: "600",
                color: "#2563EB"
              }}>
                📊 ຈຳນວນທັງໝົດ: {totalAmount} ຊິ້ນ
              </div>
            </div>
          </div>

          {/* Table */}
          <div style={{ 
            backgroundColor: "white", 
            borderRadius: "8px", 
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)", 
            overflow: "hidden" 
          }}>
            {loading ? (
              <div style={{ 
                display: "flex", 
                justifyContent: "center", 
                alignItems: "center", 
                height: "256px" 
              }}>
                <div style={{
                  width: "48px",
                  height: "48px",
                  border: "3px solid #e5e7eb",
                  borderTop: "3px solid #ff6b35",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite"
                }}></div>
              </div>
            ) : filteredParcels.length === 0 ? (
              <div style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                height: "256px",
                gap: "16px"
              }}>
                <div style={{ fontSize: "48px" }}>📦</div>
                <div style={{ 
                  fontSize: "18px", 
                  fontWeight: "600", 
                  color: "#374151" 
                }}>
                  {(startDate || endDate) ? "ບໍ່ມີພັດດຸວັນທີດັ່ງກ່າວ" : "ບໍ່ມີຂໍ້ມູນ"}
                </div>
                <div style={{ 
                  fontSize: "14px", 
                  color: "#6b7280" 
                }}>
                  {(startDate || endDate) ? "ລອງປ່ຽນຊ່ວງວັນທີທີ່ຕ້ອງການຄົ້ນຫາ" : "ບໍ່ມີພັດດຸໃນລະບົບ"}
                </div>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th style={{
                          padding: "12px 20px",
                          borderBottom: "2px solid rgba(251, 146, 60, 0.3)",
                          background: "linear-gradient(135deg, rgba(251, 146, 60, 0.1) 0%, rgba(249, 115, 22, 0.08) 100%)",
                          textAlign: "left",
                          fontSize: "12px",
                          fontWeight: "600",
                          color: "rgb(55, 65, 81)",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}>
                          ລຳດັບ
                        </th>
                        <th style={{
                          padding: "12px 20px",
                          borderBottom: "2px solid rgba(251, 146, 60, 0.3)",
                          background: "linear-gradient(135deg, rgba(251, 146, 60, 0.1) 0%, rgba(249, 115, 22, 0.08) 100%)",
                          textAlign: "left",
                          fontSize: "12px",
                          fontWeight: "600",
                          color: "rgb(55, 65, 81)",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}>
                          ລະຫັດພັດດຸ
                        </th>
                        <th style={{
                          padding: "12px 20px",
                          borderBottom: "2px solid rgba(251, 146, 60, 0.3)",
                          background: "linear-gradient(135deg, rgba(251, 146, 60, 0.1) 0%, rgba(249, 115, 22, 0.08) 100%)",
                          textAlign: "left",
                          fontSize: "12px",
                          fontWeight: "600",
                          color: "rgb(55, 65, 81)",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}>
                          ຜູ້ຮັບ
                        </th>
                        <th style={{
                          padding: "12px 20px",
                          borderBottom: "2px solid rgba(251, 146, 60, 0.3)",
                          background: "linear-gradient(135deg, rgba(251, 146, 60, 0.1) 0%, rgba(249, 115, 22, 0.08) 100%)",
                          textAlign: "left",
                          fontSize: "12px",
                          fontWeight: "600",
                          color: "rgb(55, 65, 81)",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}>
                          ເບີໂທ
                        </th>
                        <th style={{
                          padding: "12px 20px",
                          borderBottom: "2px solid rgba(251, 146, 60, 0.3)",
                          background: "linear-gradient(135deg, rgba(251, 146, 60, 0.1) 0%, rgba(249, 115, 22, 0.08) 100%)",
                          textAlign: "left",
                          fontSize: "12px",
                          fontWeight: "600",
                          color: "rgb(55, 65, 81)",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}>
                          ຈາກ - ໄປ
                        </th>
                        <th style={{
                          padding: "12px 20px",
                          borderBottom: "2px solid rgba(251, 146, 60, 0.3)",
                          background: "linear-gradient(135deg, rgba(251, 146, 60, 0.1) 0%, rgba(249, 115, 22, 0.08) 100%)",
                          textAlign: "left",
                          fontSize: "12px",
                          fontWeight: "600",
                          color: "rgb(55, 65, 81)",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}>
                          ນ້ຳໜັກ (kg)
                        </th>
                        <th style={{
                          padding: "12px 20px",
                          borderBottom: "2px solid rgba(251, 146, 60, 0.3)",
                          background: "linear-gradient(135deg, rgba(251, 146, 60, 0.1) 0%, rgba(249, 115, 22, 0.08) 100%)",
                          textAlign: "left",
                          fontSize: "12px",
                          fontWeight: "600",
                          color: "rgb(55, 65, 81)",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}>
                          ປະລິມານ (CBM)
                        </th>
                        <th style={{
                          padding: "12px 20px",
                          borderBottom: "2px solid rgba(251, 146, 60, 0.3)",
                          background: "linear-gradient(135deg, rgba(251, 146, 60, 0.1) 0%, rgba(249, 115, 22, 0.08) 100%)",
                          textAlign: "left",
                          fontSize: "12px",
                          fontWeight: "600",
                          color: "rgb(55, 65, 81)",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}>
                          ຈຳນວນ
                        </th>
                        <th style={{
                          padding: "12px 20px",
                          borderBottom: "2px solid rgba(251, 146, 60, 0.3)",
                          background: "linear-gradient(135deg, rgba(251, 146, 60, 0.1) 0%, rgba(249, 115, 22, 0.08) 100%)",
                          textAlign: "left",
                          fontSize: "12px",
                          fontWeight: "600",
                          color: "rgb(55, 65, 81)",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}>
                          ລາຄາ (LAK)
                        </th>
                        <th style={{
                          padding: "12px 20px",
                          borderBottom: "2px solid rgba(251, 146, 60, 0.3)",
                          background: "linear-gradient(135deg, rgba(251, 146, 60, 0.1) 0%, rgba(249, 115, 22, 0.08) 100%)",
                          textAlign: "left",
                          fontSize: "12px",
                          fontWeight: "600",
                          color: "rgb(55, 65, 81)",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}>
                          ສະຖານະ
                        </th>
                        <th style={{
                          padding: "12px 20px",
                          borderBottom: "2px solid rgba(251, 146, 60, 0.3)",
                          background: "linear-gradient(135deg, rgba(251, 146, 60, 0.1) 0%, rgba(249, 115, 22, 0.08) 100%)",
                          textAlign: "left",
                          fontSize: "12px",
                          fontWeight: "600",
                          color: "rgb(55, 65, 81)",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}>
                          ວັນທີຮັບຈາກຈີນ
                        </th>
                        <th style={{
                          padding: "12px 20px",
                          borderBottom: "2px solid rgba(251, 146, 60, 0.3)",
                          background: "linear-gradient(135deg, rgba(251, 146, 60, 0.1) 0%, rgba(249, 115, 22, 0.08) 100%)",
                          textAlign: "left",
                          fontSize: "12px",
                          fontWeight: "600",
                          color: "rgb(55, 65, 81)",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}>
                          ວັນທີຮັບຈາກລາວ
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentParcels.map((parcel, index) => (
                        <tr key={parcel.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {indexOfFirstItem + index + 1}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{parcel.parcelId}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {parcel.recipient}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {parcel.phone}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {parcel.from} → {parcel.to}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {parcel.weight}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {parcel.volume}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {parcel.amount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {parcel.price}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(parcel.status)}`}>
                              {getStatusDisplay(parcel.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {parcel.dateReceived}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {parcel.dateSent}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Enhanced Pagination */}
                {totalPages > 1 && (
                  <div style={{
                    backgroundColor: "white",
                    padding: "24px 32px",
                    borderTop: "2px solid rgba(251, 146, 60, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "16px",
                    background: "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%)"
                  }}>
                    {/* Mobile Pagination */}
                    <div style={{ 
                      justifyContent: "space-between", 
                      width: "100%",
                      display: window.innerWidth <= 640 ? "flex" : "none"
                    }}>
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        style={{
                          padding: "12px 20px",
                          background: currentPage === 1 
                            ? "linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)" 
                            : "linear-gradient(135deg, #FB923C 0%, #F97316 50%, #EA580C 100%)",
                          color: currentPage === 1 ? "#9ca3af" : "white",
                          border: "none",
                          borderRadius: "12px",
                          fontSize: "14px",
                          fontWeight: "600",
                          cursor: currentPage === 1 ? "not-allowed" : "pointer",
                          transition: "all 0.3s ease",
                          boxShadow: currentPage === 1 ? "none" : "0 4px 12px rgba(251, 146, 60, 0.3)",
                          opacity: currentPage === 1 ? 0.5 : 1
                        }}
                        onMouseEnter={(e) => {
                          if (currentPage !== 1) {
                            e.target.style.transform = "translateY(-2px)";
                            e.target.style.boxShadow = "0 6px 16px rgba(251, 146, 60, 0.4)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (currentPage !== 1) {
                            e.target.style.transform = "translateY(0)";
                            e.target.style.boxShadow = "0 4px 12px rgba(251, 146, 60, 0.3)";
                          }
                        }}
                      >
                        ← ກ່ອນໜ້າ
                      </button>
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "8px 16px",
                        background: "linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.05) 100%)",
                        borderRadius: "12px",
                        border: "1px solid rgba(59, 130, 246, 0.2)"
                      }}>
                        <span style={{ fontSize: "14px", fontWeight: "600", color: "#2563EB" }}>
                          ໜ້າ {currentPage} / {totalPages}
                        </span>
                      </div>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        style={{
                          padding: "12px 20px",
                          background: currentPage === totalPages 
                            ? "linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)" 
                            : "linear-gradient(135deg, #FB923C 0%, #F97316 50%, #EA580C 100%)",
                          color: currentPage === totalPages ? "#9ca3af" : "white",
                          border: "none",
                          borderRadius: "12px",
                          fontSize: "14px",
                          fontWeight: "600",
                          cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                          transition: "all 0.3s ease",
                          boxShadow: currentPage === totalPages ? "none" : "0 4px 12px rgba(251, 146, 60, 0.3)",
                          opacity: currentPage === totalPages ? 0.5 : 1
                        }}
                        onMouseEnter={(e) => {
                          if (currentPage !== totalPages) {
                            e.target.style.transform = "translateY(-2px)";
                            e.target.style.boxShadow = "0 6px 16px rgba(251, 146, 60, 0.4)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (currentPage !== totalPages) {
                            e.target.style.transform = "translateY(0)";
                            e.target.style.boxShadow = "0 4px 12px rgba(251, 146, 60, 0.3)";
                          }
                        }}
                      >
                        ຕໍ່ໄປ →
                      </button>
                    </div>

                    {/* Desktop Pagination */}
                    <div style={{ 
                      alignItems: "center", 
                      justifyContent: "space-between", 
                      width: "100%",
                      display: window.innerWidth > 640 ? "flex" : "none"
                    }}>
                      {/* Page Info */}
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                        padding: "12px 20px",
                        background: "linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)",
                        borderRadius: "12px",
                        border: "1px solid rgba(16, 185, 129, 0.2)"
                      }}>
                        <span style={{ fontSize: "16px" }}>📊</span>
                        <div style={{ fontSize: "14px", fontWeight: "600", color: "#059669" }}>
                          ສະແດງ <span style={{ fontWeight: "700", color: "#047857" }}>{indexOfFirstItem + 1}</span> ຫາ{' '}
                          <span style={{ fontWeight: "700", color: "#047857" }}>
                            {Math.min(indexOfLastItem, filteredParcels.length)}
                          </span>{' '}
                          ຈາກ <span style={{ fontWeight: "700", color: "#047857" }}>{filteredParcels.length}</span> ລາຍການ
                      </div>
                      </div>

                      {/* Navigation Controls */}
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        {/* First Page */}
                        <button
                          onClick={() => setCurrentPage(1)}
                          disabled={currentPage === 1}
                          style={{
                            padding: "10px 12px",
                            background: currentPage === 1 
                              ? "linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)" 
                              : "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
                            color: currentPage === 1 ? "#9ca3af" : "white",
                            border: "none",
                            borderRadius: "10px",
                            fontSize: "14px",
                            fontWeight: "600",
                            cursor: currentPage === 1 ? "not-allowed" : "pointer",
                            transition: "all 0.3s ease",
                            boxShadow: currentPage === 1 ? "none" : "0 3px 10px rgba(59, 130, 246, 0.3)",
                            opacity: currentPage === 1 ? 0.5 : 1
                          }}
                          onMouseEnter={(e) => {
                            if (currentPage !== 1) {
                              e.target.style.transform = "translateY(-1px)";
                              e.target.style.boxShadow = "0 4px 12px rgba(59, 130, 246, 0.4)";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (currentPage !== 1) {
                              e.target.style.transform = "translateY(0)";
                              e.target.style.boxShadow = "0 3px 10px rgba(59, 130, 246, 0.3)";
                            }
                          }}
                        >
                          ⏮️
                        </button>

                        {/* Previous Page */}
                          <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                          style={{
                            padding: "10px 12px",
                            background: currentPage === 1 
                              ? "linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)" 
                              : "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
                            color: currentPage === 1 ? "#9ca3af" : "white",
                            border: "none",
                            borderRadius: "10px",
                            fontSize: "14px",
                            fontWeight: "600",
                            cursor: currentPage === 1 ? "not-allowed" : "pointer",
                            transition: "all 0.3s ease",
                            boxShadow: currentPage === 1 ? "none" : "0 3px 10px rgba(59, 130, 246, 0.3)",
                            opacity: currentPage === 1 ? 0.5 : 1
                          }}
                          onMouseEnter={(e) => {
                            if (currentPage !== 1) {
                              e.target.style.transform = "translateY(-1px)";
                              e.target.style.boxShadow = "0 4px 12px rgba(59, 130, 246, 0.4)";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (currentPage !== 1) {
                              e.target.style.transform = "translateY(0)";
                              e.target.style.boxShadow = "0 3px 10px rgba(59, 130, 246, 0.3)";
                            }
                          }}
                        >
                          ⏪
                          </button>

                        {/* Page Numbers */}
                        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          {(() => {
                            const maxVisiblePages = 7;
                            const halfVisible = Math.floor(maxVisiblePages / 2);
                            let startPage = Math.max(1, currentPage - halfVisible);
                            let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                            
                            if (endPage - startPage < maxVisiblePages - 1) {
                              startPage = Math.max(1, endPage - maxVisiblePages + 1);
                            }

                            const pages = [];
                            
                            // First page + ellipsis
                            if (startPage > 1) {
                              pages.push(
                            <button
                                  key={1}
                                  onClick={() => setCurrentPage(1)}
                                  style={{
                                    padding: "10px 14px",
                                    background: "linear-gradient(135deg, #6B7280 0%, #4B5563 100%)",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "10px",
                                    fontSize: "14px",
                                    fontWeight: "600",
                                    cursor: "pointer",
                                    transition: "all 0.3s ease",
                                    boxShadow: "0 3px 10px rgba(107, 114, 128, 0.3)"
                                  }}
                                  onMouseEnter={(e) => {
                                    e.target.style.transform = "translateY(-1px)";
                                    e.target.style.boxShadow = "0 4px 12px rgba(107, 114, 128, 0.4)";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.target.style.transform = "translateY(0)";
                                    e.target.style.boxShadow = "0 3px 10px rgba(107, 114, 128, 0.3)";
                                  }}
                                >
                                  1
                            </button>
                              );
                              
                              if (startPage > 2) {
                                pages.push(
                                  <span key="ellipsis1" style={{ 
                                    padding: "10px 8px", 
                                    fontSize: "14px", 
                                    fontWeight: "600", 
                                    color: "#6B7280" 
                                  }}>
                                    ...
                                  </span>
                                );
                              }
                            }

                            // Visible pages
                            for (let i = startPage; i <= endPage; i++) {
                              pages.push(
                                <button
                                  key={i}
                                  onClick={() => setCurrentPage(i)}
                                  style={{
                                    padding: "10px 14px",
                                    background: currentPage === i 
                                      ? "linear-gradient(135deg, #FB923C 0%, #F97316 50%, #EA580C 100%)" 
                                      : "linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)",
                                    color: currentPage === i ? "white" : "#374151",
                                    border: currentPage === i ? "none" : "1px solid #D1D5DB",
                                    borderRadius: "10px",
                                    fontSize: "14px",
                                    fontWeight: "600",
                                    cursor: "pointer",
                                    transition: "all 0.3s ease",
                                    boxShadow: currentPage === i 
                                      ? "0 4px 12px rgba(251, 146, 60, 0.4)" 
                                      : "0 2px 6px rgba(0, 0, 0, 0.1)"
                                  }}
                                  onMouseEnter={(e) => {
                                    if (currentPage !== i) {
                                      e.target.style.transform = "translateY(-1px)";
                                      e.target.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    if (currentPage !== i) {
                                      e.target.style.transform = "translateY(0)";
                                      e.target.style.boxShadow = "0 2px 6px rgba(0, 0, 0, 0.1)";
                                    }
                                  }}
                                >
                                  {i}
                                </button>
                              );
                            }

                            // Last page + ellipsis
                            if (endPage < totalPages) {
                              if (endPage < totalPages - 1) {
                                pages.push(
                                  <span key="ellipsis2" style={{ 
                                    padding: "10px 8px", 
                                    fontSize: "14px", 
                                    fontWeight: "600", 
                                    color: "#6B7280" 
                                  }}>
                                    ...
                                  </span>
                                );
                              }
                              
                              pages.push(
                                <button
                                  key={totalPages}
                                  onClick={() => setCurrentPage(totalPages)}
                                  style={{
                                    padding: "10px 14px",
                                    background: "linear-gradient(135deg, #6B7280 0%, #4B5563 100%)",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "10px",
                                    fontSize: "14px",
                                    fontWeight: "600",
                                    cursor: "pointer",
                                    transition: "all 0.3s ease",
                                    boxShadow: "0 3px 10px rgba(107, 114, 128, 0.3)"
                                  }}
                                  onMouseEnter={(e) => {
                                    e.target.style.transform = "translateY(-1px)";
                                    e.target.style.boxShadow = "0 4px 12px rgba(107, 114, 128, 0.4)";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.target.style.transform = "translateY(0)";
                                    e.target.style.boxShadow = "0 3px 10px rgba(107, 114, 128, 0.3)";
                                  }}
                                >
                                  {totalPages}
                                </button>
                              );
                            }

                            return pages;
                          })()}
                        </div>

                        {/* Next Page */}
                          <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                          style={{
                            padding: "10px 12px",
                            background: currentPage === totalPages 
                              ? "linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)" 
                              : "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
                            color: currentPage === totalPages ? "#9ca3af" : "white",
                            border: "none",
                            borderRadius: "10px",
                            fontSize: "14px",
                            fontWeight: "600",
                            cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                            transition: "all 0.3s ease",
                            boxShadow: currentPage === totalPages ? "none" : "0 3px 10px rgba(59, 130, 246, 0.3)",
                            opacity: currentPage === totalPages ? 0.5 : 1
                          }}
                          onMouseEnter={(e) => {
                            if (currentPage !== totalPages) {
                              e.target.style.transform = "translateY(-1px)";
                              e.target.style.boxShadow = "0 4px 12px rgba(59, 130, 246, 0.4)";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (currentPage !== totalPages) {
                              e.target.style.transform = "translateY(0)";
                              e.target.style.boxShadow = "0 3px 10px rgba(59, 130, 246, 0.3)";
                            }
                          }}
                        >
                          ⏩
                          </button>

                        {/* Last Page */}
                        <button
                          onClick={() => setCurrentPage(totalPages)}
                          disabled={currentPage === totalPages}
                          style={{
                            padding: "10px 12px",
                            background: currentPage === totalPages 
                              ? "linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)" 
                              : "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
                            color: currentPage === totalPages ? "#9ca3af" : "white",
                            border: "none",
                            borderRadius: "10px",
                            fontSize: "14px",
                            fontWeight: "600",
                            cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                            transition: "all 0.3s ease",
                            boxShadow: currentPage === totalPages ? "none" : "0 3px 10px rgba(59, 130, 246, 0.3)",
                            opacity: currentPage === totalPages ? 0.5 : 1
                          }}
                          onMouseEnter={(e) => {
                            if (currentPage !== totalPages) {
                              e.target.style.transform = "translateY(-1px)";
                              e.target.style.boxShadow = "0 4px 12px rgba(59, 130, 246, 0.4)";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (currentPage !== totalPages) {
                              e.target.style.transform = "translateY(0)";
                              e.target.style.boxShadow = "0 3px 10px rgba(59, 130, 246, 0.3)";
                            }
                          }}
                        >
                          ⏭️
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default TableParcels;
