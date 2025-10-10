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
  const storedBranch = localStorage.getItem("branch");

  // Sidebar states
  const [activePage, setActivePage] = useState("tableparcels");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const fetchParcels = async () => {
      try {
        const response = await axios.get("https://xjllao.com/v1/api/parcelswait");
        
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
          price: parcel.price || "0",
          time: parcel.time, // Keep original time for filtering
          date: parcel.time ? new Date(parcel.time).toLocaleDateString('th-TH') : "-"
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
    return status;
  };

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
              gap: "12px", 
              alignItems: "center",
              flexWrap: "wrap"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <label style={{ fontSize: "14px", color: "#374151", fontWeight: "500" }}>
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
                    padding: "8px 12px",
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
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <label style={{ fontSize: "14px", color: "#374151", fontWeight: "500" }}>
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
                    padding: "8px 12px",
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
              </div>

              {(startDate || endDate) && (
                <button
                  onClick={() => {
                    setStartDate("");
                    setEndDate("");
                    setCurrentPage(1);
                  }}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#ef4444",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "500",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "#dc2626";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "#ef4444";
                  }}
                >
                  ລ້າງການກັ່ນຕອງ
                </button>
              )}
            </div>

            <div style={{ fontSize: "14px", color: "#6b7280" }}>
              ທັງໝົດ {filteredParcels.length} ລາຍການ
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
                          ວັນທີ
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
                            {parcel.price}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(parcel.status)}`}>
                              {getStatusDisplay(parcel.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {parcel.date}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                    <div className="flex-1 flex justify-between sm:hidden">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        ກ່ອນໜ້າ
                      </button>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        ຕໍ່ໄປ
                      </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-700">
                          ສະແດງ <span className="font-medium">{indexOfFirstItem + 1}</span> ຫາ{' '}
                          <span className="font-medium">
                            {Math.min(indexOfLastItem, filteredParcels.length)}
                          </span>{' '}
                          ຈາກ <span className="font-medium">{filteredParcels.length}</span> ລາຍການ
                        </p>
                      </div>
                      <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                          <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </button>
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                currentPage === page
                                  ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                              }`}
                            >
                              {page}
                            </button>
                          ))}
                          <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </nav>
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
