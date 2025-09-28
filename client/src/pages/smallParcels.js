import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const SmallParcels = () => {
  const navigate = useNavigate();
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [showBarcodeInput, setShowBarcodeInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [barcodeList, setBarcodeList] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Sidebar states
  const [activePage, setActivePage] = useState("smallParcels");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const storedRole = localStorage.getItem("role");

  useEffect(() => {
    // ตรวจสอบสิทธิ์การเข้าถึง
    const userRole = localStorage.getItem('role');
    if (userRole !== 'admin') {
      navigate('/');
      return;
    }

    // โหลดรายการสาขา
    fetchBranches();
  }, [navigate]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 870);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchBranches = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:1000/api/listBranch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setBranches(data);
      } else {
        console.error('Failed to fetch branches');
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBranchSelect = (branchUsername) => {
    setSelectedBranch(branchUsername);
    setShowBarcodeInput(true);
  };

  // แก้ไขปัญหาการวางค่าใน input
  const handleBarcodeInput = (e) => {
    console.log('Input value:', e.target.value);
    setBarcodeInput(e.target.value);
  };

  const handleBarcodePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    console.log('Pasted data:', pastedData);
    setBarcodeInput(pastedData);
  };

  const handleBarcodeKeyPress = (e) => {
    console.log('Key pressed:', e.key);
    if (e.key === 'Enter' && barcodeInput.trim()) {
      checkBarcodeAndAdd();
    }
  };

  const checkBarcodeAndAdd = async () => {
    if (!barcodeInput.trim()) return;
    
    const barcodeValue = barcodeInput.trim();
    setIsLoading(true);
    
    try {
      // ตรวจสอบบาร์โค้ดกับ API
      const response = await fetch(`http://localhost:1000/api/smallParcels`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          parcels_id: barcodeValue
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        console.log('API Response:', data); // Debug log
        
        // ถ้ามี response ที่ไม่ error หรือมี "from" ก็ถือว่า success
        if (data && (data.from || !data.error)) {
          // สร้างข้อมูลบาร์โค้ดใหม่
          const newBarcode = {
            id: Date.now(),
            barcode: barcodeValue,
            timestamp: new Date().toLocaleString('lo-LA'),
            status: 'available',
            productInfo: data.data || data || { 
              name: 'ບາໂຄດຖືກຕ້ອງ', 
              description: data.from ? `ມາຈາກ: ${data.from}` : 'ພົບໃນຄລັງແລ້ວ' 
            }
          };
          
          setBarcodeList(prev => [...prev, newBarcode]);
          setBarcodeInput('');
          
          // ไม่แสดง alert แต่ยังคง console.log เพื่อ debug
          console.log(`✅ ບາໂຄດ ${barcodeValue} ພົບໃນຄລັງແລ້ວ`);
          if (data.from) {
            console.log(`ມາຈາກ: ${data.from}`);
          }
                 } else {
           // มี error หรือไม่สามารถเพิ่มได้
           const errorMsg = data.error || data.message || 'ບໍ່ສາມາດເພີ່ມບາໂຄດໄດ້';
           showErrorAlert(`❌ ບາໂຄດ ${barcodeValue}: ${errorMsg}`);
         }
       } else {
         showErrorAlert(`⚠️ ບໍ່ສາມາດກວດສອບບາໂຄດໄດ້`);
       }
     } catch (error) {
       console.error('Error checking barcode:', error);
       showErrorAlert(`⚠️ ບໍ່ສາມາດເຊື່ອມຕໍ່ໄດ້`);
    } finally {
      setIsLoading(false);
    }
  };

  const removeBarcode = (id) => {
    setBarcodeList(prev => prev.filter(item => item.id !== id));
  };

  const handleCreateShipment = async () => {
    if (!selectedBranch || barcodeList.length === 0) {
      showErrorAlert('ກະລຸນາເລືອກສະຫະກອນ ແລະ ເພີ່ມບາໂຄດຢ່າງໜ້ອຍ 1 ລາຍການ');
      return;
    }

    const availableBarcodes = barcodeList.filter(item => item.status === 'available');
    
    if (availableBarcodes.length === 0) {
      showErrorAlert('❌ ບໍ່ມີບາໂຄດທີ່ພົບໃນຄລັງ');
      return;
    }

    try {
      setIsLoading(true);
      
      // ส่งข้อมูลไปยัง API
      const response = await fetch('http://localhost:1000/api/smallParcelsSave', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          parcels_id: availableBarcodes.map(item => ({ id: item.barcode })),
          branch: selectedBranch
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ สร้างการส่งพัสดุรวมสำเร็จ:', data);

    // รีเซ็ตฟอร์ม
    setSelectedBranch('');
        setBarcodeList([]);
    setShowBarcodeInput(false);
    
        // แสดงข้อความสำเร็จ
        showSuccessMessage(`✅ ສ້າງການສົ່ງພັດສະດຸລວມສຳເລັດ!\nຈຳນວນບາໂຄດ: ${availableBarcodes.length} ລາຍການ\nສະຫະກອນ: ${branches.find(b => b.username === selectedBranch)?.info || selectedBranch}`);
      } else {
        const errorData = await response.json();
        showErrorAlert(`❌ ບໍ່ສາມາດສ້າງການສົ່ງພັດສະດຸລວມ: ${errorData.message || 'ຂໍ້ຜິດພາດທີ່ບໍ່ຮູ້ຈັກ'}`);
      }
    } catch (error) {
      console.error('❌ Error creating shipment:', error);
      showErrorAlert('⚠️ ບໍ່ສາມາດເຊື່ອມຕໍ່ໄດ້\nກະລຸນາກວດສອບການເຊື່ອມຕໍ່');
    } finally {
      setIsLoading(false);
    }
  };

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

  const showErrorAlert = (message) => {
    setErrorMessage(message);
    setIsSuccess(false);
    setShowError(true);
    // ซ่อน error หลังจาก 5 วินาที
    setTimeout(() => {
      setShowError(false);
      setErrorMessage('');
    }, 5000);
  };

  const showSuccessMessage = (message) => {
    setErrorMessage(message);
    setIsSuccess(true);
    setShowError(true);
    // ซ่อนข้อความสำเร็จหลังจาก 5 วินาที
    setTimeout(() => {
      setShowError(false);
      setErrorMessage('');
    }, 5000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 text-base">ກຳລັງໂຫຼດຂໍ້ມູນ...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "Arial, sans-serif" }}>
      {/* Sidebar */}
      <aside style={{
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
      }}>
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
        
        <div style={{
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
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
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
            <button onClick={toggleSidebar} style={{
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
            }}>
              ✕
            </button>
          )}
        </div>
        
        <nav style={{ flex: 1, position: "relative", zIndex: 2 }}>
          <Link to="/homeAdmin/main" style={sidebarLinkStyle("inventorystatistics")}>
            <span style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "16px", fontWeight: "600" }}>
              <span style={{ fontSize: "20px" }}>📊</span>
              ໜ້າທຳອິດ
            </span>
          </Link>
          <Link to="/homeAdmin/list" style={sidebarLinkStyle("inventory")}>
            <span style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "16px", fontWeight: "600" }}>
              <span style={{ fontSize: "20px" }}>📦</span>
              ລາຍການພັດດຸ
            </span>
          </Link>
          <Link to="/homeAdmin/distribution" style={sidebarLinkStyle("distribution")}>
            <span style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "16px", fontWeight: "600" }}>
              <span style={{ fontSize: "20px" }}>🚚</span>
              ກະຈາຍພັດດຸ
            </span>
          </Link>
          <Link to="/homeAdmin/tableparcels" style={sidebarLinkStyle("tableparcels")}>
            <span style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "16px", fontWeight: "600" }}>
              <span style={{ fontSize: "20px" }}>📋</span>
              ຕາຕະລາງພັດດຸ
            </span>
          </Link>
          {storedRole === "admin" && (
            <Link to="/homeAdmin/smallParcels" style={sidebarLinkStyle("smallParcels")}>
              <span style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "16px", fontWeight: "600" }}>
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
        
        <button onClick={handleLogout} style={{
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
        }}>
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
      <main style={{
        flex: 1,
        overflow: "auto",
        padding: "20px",
        background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
      }}>
        <header style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          padding: "20px",
          background: "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.8) 100%)",
          borderRadius: "20px",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
        }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            {isMobile && (
              <button onClick={toggleSidebar} style={{
                background: "linear-gradient(135deg, #8B5CF6, #A78BFA)",
                border: "none",
                fontSize: "24px",
                cursor: "pointer",
                marginRight: "15px",
                padding: "12px",
                borderRadius: "12px",
                color: "white",
                boxShadow: "0 8px 25px rgba(139, 92, 246, 0.3)",
                transition: "all 0.3s ease",
              }}>
                ☰
              </button>
            )}
            <h1 style={{ 
              fontSize: "32px", 
              margin: "0", 
              fontWeight: "800",
              background: "linear-gradient(135deg, #1e293b, #475569)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              📦 ສ້າງການສົ່ງພັດສະດຸລວມ
            </h1>
          </div>
        </header>

                <div className="max-w-6xl mx-auto px-4">
          {/* Error/Success Alert */}
          {showError && (
            <div className={`mb-6 border rounded-2xl p-4 shadow-lg animate-fade-in ${
              isSuccess 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isSuccess ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {isSuccess ? (
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <p className={`font-semibold text-sm ${
                    isSuccess ? 'text-green-800' : 'text-red-800'
                  }`}>{errorMessage}</p>
                </div>
                <button
                  onClick={() => setShowError(false)}
                  className={`transition-colors duration-200 p-2 rounded-lg ${
                    isSuccess 
                      ? 'text-green-400 hover:text-green-600 hover:bg-green-100' 
                      : 'text-red-400 hover:text-red-600 hover:bg-red-100'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
                  </div>
          )}
          
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 p-8 relative overflow-hidden">
            
          {/* Step 1: เลือกสาขา */}
            <div className="mb-8 relative z-10">
              <h2 className="text-2xl font-extrabold text-slate-800 mb-4 flex items-center">
                <span className="bg-gradient-to-br from-blue-500 to-blue-700 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-black mr-3 shadow-lg shadow-blue-500/30">
                  1
                </span>
                ເລືອກສະຫະກອນ
              </h2>
              
              <div className="space-y-4">
                <div className="relative">
                  <label htmlFor="branch-select" className="block text-sm font-semibold text-slate-700 mb-2">
                    ເລືອກສະຫະກອນທີ່ຕ້ອງການ:
                  </label>
                  <select
                    id="branch-select"
                    value={selectedBranch}
                    onChange={(e) => handleBranchSelect(e.target.value)}
                    className="w-full px-6 py-4 text-lg font-medium bg-gradient-to-r from-white to-slate-50 border-2 border-blue-200 rounded-2xl shadow-lg shadow-blue-500/8 transition-all duration-300 focus:border-blue-500 focus:shadow-xl focus:shadow-blue-500/20 focus:-translate-y-1 outline-none appearance-none cursor-pointer"
                  >
                    <option value="">-- ເລືອກສະຫະກອນ --</option>
                    {branches.map((branch, index) => (
                      <option key={index} value={branch.username}>
                        {branch.info || branch.username}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedBranch && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-white text-xl">🏢</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-800 mb-1">ສະຫະກອນທີ່ເລືອກ:</h3>
                        <p className="text-blue-700 font-semibold">
                          {branches.find(b => b.username === selectedBranch)?.info || 
                           branches.find(b => b.username === selectedBranch)?.username || 
                           'ບໍ່ພົບຂໍ້ມູນ'}
                        </p>
                        <p className="text-blue-600 font-mono text-sm mt-2">Username: {selectedBranch}</p>
                      </div>
                    </div>
                  </div>
                )}
            </div>
          </div>

          {/* Step 2: สแกนบาร์โค้ด */}
          {showBarcodeInput && (
              <div className="mb-8 relative z-10">
                <h2 className="text-2xl font-extrabold text-slate-800 mb-4 flex items-center">
                  <span className="bg-gradient-to-br from-green-500 to-green-700 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-black mr-3 shadow-lg shadow-green-500/30">
                    2
                  </span>
                  ເພີ່ມບາໂຄດ
              </h2>
              
                <div className="space-y-6">
                  <div className="flex flex-wrap gap-4">
                    {/* Input field ที่แก้ไขแล้ว */}
                  <input
                    type="text"
                    value={barcodeInput}
                    onChange={handleBarcodeInput}
                    onPaste={handleBarcodePaste}
                      onKeyPress={handleBarcodeKeyPress}
                      placeholder="ວາງບາໂຄດທີ່ນີ້ ຫຼື ພິມດ້ວຍຕົນເອງ (ກົດ Enter ເພື່ອເພີ່ມ)"
                      className="flex-1 min-w-[300px] px-5 py-4 text-lg font-medium bg-gradient-to-r from-white to-slate-50 border-2 border-blue-200 rounded-2xl shadow-lg shadow-blue-500/8 transition-all duration-300 focus:border-blue-500 focus:shadow-xl focus:shadow-blue-500/20 focus:-translate-y-1 outline-none"
                    autoFocus
                      style={{ userSelect: 'text' }}
                    />
                    
                    <button
                      onClick={checkBarcodeAndAdd}
                      disabled={isLoading}
                      className="px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-2xl font-bold text-lg shadow-lg shadow-blue-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/40 flex items-center gap-2 min-w-fit disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      )}
                      {isLoading ? 'ກຳລັງກວດສອບ...' : 'ເພີ່ມ'}
                    </button>
                    
                  <button
                      onClick={() => {
                        const mockBarcode = 'BC' + Date.now().toString().slice(-8);
                        console.log('Setting mock barcode:', mockBarcode);
                        setBarcodeInput(mockBarcode);
                      }}
                      className="px-6 py-4 bg-gradient-to-r from-green-500 to-green-700 text-white rounded-2xl font-bold text-lg shadow-lg shadow-green-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-green-500/40 flex items-center gap-2 min-w-fit"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V6a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1zm12 0h2a1 1 0 001-1V6a1 1 0 00-1-1h-2a1 1 0 00-1 1v1a1 1 0 001 1zM5 20h2a1 1 0 001-1v-1a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1z" />
                    </svg>
                      ສະແກນ
                  </button>
                </div>
                
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 shadow-lg">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                      </div>
                      <div>
                        <p className="text-base font-bold text-blue-800 mb-3">ຄຳແນະນຳ:</p>
                        <ul className="space-y-2">
                          <li className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                            <span className="text-blue-500 text-base">•</span>
                            ວາງບາໂຄດທີ່ຄັດລອກມາໃນຊ່ອງດ້ານເທິງ
                          </li>
                          <li className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                            <span className="text-blue-500 text-base">•</span>
                            ຫຼື ກົດປຸ່ມ "ສະແກນ" ເພື່ອຈຳລອງການສະແກນ
                          </li>
                          <li className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                            <span className="text-blue-500 text-base">•</span>
                            ກົດ Enter ຫຼື ປຸ່ມ "ເພີ່ມ" ເພື່ອກວດສອບບາໂຄດ
                          </li>
                          <li className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                            <span className="text-blue-500 text-base">•</span>
                            ບາໂຄດຈະຖືກກວດສອບກັບຄລັງກ່ອນເພີ່ມລົງໃນຕາຕະລາງ
                          </li>
                          <li className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                            <span className="text-blue-500 text-base">•</span>
                            ສິນຄ້າທີ່ຍັງບໍ່ເຂົ້າຄລັງຈະບໍ່ຖືກເພີ່ມ
                          </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

            {/* Step 3: ตารางบาร์โค้ด */}
            {showBarcodeInput && barcodeList.length > 0 && (
              <div className="mb-8 relative z-10">
                <h2 className="text-2xl font-extrabold text-slate-800 mb-4 flex items-center">
                  <span className="bg-gradient-to-br from-amber-500 to-amber-700 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-black mr-3 shadow-lg shadow-amber-500/30">
                    3
                  </span>
                  ຕາຕະລາງບາໂຄດ ({barcodeList.length} ລາຍການ)
                </h2>
                
                <div className="bg-white rounded-3xl shadow-2xl border border-amber-200 overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-amber-50 to-orange-50">
                        <th className="px-6 py-4 text-left text-xs font-bold text-amber-800 uppercase tracking-wider border-b-2 border-amber-200">ລຳດັບ</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-amber-800 uppercase tracking-wider border-b-2 border-amber-200">ບາໂຄດ</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-amber-800 uppercase tracking-wider border-b-2 border-amber-200">ສະຖານະ</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-amber-800 uppercase tracking-wider border-b-2 border-amber-200">ຂໍ້ມູນສິນຄ້າ</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-amber-800 uppercase tracking-wider border-b-2 border-amber-200">ເວລາເພີ່ມ</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-amber-800 uppercase tracking-wider border-b-2 border-amber-200">ການດຳເນີນການ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {barcodeList.map((item, index) => (
                        <tr key={item.id} className="transition-all duration-200 hover:bg-amber-50/50 even:bg-amber-50/20">
                          <td className="px-6 py-4 text-sm font-semibold text-slate-900 border-b border-amber-100">{index + 1}</td>
                          <td className="px-6 py-4 text-sm font-mono font-semibold text-slate-900 border-b border-amber-100">{item.barcode}</td>
                          <td className="px-6 py-4 border-b border-amber-100">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              item.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {item.status === 'available' ? '✅ ພົບໃນຄລັງ' : '❌ ບໍ່ພົບ'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600 border-b border-amber-100">
                            {item.productInfo ? (
                              <div className="text-xs">
                                <div className="font-semibold text-slate-800 mb-1">
                                  {item.productInfo.name || 'ບໍ່ມີຊື່'}
                                </div>
                                <div className="text-slate-600">
                                  {item.productInfo.description || 'ບໍ່ມີຄຳອະທິບາຍ'}
                                </div>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">ບໍ່ມີຂໍ້ມູນ</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600 border-b border-amber-100">{item.timestamp}</td>
                          <td className="px-6 py-4 border-b border-amber-100">
                            <button
                              onClick={() => removeBarcode(item.id)}
                              className="text-red-600 hover:text-red-800 transition-colors duration-200 p-2 rounded-lg hover:bg-red-50"
                              title="ລຶບອອກ"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Step 4: สร้างการส่งพัสดุรวม */}
            {showBarcodeInput && barcodeList.length > 0 && (
              <div className="mb-8 relative z-10">
                <h2 className="text-2xl font-extrabold text-slate-800 mb-4 flex items-center">
                  <span className="bg-gradient-to-br from-purple-500 to-purple-700 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-black mr-3 shadow-lg shadow-purple-500/30">
                    4
                  </span>
                  ສ້າງການສົ່ງພັດສະດຸລວມ
              </h2>
              
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-3xl p-6 shadow-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">ສະຫະກອນທີ່ເລືອກ:</label>
                      <div className="px-4 py-3 bg-white border border-purple-200 rounded-xl font-semibold text-slate-900">
                        {branches.find(b => b.username === selectedBranch)?.info || 
                         branches.find(b => b.username === selectedBranch)?.username || 
                         'ບໍ່ພົບຂໍ້ມູນ'}
                    </div>
                  </div>
                  <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">ຈຳນວນບາໂຄດ:</label>
                      <div className="px-4 py-3 bg-white border border-purple-200 rounded-xl font-mono text-lg font-bold text-purple-600">
                        {barcodeList.length} ລາຍການ
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={handleCreateShipment}
                    className="w-full bg-gradient-to-r from-purple-500 to-purple-700 text-white py-5 px-6 rounded-2xl font-bold text-xl shadow-xl shadow-purple-500/30 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-500/40 flex items-center justify-center gap-3"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    ສົ່ງ
                </button>
              </div>
            </div>
          )}

          {/* Back to Home Button */}
            <div className="text-center relative z-10">
            <button
              onClick={() => navigate('/')}
                className="inline-flex items-center gap-2 px-6 py-4 bg-gradient-to-r from-slate-500 to-slate-700 text-white rounded-2xl font-semibold text-lg shadow-lg shadow-slate-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-500/40"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
                ກັບໜ້າຫຼັກ
            </button>
          </div>
        </div>
      </div>
      </main>
    </div>
  );
};

export default SmallParcels;
