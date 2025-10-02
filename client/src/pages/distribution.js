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

// เพิ่ม CSS สำหรับ SweetAlert2 popup และ Loading animations
const swalCustomStyles = `
  .swal-custom-popup {
    border-radius: 20px !important;
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15) !important;
    backdrop-filter: blur(20px) !important;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%) !important;
    border: 1px solid rgba(255, 255, 255, 0.3) !important;
  }
  
  .swal-custom-title {
    font-family: 'Inter', sans-serif !important;
    font-weight: 800 !important;
    color: #1F2937 !important;
  }
  
  .swal-custom-content {
    font-family: 'Inter', sans-serif !important;
    line-height: 1.6 !important;
  }
  
  .swal2-confirm {
    background: linear-gradient(135deg, #22C55E 0%, #16A34A 100%) !important;
    border: none !important;
    border-radius: 12px !important;
    padding: 12px 24px !important;
    font-weight: 700 !important;
    font-size: 16px !important;
    box-shadow: 0 8px 25px rgba(34, 197, 94, 0.3) !important;
    transition: all 0.3s ease !important;
  }
  
  .swal2-confirm:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 12px 30px rgba(34, 197, 94, 0.4) !important;
  }

  /* Loading animations */
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes slideInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  @keyframes pulse {
    0%, 100% {
      transform: translate(-50%, -50%);
    }
    50% {
      transform: translate(-50%, -50%);
    }
  }

  @keyframes progressBar {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
`;

