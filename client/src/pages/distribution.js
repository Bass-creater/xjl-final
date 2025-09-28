import React, { useState, useEffect, useCallback, useRef } from "react";
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

const DistributionDashboard = ({ onDetailsChange }) => {
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

  const validateFile = (file) => {
    // Check if file is Excel
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    
    // Also check file extension for .xlxs files
    const fileName = file.name.toLowerCase();
    const isExcelFile = allowedTypes.includes(file.type) || 
                       fileName.endsWith('.xlsx') || 
                       fileName.endsWith('.xls') || 
                       fileName.endsWith('.xlxs');
    
    if (!isExcelFile) {
      Swal.fire({
        title: "Invalid File",
        text: "Please select an Excel file (.xlsx, .xls or .xlxs)",
        icon: "error",
      });
      return false;
    }
    
    return true;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
      }
    }
  };

  const handleImportExcel = async () => {
    if (!selectedFile) {
      Swal.fire({
        title: "Please Select File",
        text: "Please select an Excel file to import",
        icon: "info",
      });
      return;
    }

    setImportLoading(true);

    try {
      const formData = new FormData();
      formData.append('excelFile', selectedFile);

      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:1000/api/import-excel",
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'authorization': token
          }
        }
      );

      if (response.status === 200) {
        const { batch_uuid, imported_count, errors } = response.data;
        
        let message = `Import Successful!\n`;
        message += `Batch UUID: ${batch_uuid}\n`;
        message += `Imported Records: ${imported_count}\n`;
        
        if (errors && errors.length > 0) {
          message += `\nErrors:\n${errors.join('\n')}`;
        }

        Swal.fire({
          title: "Import Successful",
          text: message,
          icon: "success",
        }).then(() => {
          setSelectedFile(null);
          // Reset file input for China side
          const fileInput = document.getElementById('excelFileInputChina');
          if (fileInput) {
            fileInput.value = '';
          }
          // Reload page to show new data
          window.location.reload();
        });
      }
    } catch (error) {
      console.error("Import Error:", error);
      Swal.fire({
        title: "Import Failed",
        text: error?.response?.data?.message || "An error occurred while importing the file",
        icon: "error",
      });
    } finally {
      setImportLoading(false);
    }
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
  const [importLoading, setImportLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const prevDetailsDataRef = useRef();

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
        "http://localhost:1000/api/checkcredit",
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
        "http://localhost:1000/api/saveData",
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
        const response = await axios.get("http://localhost:1000/api/rate");
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

  const calculatePrice = useCallback((data) => {
    let price = 0;
    let cbm = 0;
    const width = parseFloat(data.width) || 0;
    const length = parseFloat(data.length) || 0;
    const height = parseFloat(data.height) || 0;
    const weight = parseFloat(data.weight) || 0;
    const amount = parseFloat(data.amount) || 1;

    const size = width * length * height;
    const ton = weight / 1000;

    switch (data.typeParcel) {
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
    const newPrice = (price * amount).toLocaleString("en-US");

    setDetailsData((prevData) => {
      // Only update if price actually changed
      if (prevData.price !== newPrice) {
        return {
          ...prevData,
          price: newPrice,
        };
      }
      return prevData;
    });
  }, [rateChina, rateThai]);

  useEffect(() => {
    // Only calculate if the relevant fields have changed
    const currentData = {
      typeParcel: detailsData.typeParcel,
      weight: detailsData.weight,
      width: detailsData.width,
      length: detailsData.length,
      height: detailsData.height,
      amount: detailsData.amount,
    };
    
    const prevData = prevDetailsDataRef.current;
    
    if (!prevData || 
        prevData.typeParcel !== currentData.typeParcel ||
        prevData.weight !== currentData.weight ||
        prevData.width !== currentData.width ||
        prevData.length !== currentData.length ||
        prevData.height !== currentData.height ||
        prevData.amount !== currentData.amount) {
      
      calculatePrice(detailsData);
      prevDetailsDataRef.current = currentData;
    }
  }, [
    detailsData.typeParcel,
    detailsData.weight,
    detailsData.width,
    detailsData.length,
    detailsData.height,
    detailsData.amount,
    rateChina,
    rateThai,
    calculatePrice,
    detailsData
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
        {importLoading ? (
          <div className="absolute inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
            <div style={{ textAlign: "center", color: "white" }}>
              <BarLoader color="#28a745" loading={importLoading} size={50} />
              <div style={{ marginTop: "10px", fontSize: "16px" }}>Importing data from Excel...</div>
            </div>
          </div>
        ) : null}
      </div>

      {/* <Sidebar/> */}

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
              {/* Excel Import Section for China */}
              <div className="mt-6 mb-4">
                <div
                  style={{
                    borderRadius: "10px",
                    overflow: "hidden",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                  }}
                >
                  <div style={gradientHeaderStyle("#28a745", "#20c997")}>
                    <h2 style={{ margin: 0, color: "white" }}>Import file Excel</h2>
                  </div>
                  <div style={bodyStyle}>
                    {/* Drag and Drop Area */}
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      style={{
                        border: isDragOver ? "2px dashed #28a745" : "2px dashed #ccc",
                        borderRadius: "10px",
                        padding: "20px",
                        textAlign: "center",
                        backgroundColor: isDragOver ? "#f8f9fa" : "#fff",
                        transition: "all 0.3s ease",
                        cursor: "pointer",
                        marginBottom: "15px"
                      }}
                      onClick={() => document.getElementById('excelFileInputChina').click()}
                    >
                      <div style={{ fontSize: "24px", marginBottom: "10px" }}>
                        📁
                      </div>
                      <div style={{ fontSize: "16px", fontWeight: "500", marginBottom: "5px" }}>
                        {isDragOver ? "Drop file here" : "Drag file here or click to select"}
                      </div>
                      <div style={{ fontSize: "12px", color: "#666" }}>
                        Supports .xlsx, .xls, .xlxs files
                      </div>
                    </div>

                    {/* Hidden File Input */}
                    <input
                      id="excelFileInputChina"
                      type="file"
                      accept=".xlsx,.xls,.xlxs"
                      onChange={handleFileChange}
                      style={{ display: "none" }}
                    />

                    {/* Selected File Display */}
                    {selectedFile && (
                      <div style={{ 
                        marginBottom: "15px", 
                        padding: "10px", 
                        backgroundColor: "#e8f5e8", 
                        borderRadius: "5px",
                        border: "1px solid #28a745"
                      }}>
                        <div style={{ fontSize: "14px", fontWeight: "500", color: "#28a745", marginBottom: "5px" }}>
                          ✓ Selected File
                        </div>
                        <div style={{ fontSize: "12px", color: "#666" }}>
                          {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                        </div>
                      </div>
                    )}

                    {/* Import Button */}
                    <div style={{ display: "flex", justifyContent: "center" }}>
                      <button
                        type="button"
                        onClick={handleImportExcel}
                        disabled={!selectedFile || importLoading}
                        style={{
                          padding: "12px 24px",
                          backgroundColor: selectedFile && !importLoading ? "#28a745" : "#6c757d",
                          color: "white",
                          border: "none",
                          borderRadius: "8px",
                          cursor: selectedFile && !importLoading ? "pointer" : "not-allowed",
                          fontSize: "16px",
                          fontWeight: "500",
                          transition: "all 0.3s ease",
                          minWidth: "150px"
                        }}
                        onMouseOver={(e) => {
                          if (selectedFile && !importLoading) {
                            e.target.style.backgroundColor = "#218838";
                            e.target.style.transform = "translateY(-2px)";
                          }
                        }}
                        onMouseOut={(e) => {
                          if (selectedFile && !importLoading) {
                            e.target.style.backgroundColor = "#28a745";
                            e.target.style.transform = "translateY(0)";
                          }
                        }}
                      >
                        {importLoading ? "Importing..." : "Import Excel"}
                      </button>
                    </div>

                    {/* Instructions */}
                    <div style={{ marginTop: "15px", fontSize: "12px", color: "#666", textAlign: "center" }}>
                      <strong>Note:</strong> The system will read data from column D of the Excel file and create the same UUID for all records in the file
                    </div>
                  </div>
                </div>
              </div>
              
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

export default DistributionDashboard;