// เพิ่ม CSS styles เข้าไปใน head
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = swalCustomStyles;
  document.head.appendChild(styleSheet);
}

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
    discount: "0", // เพิ่ม discount field
  });
  // const [detailsData, setDetailsData] = useState({});

  const handleParcelChange = (data) => {
    setParcelData(data);
  };
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [importLoading, setImportLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
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

      const response = await axios.post(
        "https://xjllao.com/v1/api/import-excel",
        formData,
        {
          headers: {
            'Authorization': localStorage.getItem('token'),
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.status === 200) {
        const { batch_uuid, imported_count, duplicates_skipped, imported_records } = response.data;
        
        // สร้าง HTML สำหรับแสดงผลแบบสวยงาม
        let htmlContent = `
          <div style="text-align: center; font-family: 'Inter', sans-serif;">
            <div style="margin-bottom: 20px;">
              <div style="font-size: 48px; margin-bottom: 10px;">✅</div>
              <h2 style="color: #22C55E; margin: 0; font-size: 24px; font-weight: 700;">Import สำเร็จ!</h2>
              <p style="color: #6B7280; margin: 8px 0 0 0; font-size: 14px;">Batch UUID: ${batch_uuid}</p>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
              <div style="background: linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(22, 163, 74, 0.05) 100%); 
                          padding: 15px; border-radius: 12px; border: 1px solid rgba(34, 197, 94, 0.2);">
                <div style="font-size: 24px; font-weight: 800; color: #22C55E; margin-bottom: 5px;">${imported_count}</div>
                <div style="font-size: 14px; color: #16A34A; font-weight: 600;">นำเข้าสำเร็จ</div>
              </div>
              <div style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.05) 100%); 
                          padding: 15px; border-radius: 12px; border: 1px solid rgba(245, 158, 11, 0.2);">
                <div style="font-size: 24px; font-weight: 800; color: #F59E0B; margin-bottom: 5px;">${duplicates_skipped || 0}</div>
                <div style="font-size: 14px; color: #D97706; font-weight: 600;">ข้ามข้อมูลซ้ำ</div>
              </div>
            </div>
        `;

        // แสดงรายการ Parcel IDs ที่นำเข้าสำเร็จ
        if (imported_records && imported_records.length > 0) {
          htmlContent += `
            <div style="margin-bottom: 20px;">
              <h3 style="color: #22C55E; font-size: 16px; font-weight: 700; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 18px;">📦</span>
                Parcel IDs ที่นำเข้าสำเร็จ (${imported_records.length} รายการ)
              </h3>
              <div style="max-height: 200px; overflow-y: auto; background: rgba(34, 197, 94, 0.05); 
                          border-radius: 8px; padding: 10px; border: 1px solid rgba(34, 197, 94, 0.1);">
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 8px;">
          `;
          
          imported_records.forEach(record => {
            htmlContent += `
              <div style="background: linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(22, 163, 74, 0.1) 100%); 
                          padding: 8px 12px; border-radius: 6px; border: 1px solid rgba(34, 197, 94, 0.2); 
                          font-size: 12px; font-weight: 600; color: #16A34A; text-align: center;">
                ${record.id_parcel}
              </div>
            `;
          });
          
          htmlContent += `
                </div>
              </div>
            </div>
          `;
        }

        htmlContent += `
          </div>
        `;

        Swal.fire({
          title: "",
          html: htmlContent,
          icon: "success",
          width: "600px",
          showConfirmButton: true,
          confirmButtonText: "ตกลง",
          confirmButtonColor: "#22C55E",
          customClass: {
            popup: 'swal-custom-popup',
            title: 'swal-custom-title',
            content: 'swal-custom-content'
          }
        }).then(() => {
          setSelectedFile(null);
          // Reset file input
          const fileInput = document.getElementById('excel-file-input');
          if (fileInput) fileInput.value = '';
        });
      }
    } catch (error) {
      console.error("Import Excel Error:", error);
      Swal.fire({
        title: "Import Failed",
        text: error?.response?.data?.message || "Failed to import Excel file",
        icon: "error",
      });
    } finally {
      setImportLoading(false);
    }
  };

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
        "https://xjllao.com/v1/api/checkcredit",
        { branch: parcelData.branch }
      );

      const userCredit = checkCredit.data.credit;

      if (userCredit < calculateDiscountedPrice()) {
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
          discount: parseInt(detailsData.discount, 10),
          finalPrice: calculateDiscountedPrice(), // เพิ่มราคาหลังหักส่วนลด
        },
      };
      console.log("Sending data", fullData);
      const response = await axios.post(
        "https://xjllao.com/v1/api/saveData",
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
        const response = await axios.get("https://xjllao.com/v1/api/rate");
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
      discount: "0", // รีเซ็ต discount เมื่อราคาเปลี่ยน
    }));
  };

  const formatPrice = () => {
    setDetailsData((prevData) => ({
      ...prevData,
      price: Number(prevData.price).toLocaleString("en-US"),
    }));
  };

  // เพิ่ม function สำหรับจัดการ discount
  const handleDiscountChange = (e) => {
    const discount = e.target.value;
    setDetailsData((prevData) => ({
      ...prevData,
      discount,
    }));
  };

  // คำนวณราคาหลังหักส่วนลด
  const calculateDiscountedPrice = () => {
    const originalPrice = parseFloat(detailsData.price.replace(/,/g, "")) || 0;
    const discountPercent = parseFloat(detailsData.discount) || 0;
    
    if (originalPrice === 0 || discountPercent === 0) {
      return originalPrice;
    }
    
    const discountAmount = (originalPrice * discountPercent) / 100;
    return originalPrice - discountAmount;
  };

  // แสดงราคาหลังหักส่วนลด
  const getDisplayPrice = () => {
    const discountedPrice = calculateDiscountedPrice();
    return discountedPrice.toLocaleString("en-US");
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
  }, [detailsData.typeParcel, detailsData.weight, detailsData.width, detailsData.length, detailsData.height, detailsData.amount, rateChina, rateThai]);

  useEffect(() => {
    calculatePrice();
  }, [calculatePrice]);

  useEffect(() => {
    console.log(detailsData);
  }, [detailsData]);

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        fontFamily: "Inter, Arial, sans-serif",
      }}
    >
      {/* Enhanced Loading overlay for parcel data saving */}
      {loading && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          backdropFilter: "blur(8px)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 9999,
          animation: "fadeIn 0.3s ease-in-out"
        }}>
          <div style={{
            background: "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%)",
            borderRadius: "20px",
            padding: "40px 50px",
            textAlign: "center",
            boxShadow: "0 25px 50px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.2)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            backdropFilter: "blur(20px)",
            maxWidth: "400px",
            width: "90%",
            animation: "slideInUp 0.4s ease-out"
          }}>
            {/* Animated spinner */}
            <div style={{
              width: "60px",
              height: "60px",
              margin: "0 auto 20px",
              position: "relative"
            }}>
              <div style={{
                width: "100%",
                height: "100%",
                border: "4px solid rgba(255, 107, 53, 0.1)",
                borderTop: "4px solid #ff6b35",
                borderRadius: "50%",
                animation: "spin 1s linear infinite"
              }}></div>
              <div style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                fontSize: "24px",
                animation: "pulse 2s ease-in-out infinite"
              }}>
                💾
              </div>
            </div>
            
            {/* Loading text */}
            <h3 style={{
              margin: "0 0 10px 0",
              fontSize: "20px",
              fontWeight: "700",
              color: "#1F2937",
              fontFamily: "'Inter', sans-serif"
            }}>
              กำลังบันทึกข้อมูล
            </h3>
            
            <p style={{
              margin: "0 0 20px 0",
              fontSize: "14px",
              color: "#6B7280",
              lineHeight: "1.5"
            }}>
              กรุณารอสักครู่ ระบบกำลังบันทึกข้อมูล parcel...
            </p>
            
            {/* Progress bar */}
            <div style={{
              width: "100%",
              height: "6px",
              backgroundColor: "rgba(139, 92, 246, 0.1)",
              borderRadius: "3px",
              overflow: "hidden",
              marginBottom: "15px"
            }}>
              <div style={{
                width: "100%",
                height: "100%",
                background: "linear-gradient(90deg, #8B5CF6 0%, #7C3AED 50%, #8B5CF6 100%)",
                backgroundSize: "200% 100%",
                animation: "progressBar 2s ease-in-out infinite",
                borderRadius: "3px"
              }}></div>
            </div>
            
            {/* Status text */}
            <div style={{
              fontSize: "12px",
              color: "#9CA3AF",
              fontStyle: "italic"
            }}>
              Saving Parcel Data
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Loading overlay for Excel import from China */}
      {importLoading && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          backdropFilter: "blur(8px)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 9999,
          animation: "fadeIn 0.3s ease-in-out"
        }}>
          <div style={{
            background: "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%)",
            borderRadius: "20px",
            padding: "40px 50px",
            textAlign: "center",
            boxShadow: "0 25px 50px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.2)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            backdropFilter: "blur(20px)",
            maxWidth: "400px",
            width: "90%",
            animation: "slideInUp 0.4s ease-out"
          }}>
            {/* Animated spinner */}
            <div style={{
              width: "60px",
              height: "60px",
              margin: "0 auto 20px",
              position: "relative"
            }}>
              <div style={{
                width: "100%",
                height: "100%",
                border: "4px solid rgba(0, 123, 255, 0.1)",
                borderTop: "4px solid #007bff",
                borderRadius: "50%",
                animation: "spin 1s linear infinite"
              }}></div>
              <div style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                fontSize: "24px",
                animation: "pulse 2s ease-in-out infinite"
              }}>
                📦
              </div>
            </div>
            
            {/* Loading text */}
            <h3 style={{
              margin: "0 0 10px 0",
              fontSize: "20px",
              fontWeight: "700",
              color: "#1F2937",
              fontFamily: "'Inter', sans-serif"
            }}>
              กำลังนำเข้าข้อมูล
            </h3>
            
            <p style={{
              margin: "0 0 20px 0",
              fontSize: "14px",
              color: "#6B7280",
              lineHeight: "1.5"
            }}>
              กรุณารอสักครู่ ระบบกำลังประมวลผลข้อมูล Excel...
            </p>
            
            {/* Progress bar */}
            <div style={{
              width: "100%",
              height: "6px",
              backgroundColor: "rgba(0, 123, 255, 0.1)",
              borderRadius: "3px",
              overflow: "hidden",
              marginBottom: "15px"
            }}>
              <div style={{
                width: "100%",
                height: "100%",
                background: "linear-gradient(90deg, #007bff 0%, #0056b3 50%, #007bff 100%)",
                backgroundSize: "200% 100%",
                animation: "progressBar 2s ease-in-out infinite",
                borderRadius: "3px"
              }}></div>
            </div>
            
            {/* Status text */}
            <div style={{
              fontSize: "12px",
              color: "#6B7280",
              fontStyle: "italic"
            }}>
              Import to Parcels Save
            </div>
          </div>
        </div>
      )}

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
          background: "radial-gradient(circle, rgba(251, 146, 60, 0.18) 0%, transparent 70%)",
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
      <main style={{ 
        flex: 1, 
        overflow: "auto", 
        padding: "25px",
        background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
        minHeight: "100vh",
      }}>
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "25px",
            padding: "25px",
            background: "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.85) 100%)",
            borderRadius: "20px",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            boxShadow: "0 15px 35px rgba(0, 0, 0, 0.06), 0 5px 15px rgba(0, 0, 0, 0.04)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Decorative background elements */}
          <div style={{
            position: "absolute",
            top: "-50%",
            right: "-20%",
            width: "150px",
            height: "150px",
            background: "radial-gradient(circle, rgba(251, 146, 60, 0.1) 0%, rgba(249, 115, 22, 0.06) 100%)",
            borderRadius: "50%",
            filter: "blur(30px)",
          }} />
          <div style={{
            position: "absolute",
            bottom: "-30%",
            left: "-15%",
            width: "100px",
            height: "100px",
            background: "radial-gradient(circle, rgba(251, 146, 60, 0.08) 0%, rgba(249, 115, 22, 0.04) 100%)",
            borderRadius: "50%",
            filter: "blur(25px)",
          }} />
          <div style={{ display: "flex", alignItems: "center" }}>
            {isMobile && (
              <button
                onClick={toggleSidebar}
                style={{
                  background: "linear-gradient(135deg, #8B5CF6, #A78BFA)",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  marginRight: "15px",
                  padding: "12px",
                  borderRadius: "12px",
                  color: "white",
                  boxShadow: "0 8px 25px rgba(251, 146, 60, 0.3)",
                  transition: "all 0.3s ease",
                }}
                onMouseOver={(e) => (e.target.style.transform = "scale(1.1)")}
                onMouseOut={(e) => (e.target.style.transform = "scale(1)")}
              >
                ☰
              </button>
            )}
            <div style={{ position: "relative", zIndex: 2 }}>
            <h1 style={{ 
                fontSize: "30px", 
              margin: "0", 
              fontWeight: "800",
                background: "linear-gradient(135deg, #1e293b 0%, #475569 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
                textShadow: "0 1px 5px rgba(0, 0, 0, 0.08)",
                letterSpacing: "-0.3px",
            }}>
              🚚 ການກະຈາຍພັດດຸ
            </h1>
              <p style={{
                margin: "6px 0 0 0",
                fontSize: "14px",
                color: "#64748b",
                fontWeight: "500",
                opacity: "0.7",
              }}>
                Distribution Management System
              </p>
            </div>
          </div>
          {!isMobile && (
            <div style={{ display: "flex", alignItems: "center", gap: "25px", position: "relative", zIndex: 2 }}>
              <div style={{
                padding: "14px 20px",
                background: "linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(248, 250, 252, 0.75) 100%)",
                borderRadius: "14px",
                border: "1px solid rgba(251, 146, 60, 0.18)",
                backdropFilter: "blur(8px)",
                boxShadow: "0 6px 20px rgba(251, 146, 60, 0.18)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "6px 10px",
                    background: "linear-gradient(135deg, rgba(251, 146, 60, 0.18) 0%, rgba(249, 115, 22, 0.1) 100%)",
                    borderRadius: "8px",
                    border: "1px solid rgba(251, 146, 60, 0.25)",
                  }}>
                    <span style={{ fontSize: "16px" }}>📅</span>
                    <span style={{ fontWeight: "600", color: "#FB923C", fontSize: "13px" }}>
                {new Date().toLocaleDateString("th-TH")}
              </span>
                  </div>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "6px 10px",
                    background: "linear-gradient(135deg, rgba(251, 146, 60, 0.18) 0%, rgba(249, 115, 22, 0.15) 100%)",
                    borderRadius: "8px",
                    border: "1px solid rgba(251, 136, 60, 0.2)",
                  }}>
                    <span style={{ fontSize: "16px" }}>🕐</span>
                    <span style={{ fontWeight: "600", color: "#FB923C", fontSize: "13px" }}>
                {new Date().toLocaleTimeString("th-TH", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
                  </div>
                </div>
                <div style={{
                  marginTop: "10px",
                  padding: "8px 14px",
                  background: "linear-gradient(135deg, rgba(251, 146, 60, 0.18) 0%, rgba(249, 115, 22, 0.15) 100%)",
                  borderRadius: "10px",
                  border: "1px solid rgba(251, 146, 60, 0.2)",
                  textAlign: "center",
                }}>
                  <span style={{ fontWeight: "600", color: "#FB923C", fontSize: "14px" }}>
                {username} | {role}
              </span>
                </div>
              </div>
              <Link
                to="/"
                style={{
                  padding: "12px 24px",
                  background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  textDecoration: "none",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "14px",
                  transition: "all 0.3s ease",
                  boxShadow: "0 6px 20px rgba(59, 130, 246, 0.25)",
                  position: "relative",
                  overflow: "hidden",
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 10px 25px rgba(59, 130, 246, 0.3)";
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 6px 20px rgba(59, 130, 246, 0.25)";
                }}
              >
                <span style={{ position: "relative", zIndex: 2 }}>🏠 ໜ້າເເຣກ</span>
                <div style={{
                  position: "absolute",
                  top: "0",
                  left: "-100%",
                  width: "100%",
                  height: "100%",
                  background: "linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, transparent 100%)",
                  transition: "left 0.3s ease",
                }} />
              </Link>
            </div>
          )}
        </header>

        <div style={{ overflowX: "auto" }}>
          {/* Excel Import Section for China */}
          {storedBranch !== "LAO Warehouse" && storedRole !== "branch" ? (
            <div style={{ marginBottom: "30px" }}>
              <div
                style={{
                  borderRadius: "24px",
                  overflow: "hidden",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.08), 0 10px 25px rgba(0,0,0,0.06)",
                  background: "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  position: "relative",
                }}
              >
                {/* Decorative background pattern */}
                <div style={{
                  position: "absolute",
                  top: "0",
                  right: "0",
                  width: "150px",
                  height: "150px",
                  background: "radial-gradient(circle, rgba(34, 197, 94, 0.02) 0%, transparent 70%)",
                  zIndex: 1,
                }} />
                
                <div style={{
                  background: "linear-gradient(135deg, #22C55E 0%, #16A34A 100%)",
                  padding: "25px 30px",
                  borderRadius: "24px 24px 0 0",
                  boxShadow: "0 8px 25px rgba(34, 197, 94, 0.2)",
                  position: "relative",
                  zIndex: 2,
                }}>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}>
                    <div style={{
                      width: "40px",
                      height: "40px",
                      background: "rgba(255, 255, 255, 0.2)",
                      borderRadius: "10px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backdropFilter: "blur(8px)",
                    }}>
                      <span style={{ fontSize: "20px" }}>📊</span>
                    </div>
                    <div>
                      <h2 style={{ 
                        margin: 0, 
                        color: "white", 
                        fontSize: "24px",
                        fontWeight: "700",
                        textShadow: "0 1px 5px rgba(0, 0, 0, 0.15)",
                        letterSpacing: "-0.3px",
                      }}>
                        Import Excel ຈາກຈີນ
                      </h2>
                      <p style={{
                        margin: "4px 0 0 0",
                        color: "rgba(255, 255, 255, 0.85)",
                        fontSize: "14px",
                        fontWeight: "500",
                      }}>
                        Import parcel data from Excel file
                      </p>
                    </div>
                  </div>
                </div>
                
                <div style={{
                  padding: "30px",
                  background: "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.85) 100%)",
                  position: "relative",
                  zIndex: 2,
                }}>
                  <div style={{
                    display: "grid",
                    gap: "20px",
                    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                  }}>
                    {/* File Upload Section */}
                    <div style={{
                      padding: "25px",
                      background: "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.8) 100%)",
                      borderRadius: "20px",
                      border: "1px solid rgba(34, 197, 94, 0.12)",
                      transition: "all 0.3s ease",
                      boxShadow: "0 8px 25px rgba(34, 197, 94, 0.08)",
                      position: "relative",
                      overflow: "hidden",
                    }}>
                      {/* Decorative accent */}
                      <div style={{
                        position: "absolute",
                        top: "0",
                        left: "0",
                        width: "4px",
                        height: "100%",
                        background: "linear-gradient(135deg, #22C55E 0%, #16A34A 100%)",
                        borderRadius: "0 2px 2px 0",
                      }} />
                      
                      <label style={{
                        marginBottom: "15px",
                        fontWeight: "700",
                        color: "#16A34A",
                        fontSize: "17px",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}>
                        <span style={{
                          width: "32px",
                          height: "32px",
                          background: "linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(22, 163, 74, 0.12) 100%)",
                          borderRadius: "8px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "18px",
                        }}>📁</span>
                        ເລືອກຟາຍລ໌ Excel
                      </label>
                      
                      <input
                        id="excel-file-input"
                        type="file"
                        accept=".xlsx,.xls,.xlxs"
                        onChange={handleFileChange}
                        style={{
                          width: "100%",
                          padding: "15px",
                          borderRadius: "12px",
                          border: "2px solid rgba(34, 197, 94, 0.2)",
                          backgroundColor: "#ffffff",
                          fontSize: "16px",
                          fontWeight: "500",
                          transition: "all 0.3s ease",
                          boxShadow: "0 4px 15px rgba(34, 197, 94, 0.1)",
                          cursor: "pointer",
                        }}
                        onFocus={(e) => {
                          e.target.style.border = "2px solid #22C55E";
                          e.target.style.boxShadow = "0 8px 25px rgba(34, 197, 94, 0.2)";
                        }}
                        onBlur={(e) => {
                          e.target.style.border = "2px solid rgba(34, 197, 94, 0.2)";
                          e.target.style.boxShadow = "0 4px 15px rgba(34, 197, 94, 0.1)";
                        }}
                      />
                      
                      {selectedFile && (
                        <div style={{
                          marginTop: "15px",
                          padding: "15px",
                          background: "linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(22, 163, 74, 0.05) 100%)",
                          borderRadius: "12px",
                          border: "1px solid rgba(34, 197, 94, 0.2)",
                        }}>
                          <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            color: "#16A34A",
                            fontWeight: "600",
                          }}>
                            <span style={{ fontSize: "18px" }}>✅</span>
                            <span>ຟາຍລ໌ທີ່ເລືອກ: {selectedFile.name}</span>
                          </div>
                          <div style={{
                            fontSize: "14px",
                            color: "#6B7280",
                            marginTop: "5px",
                          }}>
                            ຂະໜາດ: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Import Button Section */}
                    <div style={{
                      padding: "25px",
                      background: "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.8) 100%)",
                      borderRadius: "20px",
                      border: "1px solid rgba(34, 197, 94, 0.12)",
                      transition: "all 0.3s ease",
                      boxShadow: "0 8px 25px rgba(34, 197, 94, 0.08)",
                      position: "relative",
                      overflow: "hidden",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                    }}>
                      {/* Decorative accent */}
                      <div style={{
                        position: "absolute",
                        top: "0",
                        left: "0",
                        width: "4px",
                        height: "100%",
                        background: "linear-gradient(135deg, #22C55E 0%, #16A34A 100%)",
                        borderRadius: "0 2px 2px 0",
                      }} />
                      
                      <div style={{
                        textAlign: "center",
                        marginBottom: "20px",
                      }}>
                        <div style={{
                          fontSize: "48px",
                          marginBottom: "10px",
                        }}>📊</div>
                        <h3 style={{
                          margin: "0 0 8px 0",
                          color: "#16A34A",
                          fontSize: "18px",
                          fontWeight: "700",
                        }}>
                          Import ຂໍ້ມູນ
                        </h3>
                        <p style={{
                          margin: "0",
                          color: "#6B7280",
                          fontSize: "14px",
                        }}>
                          ກົດປຸ່ມເພື່ອ import ຂໍ້ມູນຈາກ Excel
                        </p>
                      </div>
                      
                      <button
                        onClick={handleImportExcel}
                        disabled={!selectedFile || importLoading}
                        style={{
                          padding: "15px 30px",
                          background: selectedFile && !importLoading 
                            ? "linear-gradient(135deg, #22C55E 0%, #16A34A 100%)" 
                            : "linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%)",
                          color: "white",
                          border: "none",
                          borderRadius: "16px",
                          fontSize: "16px",
                          fontWeight: "700",
                          cursor: selectedFile && !importLoading ? "pointer" : "not-allowed",
                          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                          boxShadow: selectedFile && !importLoading 
                            ? "0 10px 25px rgba(34, 197, 94, 0.25)" 
                            : "0 4px 15px rgba(156, 163, 175, 0.2)",
                          position: "relative",
                          overflow: "hidden",
                          minWidth: "150px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "8px",
                        }}
                        onMouseOver={(e) => {
                          if (selectedFile && !importLoading) {
                            e.target.style.transform = "translateY(-2px) scale(1.02)";
                            e.target.style.boxShadow = "0 12px 30px rgba(34, 197, 94, 0.3)";
                          }
                        }}
                        onMouseOut={(e) => {
                          if (selectedFile && !importLoading) {
                            e.target.style.transform = "translateY(0) scale(1)";
                            e.target.style.boxShadow = "0 10px 25px rgba(34, 197, 94, 0.25)";
                          }
                        }}
                      >
                        {importLoading && (
                          <div style={{
                            width: "16px",
                            height: "16px",
                            border: "2px solid rgba(255, 255, 255, 0.3)",
                            borderTop: "2px solid white",
                            borderRadius: "50%",
                            animation: "spin 1s linear infinite"
                          }}></div>
                        )}
                        <span>
                          {importLoading ? "กำลังนำเข้า..." : (
                            <>
                              <span style={{ fontSize: "20px", marginRight: "8px" }}>📊</span>
                              Import Excel
                            </>
                          )}
                        </span>
                        
                        {/* Animated background overlay */}
                        <div style={{
                          position: "absolute",
                          top: "0",
                          left: "-100%",
                          width: "100%",
                          height: "100%",
                          background: "linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, transparent 100%)",
                          transition: "left 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                        }} />
                      </button>
                    </div>
                  </div>
                  
                  {/* Instructions */}
                  <div style={{
                    marginTop: "25px",
                    padding: "20px",
                    background: "linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(37, 99, 235, 0.03) 100%)",
                    borderRadius: "16px",
                    border: "1px solid rgba(59, 130, 246, 0.1)",
                  }}>
                    <h4 style={{
                      margin: "0 0 15px 0",
                      color: "#3B82F6",
                      fontSize: "16px",
                      fontWeight: "700",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}>
                      <span style={{ fontSize: "18px" }}>ℹ️</span>
                      ຄຳແນະນຳການໃຊ້ງານ
                    </h4>
                    <ul style={{
                      margin: "0",
                      paddingLeft: "20px",
                      color: "#6B7280",
                      fontSize: "14px",
                      lineHeight: "1.6",
                    }}>
                      <li>ຟາຍລ໌ Excel ຕ້ອງມີຂໍ້ມູນຢູ່ໃນຄໍລຳ D (ລະຫັດພັດສະດຸ)</li>
                      <li>ຮູບແບບຟາຍລ໌ທີ່ຮອງຮັບ: .xlsx, .xls, .xlxs</li>
                      <li>ຂະໜາດຟາຍລ໌ສູງສຸດ: 10MB</li>
                      <li>ຂໍ້ມູນທີ່ import ຈະຖືກບັນທຶກເປັນສະຖານະ "origin"</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {storedBranch === "LAO Warehouse" ? (
            <>
              <Parcel onParcelChange={handleParcelChange} />

              <div style={{ marginTop: "25px" }}>
                <div
                  id="admin-lao"
                  style={{
                    borderRadius: "24px",
                    overflow: "hidden",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.08), 0 10px 25px rgba(0,0,0,0.06)",
                    background: "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                    position: "relative",
                  }}
                >
                  {/* Decorative background pattern */}
                  <div style={{
                    position: "absolute",
                    top: "0",
                    right: "0",
                    width: "150px",
                    height: "150px",
                    background: "radial-gradient(circle, rgba(251, 146, 60, 0.05) 0%, transparent 70%)",
                    zIndex: 1,
                  }} />
                  
                  <div style={{
                    ...gradientHeaderStyle("#8B5CF6", "#A78BFA"),
                    padding: "25px 30px",
                    borderRadius: "24px 24px 0 0",
                    background: "linear-gradient(135deg, #FB923C 0%, #F97316 50%, #EA580C 100%)",
                    boxShadow: "0 8px 25px rgba(251, 146, 60, 0.2)",
                    position: "relative",
                    zIndex: 2,
                  }}>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}>
                      <div style={{
                        width: "40px",
                        height: "40px",
                        background: "rgba(255, 255, 255, 0.2)",
                        borderRadius: "10px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backdropFilter: "blur(8px)",
                      }}>
                        <span style={{ fontSize: "20px" }}>📦</span>
                  </div>
                      <div>
                    <h2 style={{ 
                      margin: 0, 
                      color: "white", 
                          fontSize: "24px",
                      fontWeight: "700",
                          textShadow: "0 1px 5px rgba(0, 0, 0, 0.15)",
                          letterSpacing: "-0.3px",
                    }}>
                          ຂໍ້ມູນພັດດຸ
                    </h2>
                        <p style={{
                          margin: "4px 0 0 0",
                          color: "rgba(255, 255, 255, 0.85)",
                          fontSize: "14px",
                          fontWeight: "500",
                        }}>
                          Parcel Information Details
                        </p>
                      </div>
                    </div>
                  </div>
                  <div style={{
                    ...bodyStyle,
                    padding: "30px",
                    background: "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.85) 100%)",
                    position: "relative",
                    zIndex: 2,
                  }}>
                    <div
                      style={{
                        display: "grid",
                        gap: "20px",
                        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                      }}
                    >
                      <div style={{
                        padding: "20px",
                        background: "linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(248, 250, 252, 0.75) 100%)",
                        borderRadius: "16px",
                        border: "1px solid rgba(251, 146, 60, 0.1)",
                        transition: "all 0.3s ease",
                        boxShadow: "0 6px 20px rgba(251, 146, 60, 0.1)",
                        position: "relative",
                        overflow: "hidden",
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform = "translateY(-1px)";
                        e.currentTarget.style.boxShadow = "0 8px 25px rgba(251, 146, 60, 0.1)";
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 6px 20px rgba(251, 146, 60, 0.1)";
                      }}>
                        {/* Decorative accent */}
                        <div style={{
                          position: "absolute",
                          top: "0",
                          left: "0",
                          width: "3px",
                          height: "100%",
                          background: "linear-gradient(135deg, #FB923C 0%, #F97316 50%, #EA580C 100%)",
                          borderRadius: "0 1px 1px 0",
                        }} />
                        
                        <label style={{
                          ...labelStyle,
                          fontSize: "15px",
                          color: "#8B5CF6",
                          fontWeight: "700",
                          marginBottom: "12px",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}>
                          <span style={{
                            width: "28px",
                            height: "28px",
                            background: "linear-gradient(135deg, rgba(251, 146, 60, 0.18) 0%, rgba(249, 115, 22, 0.15) 100%)",
                            borderRadius: "6px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "16px",
                          }}>🎯</span>
                          ປະເພດ Parcel
                        </label>
                        <select
                          style={{
                            ...inputStyle,
                            background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                            border: "2px solid rgba(251, 146, 60, 0.25)",
                            borderRadius: "14px",
                            padding: "18px 20px",
                            fontSize: "16px",
                            fontWeight: "500",
                            transition: "all 0.3s ease",
                            boxShadow: "0 6px 20px rgba(251, 146, 60, 0.18)",
                            cursor: "pointer",
                          }}
                          onChange={handleInputChange}
                          value={detailsData.typeParcel}
                          name="typeParcel"
                          onFocus={(e) => {
                            e.target.style.border = "2px solid #8B5CF6";
                            e.target.style.boxShadow = "0 10px 30px rgba(251, 146, 60, 0.25)";
                            e.target.style.transform = "translateY(-1px)";
                          }}
                          onBlur={(e) => {
                            e.target.style.border = "2px solid rgba(251, 146, 60, 0.25)";
                            e.target.style.boxShadow = "0 6px 20px rgba(251, 146, 60, 0.18)";
                            e.target.style.transform = "translateY(0)";
                          }}
                        >
                          <option value="" disabled>
                            🚀 ເລືອກປະເພດ
                          </option>
                          <option value="O"> 📦 O </option>
                          <option value="A"> 📦 A </option>
                          <option value="2A"> 📦 2A</option>
                          <option value="B"> 📦 B</option>
                          <option value="C"> 📦 C</option>
                          <option value="D"> 📦 D</option>
                          <option value="E"> 📦 E</option>
                          <option value="F"> 📦 F</option>
                          <option value="G"> 📦 G</option>
                          <option value="H"> 📦 H</option>
                          <option value="I"> 📦 I</option>
                          <option value="Genaral"> 🏠 ເຄື່ອງໃຊ້ທົ່ວໄປ</option>
                          <option value="Electrical"> ⚡ ເຄື່ອງໃຊ້ໄຟຟ້າ</option>
                          <option value="Big-But-Light"> 🪶 ເຄື່ອງໃຫຍ່ນ້ຳໜັກເບົາ</option>
                          <option value="Lots-of-Weight"> ⚖️ ນ້ຳໜັກຫຼາຍ</option>
                        </select>
                      </div>

                      <div style={{
                        padding: "25px",
                        background: "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.8) 100%)",
                        borderRadius: "20px",
                        border: "1px solid rgba(59, 130, 246, 0.12)",
                        transition: "all 0.3s ease",
                        boxShadow: "0 8px 25px rgba(59, 130, 246, 0.08)",
                        position: "relative",
                        overflow: "hidden",
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = "0 12px 35px rgba(59, 130, 246, 0.12)";
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 8px 25px rgba(59, 130, 246, 0.08)";
                      }}>
                        {/* Decorative accent */}
                        <div style={{
                          position: "absolute",
                          top: "0",
                          left: "0",
                          width: "4px",
                          height: "100%",
                          background: "linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)",
                          borderRadius: "0 2px 2px 0",
                        }} />
                        
                        <label style={{
                          ...labelStyle,
                          fontSize: "17px",
                          color: "#3B82F6",
                          fontWeight: "800",
                          marginBottom: "15px",
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}>
                          <span style={{
                            width: "32px",
                            height: "32px",
                            background: "linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.12) 100%)",
                            borderRadius: "8px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "18px",
                          }}>📏</span>
                          ຂະໜາດ (cm)
                        </label>
                        <div style={{ display: "flex", gap: "15px" }}>
                          <input
                            name="width"
                            type="number"
                            onChange={handleInputChange}
                            value={detailsData.width}
                            placeholder="ກວ້າງ"
                            style={{
                              ...inputStyle,
                              flex: 1,
                              background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                              border: "2px solid rgba(59, 130, 246, 0.15)",
                              borderRadius: "14px",
                              padding: "18px 20px",
                              fontSize: "16px",
                              fontWeight: "500",
                              transition: "all 0.3s ease",
                              boxShadow: "0 6px 20px rgba(59, 130, 246, 0.08)",
                            }}
                            onFocus={(e) => {
                              e.target.style.border = "2px solid #3B82F6";
                              e.target.style.boxShadow = "0 8px 25px rgba(59, 130, 246, 0.2)";
                            }}
                            onBlur={(e) => {
                              e.target.style.border = "2px solid rgba(59, 130, 246, 0.2)";
                              e.target.style.boxShadow = "0 4px 15px rgba(59, 130, 246, 0.1)";
                            }}
                          />
                          <input
                            name="length"
                            type="number"
                            onChange={handleInputChange}
                            value={detailsData.length}
                            placeholder="ຍາວ"
                            style={{
                              ...inputStyle,
                              flex: 1,
                              background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                              border: "2px solid rgba(59, 130, 246, 0.2)",
                              borderRadius: "12px",
                              padding: "15px",
                              fontSize: "16px",
                              transition: "all 0.3s ease",
                              boxShadow: "0 4px 15px rgba(59, 130, 246, 0.1)",
                            }}
                            onFocus={(e) => {
                              e.target.style.border = "2px solid #3B82F6";
                              e.target.style.boxShadow = "0 8px 25px rgba(59, 130, 246, 0.2)";
                            }}
                            onBlur={(e) => {
                              e.target.style.border = "2px solid rgba(59, 130, 246, 0.2)";
                              e.target.style.boxShadow = "0 4px 15px rgba(59, 130, 246, 0.1)";
                            }}
                          />
                          <input
                            name="height"
                            type="number"
                            onChange={handleInputChange}
                            value={detailsData.height}
                            placeholder="ສູງ"
                            style={{
                              ...inputStyle,
                              flex: 1,
                              background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                              border: "2px solid rgba(59, 130, 246, 0.2)",
                              borderRadius: "12px",
                              padding: "15px",
                              fontSize: "16px",
                              transition: "all 0.3s ease",
                              boxShadow: "0 4px 15px rgba(59, 130, 246, 0.1)",
                            }}
                            onFocus={(e) => {
                              e.target.style.border = "2px solid #3B82F6";
                              e.target.style.boxShadow = "0 8px 25px rgba(59, 130, 246, 0.2)";
                            }}
                            onBlur={(e) => {
                              e.target.style.border = "2px solid rgba(59, 130, 246, 0.2)";
                              e.target.style.boxShadow = "0 4px 15px rgba(59, 130, 246, 0.1)";
                            }}
                          />
                        </div>
                      </div>

                      <div style={{
                        padding: "20px",
                        background: "linear-gradient(135deg, rgba(34, 197, 94, 0.05) 0%, rgba(22, 163, 74, 0.03) 100%)",
                        borderRadius: "16px",
                        border: "1px solid rgba(34, 197, 94, 0.1)",
                        transition: "all 0.3s ease",
                      }}>
                        <label style={{
                          ...labelStyle,
                          fontSize: "16px",
                          color: "#22C55E",
                          fontWeight: "700",
                          marginBottom: "12px",
                        }}>⚖️ ນ້ຳໜັກ(kg) :</label>
                        <input
                          name="weight"
                          type="number"
                          onChange={handleInputChange}
                          value={detailsData.weight}
                          placeholder="ນ້ຳໜັກ"
                          style={{
                            ...inputStyle,
                            background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                            border: "2px solid rgba(34, 197, 94, 0.2)",
                            borderRadius: "12px",
                            padding: "15px",
                            fontSize: "16px",
                            transition: "all 0.3s ease",
                            boxShadow: "0 4px 15px rgba(34, 197, 94, 0.1)",
                          }}
                          onFocus={(e) => {
                            e.target.style.border = "2px solid #22C55E";
                            e.target.style.boxShadow = "0 8px 25px rgba(34, 197, 94, 0.2)";
                          }}
                          onBlur={(e) => {
                            e.target.style.border = "2px solid rgba(34, 197, 94, 0.2)";
                            e.target.style.boxShadow = "0 4px 15px rgba(34, 197, 94, 0.1)";
                          }}
                        />
                      </div>

                      <div style={{
                        padding: "20px",
                        background: "linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(217, 119, 6, 0.03) 100%)",
                        borderRadius: "16px",
                        border: "1px solid rgba(245, 158, 11, 0.1)",
                        transition: "all 0.3s ease",
                      }}>
                        <label style={{
                          ...labelStyle,
                          fontSize: "16px",
                          color: "#F59E0B",
                          fontWeight: "700",
                          marginBottom: "12px",
                        }}>🔢 ຈຳນວນ :</label>
                        <input
                          name="amount"
                          type="number"
                          onChange={handleInputChange}
                          value={detailsData.amount}
                          placeholder="ຈຳນວນ(ຊິ້ນ)"
                          style={{
                            ...inputStyle,
                            background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                            border: "2px solid rgba(245, 158, 11, 0.2)",
                            borderRadius: "12px",
                            padding: "15px",
                            fontSize: "16px",
                            transition: "all 0.3s ease",
                            boxShadow: "0 4px 15px rgba(245, 158, 11, 0.1)",
                          }}
                          onFocus={(e) => {
                            e.target.style.border = "2px solid #F59E0B";
                            e.target.style.boxShadow = "0 8px 25px rgba(245, 158, 11, 0.2)";
                          }}
                          onBlur={(e) => {
                            e.target.style.border = "2px solid rgba(245, 158, 11, 0.2)";
                            e.target.style.boxShadow = "0 4px 15px rgba(245, 158, 11, 0.1)";
                          }}
                        />
                      </div>

                      <div style={{
                        padding: "20px",
                        background: "linear-gradient(135deg, rgba(236, 72, 153, 0.05) 0%, rgba(219, 39, 119, 0.03) 100%)",
                        borderRadius: "16px",
                        border: "1px solid rgba(236, 72, 153, 0.1)",
                        transition: "all 0.3s ease",
                      }}>
                        <label style={{
                          ...labelStyle,
                          fontSize: "16px",
                          color: "#EC4899",
                          fontWeight: "700",
                          marginBottom: "12px",
                        }}>💰 ລາຄາ :</label>
                        <input
                          name="price"
                          type="text"
                          onChange={handlePriceChange}
                          onBlur={formatPrice}
                          value={detailsData.price}
                          placeholder="ລາຄາ"
                          style={{
                            ...inputStyle,
                            background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                            border: "2px solid rgba(236, 72, 153, 0.2)",
                            borderRadius: "12px",
                            padding: "15px",
                            fontSize: "16px",
                            transition: "all 0.3s ease",
                            boxShadow: "0 4px 15px rgba(236, 72, 153, 0.1)",
                          }}
                          onFocus={(e) => {
                            e.target.style.border = "2px solid #EC4899";
                            e.target.style.boxShadow = "0 8px 25px rgba(236, 72, 153, 0.2)";
                          }}
                        />
              </div>

                      <div style={{
                        padding: "20px",
                        background: "linear-gradient(135deg, rgba(168, 85, 247, 0.05) 0%, rgba(147, 51, 234, 0.03) 100%)",
                        borderRadius: "16px",
                        border: "1px solid rgba(168, 85, 247, 0.1)",
                        transition: "all 0.3s ease",
                      }}>
                        <label style={{
                          ...labelStyle,
                          fontSize: "16px",
                          color: "#A855F7",
                          fontWeight: "700",
                          marginBottom: "12px",
                        }}>🎁 ສ່ວນລດ :</label>
                        <select
                          style={detailsData.price ? {
                            ...selectStyle,
                            background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                            border: "2px solid #A855F7",
                            borderRadius: "12px",
                            padding: "15px",
                            fontSize: "16px",
                            boxShadow: "0 8px 25px rgba(168, 85, 247, 0.2)",
                          } : {
                            ...selectDisabledStyle,
                            background: "linear-gradienหt(135deg, #f1f5f9 0%, #e2e8f0 100%)",
                            border: "2px solid rgba(168, 85, 247, 0.1)",
                            borderRadius: "12px",
                            padding: "15px",
                            fontSize: "16px",
                          }}
                          onChange={handleDiscountChange}
                          value={detailsData.discount}
                          name="discount"
                          disabled={!detailsData.price}
                        >
                          <option value="0">🎯 ບໍ່ມີສ່ວນລດ</option>
                          <option value="5">🎁 ສ່ວນລດ 5%</option>
                          <option value="10">🎁 ສ່ວນລດ 10%</option>
                          <option value="15">🎁 ສ່ວນລດ 15%</option>
                          <option value="20">🎁 ສ່ວນລດ 20%</option>
                          <option value="25">🎁 ສ່ວນລດ 25%</option>
                          <option value="30">🎁 ສ່ວນລດ 30%</option>
                          <option value="35">🎁 ສ່ວນລດ 35%</option>
                          <option value="40">🎁 ສ່ວນລດ 40%</option>
                          <option value="45">🎁 ສ່ວນລດ 45%</option>
                          <option value="50">🎁 ສ່ວນລດ 50%</option>
                          <option value="55">🎁 ສ່ວນລດ 55%</option>
                          <option value="60">🎁 ສ່ວນລດ 60%</option>
                          <option value="65">🎁 ສ່ວນລດ 65%</option>
                          <option value="70">🎁 ສ່ວນລດ 70%</option>
                          <option value="75">🎁 ສ່ວນລດ 75%</option>
                          <option value="80">🎁 ສ່ວນລດ 80%</option>
                          <option value="85">🎁 ສ່ວນລດ 85%</option>
                          <option value="90">🎁 ສ່ວນລດ 90%</option>
                          <option value="95">🎁 ສ່ວນລດ 95%</option>
                        </select>
                  </div>
                      
                      {/* แสดงราคาหลังหักส่วนลด */}
                      {detailsData.price && detailsData.discount !== "0" && (
                        <div style={{
                          gridColumn: "1 / -1",
                          padding: "25px",
                          background: "linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(22, 163, 74, 0.05) 100%)",
                          borderRadius: "20px",
                          border: "2px solid rgba(34, 197, 94, 0.2)",
                          marginTop: "20px",
                          boxShadow: "0 15px 35px rgba(34, 197, 94, 0.1)",
                        }}>
                          <h3 style={{
                            fontSize: "20px",
                            fontWeight: "700",
                            color: "#16A34A",
                            marginBottom: "20px",
                            textAlign: "center",
                          }}>
                            💰 ສรุปລາຄາສ່ວນລດ
                          </h3>
                          <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                            gap: "20px",
                          }}>
                            <div style={{
                        padding: "20px",
                              background: "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.8) 100%)",
                              borderRadius: "16px",
                              border: "1px solid rgba(34, 197, 94, 0.2)",
                        textAlign: "center",
                            }}>
                              <div style={{ fontSize: "14px", color: "#6B7280", marginBottom: "8px" }}>ລາຄາເດີມ</div>
                              <div style={{ fontSize: "24px", fontWeight: "800", color: "#1F2937" }}>
                                {Number(detailsData.price.replace(/,/g, "")).toLocaleString("en-US")} ກີບ
                      </div>
                      </div>
                            
                            <div style={{
                              padding: "20px",
                              background: "linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%)",
                              borderRadius: "16px",
                              border: "1px solid rgba(239, 68, 68, 0.2)",
                              textAlign: "center",
                            }}>
                              <div style={{ fontSize: "14px", color: "#6B7280", marginBottom: "8px" }}>ສ່ວນລດ</div>
                              <div style={{ fontSize: "24px", fontWeight: "800", color: "#DC2626" }}>
                                -{detailsData.discount}%
                              </div>
                              <div style={{ fontSize: "16px", color: "#DC2626", fontWeight: "600" }}>
                                ({(Number(detailsData.price.replace(/,/g, "")) * Number(detailsData.discount) / 100).toLocaleString("en-US")} ກີບ)
                      </div>
                    </div>

                      <div style={{ 
                              padding: "20px",
                              background: "linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(22, 163, 74, 0.1) 100%)",
                              borderRadius: "16px",
                              border: "2px solid #22C55E",
                              textAlign: "center",
                              boxShadow: "0 8px 25px rgba(34, 197, 94, 0.2)",
                            }}>
                              <div style={{ fontSize: "14px", color: "#16A34A", marginBottom: "8px", fontWeight: "600" }}>ລາຄາສຸດທ້າຍ</div>
                              <div style={{ fontSize: "28px", fontWeight: "900", color: "#16A34A" }}>
                                {getDisplayPrice()} ກີບ
                        </div>
                            </div>
                        </div>
                      </div>
                    )}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "35px",
                position: "relative",
              }}>
                {/* Decorative background elements */}
                <div style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "200px",
                  height: "200px",
                  background: "radial-gradient(circle, rgba(251, 146, 60, 0.06) 0%, transparent 70%)",
                  filter: "blur(30px)",
                  zIndex: 1,
                }} />
                
                      <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading}
                        style={{
                          padding: "18px 40px",
                          background: loading 
                            ? "linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%)" 
                            : "linear-gradient(135deg, #FB923C 0%, #F97316 50%, #EA580C 100%)",
                          color: "white",
                          border: "none",
                          borderRadius: "20px",
                          fontSize: "18px",
                          fontWeight: "700",
                          cursor: loading ? "not-allowed" : "pointer",
                          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                          boxShadow: loading 
                            ? "0 4px 15px rgba(156, 163, 175, 0.2)" 
                            : "0 15px 30px rgba(251, 146, 60, 0.35), 0 6px 20px rgba(251, 146, 60, 0.25)",
                          textShadow: "0 1px 5px rgba(0, 0, 0, 0.1)",
                          position: "relative",
                          zIndex: 2,
                          overflow: "hidden",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "12px",
                        }}
                        onMouseOver={(e) => {
                          if (!loading) {
                            e.target.style.transform = "translateY(-2px) scale(1.02)";
                            e.target.style.boxShadow = "0 18px 35px rgba(251, 146, 60, 0.3), 0 8px 25px rgba(251, 146, 60, 0.2)";
                          }
                        }}
                        onMouseOut={(e) => {
                          if (!loading) {
                            e.target.style.transform = "translateY(0) scale(1)";
                            e.target.style.boxShadow = "0 15px 30px rgba(251, 146, 60, 0.35), 0 6px 20px rgba(251, 146, 60, 0.25)";
                          }
                        }}
                      >
                        {loading && (
                          <div style={{
                            width: "20px",
                            height: "20px",
                            border: "2px solid rgba(255, 255, 255, 0.3)",
                            borderTop: "2px solid white",
                            borderRadius: "50%",
                            animation: "spin 1s linear infinite"
                          }}></div>
                        )}
                        <span>
                          {loading ? "กำลังบันทึก..." : (
                            <>
                              <span style={{ fontSize: "24px" }}>💾</span>
                              ບັນທຶກຂໍ້ມູນ
                            </>
                          )}
                        </span>
                        
                        {/* Animated background overlay */}
                        <div style={{
                          position: "absolute",
                          top: "0",
                          left: "-100%",
                          width: "100%",
                          height: "100%",
                          background: "linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, transparent 100%)",
                          transition: "left 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                        }} />
                      </button>
              </div>
              
              <hr style={{
                margin: "50px 0",
                border: "none",
                height: "2px",
                background: "linear-gradient(90deg, transparent 0%, rgba(251, 146, 60, 0.3) 50%, transparent 100%)",
              }} />
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
  background: `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`,
  padding: "18px 22px",
  borderRadius: "20px 20px 0 0",
  color: "white",
  position: "relative",
  overflow: "hidden",
});

const bodyStyle = {
  backgroundColor: "transparent",
  padding: "22px",
  position: "relative",
};

const labelStyle = {
  display: "block",
  marginBottom: "6px",
  fontWeight: "600",
  color: "#374151",
  fontSize: "14px",
  letterSpacing: "-0.02em",
};

const inputStyle = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: "10px",
  border: "2px solid #e5e7eb",
  boxSizing: "border-box",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  fontSize: "14px",
  fontWeight: "500",
  color: "#374151",
  backgroundColor: "#ffffff",
  boxShadow: "0 1px 6px rgba(0, 0, 0, 0.03)",
};

const selectStyle = {
  ...inputStyle,
  cursor: "pointer",
  backgroundColor: "#ffffff",
  border: "2px solid #8B5CF6",
  color: "#374151",
  fontWeight: "500",
  boxShadow: "0 4px 15px rgba(251, 146, 60, 0.1)",
};

const selectDisabledStyle = {
  ...inputStyle,
  cursor: "not-allowed",
  backgroundColor: "#f9fafb",
  border: "2px solid #d1d5db",
  color: "#9ca3af",
  opacity: 0.7,
  boxShadow: "none",
};

export default DistributionDashboard;
