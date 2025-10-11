import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const SmallParcels = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [parcels, setParcels] = useState([]);
  const [scannedTracking, setScannedTracking] = useState('');
  const [matchedParcels, setMatchedParcels] = useState([]);
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

    // โหลดรายการลูกค้า
    fetchCustomers();
  }, [navigate]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 870);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('https://xjllao.com/v1/api/parcelswait', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Get unique customer names (branch) ที่มี status = 'accepted' เท่านั้น
        const acceptedParcels = data.filter(item => item.status === 'accepted');
        const uniqueCustomers = [...new Set(acceptedParcels.map(item => item.branch))].filter(Boolean);
        setCustomers(uniqueCustomers.map(name => ({ name })));
      } else {
        console.error('Failed to fetch customers');
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomerSelect = async (customerName) => {
    setSelectedCustomer(customerName);
    setMatchedParcels([]);
    setScannedTracking('');
    
    if (customerName) {
      // ดึงพัสดุทั้งหมดของลูกค้าคนนี้
      await fetchCustomerParcels(customerName);
    } else {
      setParcels([]);
    }
  };

  const fetchCustomerParcels = async (customerName) => {
    try {
      setIsLoading(true);
      const response = await fetch('https://xjllao.com/v1/api/parcelswait', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        // กรองเฉพาะพัสดุของลูกค้าที่เลือก และ status เป็น accepted
        const customerParcels = data.filter(p => p.branch === customerName && p.status === 'accepted');
        setParcels(customerParcels);
      } else {
        console.error('Failed to fetch parcels');
      }
    } catch (error) {
      console.error('Error fetching parcels:', error);
      showErrorAlert('⚠️ ບໍ່ສາມາດດຶງຂໍ້ມູນພັດດຸໄດ້');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrackingInput = (e) => {
    const value = e.target.value.trim();
    setScannedTracking(value);
    
    if (value) {
      // ตรวจสอบว่า tracking ตรงกับพัสดุในรายการหรือไม่
      const matched = parcels.find(p => p.id_parcel === value);
      if (matched && !matchedParcels.includes(value)) {
        setMatchedParcels(prev => [...prev, value]);
        setScannedTracking(''); // Clear input
        console.log('✅ เลข Tracking ตรงกัน:', value);
      }
    }
  };

  const handleTrackingKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleTrackingInput(e);
    }
  };

  const removeMatchedParcel = (trackingId) => {
    setMatchedParcels(prev => prev.filter(id => id !== trackingId));
  };

  const handleConfirm = async () => {
    if (!selectedCustomer || matchedParcels.length === 0) {
      showErrorAlert('ກະລຸນາເລືອກລູກຄ້າ ແລະ ສະແກນເລກ Tracking ຢ່າງໜ້ອຍ 1 ລາຍການ');
      return;
    }

    try {
      setIsLoading(true);
      
      // ส่งข้อมูลไปยัง API เพื่ออัปเดต status เป็น success
      const response = await fetch('https://xjllao.com/v1/api/updatesuccess', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          parcels_id: matchedParcels.map(id => ({ id })),
          branch: selectedCustomer
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ อัปเดตสถานะสำเร็จ:', data);

        // รีเซ็ตฟอร์ม
        setSelectedCustomer('');
        setParcels([]);
        setMatchedParcels([]);
        setScannedTracking('');
        
        // แสดงข้อความสำเร็จ
        showSuccessMessage(`✅ ຢືນຢັນການສົ່ງພັດສະດຸສຳເລັດ!\nຈຳນວນພັດດຸ: ${matchedParcels.length} ລາຍການ\nລູກຄ້າ: ${selectedCustomer}`);
      } else {
        const errorData = await response.json();
        showErrorAlert(`❌ ບໍ່ສາມາດອັບເດດສະຖານະ: ${errorData.message || 'ຂໍ້ຜິດພາດທີ່ບໍ່ຮູ້ຈັກ'}`);
      }
    } catch (error) {
      console.error('❌ Error updating status:', error);
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
          <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-4"></div>
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
                background: "linear-gradient(135deg, #FB923C 0%, #F97316 50%, #EA580C 100%)",
                border: "none",
                fontSize: "24px",
                cursor: "pointer",
                marginRight: "15px",
                padding: "12px",
                borderRadius: "12px",
                color: "white",
                boxShadow: "0 8px 25px rgba(251, 146, 60, 0.3)",
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
            
          {/* Step 1: เลือกลูกค้า */}
            <div className="mb-8 relative z-10">
              <h2 className="text-2xl font-extrabold text-slate-800 mb-4 flex items-center">
                <span className="bg-gradient-to-br from-blue-500 to-blue-700 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-black mr-3 shadow-lg shadow-blue-500/30">
                  1
                </span>
                ເລືອກລູກຄ້າ
              </h2>
              
              <div className="space-y-4">
                <div className="relative">
                  <label htmlFor="customer-input" className="block text-sm font-semibold text-slate-700 mb-2">
                    ພິມຊື່ລູກຄ້າ:
                  </label>
                  <div className="flex gap-3">
                    <input
                      id="customer-input"
                      type="text"
                      value={selectedCustomer}
                      onChange={(e) => setSelectedCustomer(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && selectedCustomer.trim()) {
                          handleCustomerSelect(selectedCustomer);
                        }
                      }}
                      placeholder="ພິມຊື່ລູກຄ້າ..."
                      className="flex-1 px-6 py-4 text-lg font-medium bg-gradient-to-r from-white to-slate-50 border-2 border-blue-200 rounded-2xl shadow-lg shadow-blue-500/8 transition-all duration-300 focus:border-blue-500 focus:shadow-xl focus:shadow-blue-500/20 focus:-translate-y-1 outline-none"
                    />
                    <button
                      onClick={() => handleCustomerSelect(selectedCustomer)}
                      disabled={!selectedCustomer.trim()}
                      className="px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-2xl font-bold text-lg shadow-lg shadow-blue-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      ຄົ້ນຫາ
                    </button>
                  </div>
                  
                  {/* Dropdown รายชื่อลูกค้าที่มี */}
                  {customers.length > 0 && (
                    <div className="mt-3 bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <p className="text-sm font-semibold text-slate-700 mb-2">ລູກຄ້າທີ່ມີໃນລະບົບ:</p>
                      <div className="flex flex-wrap gap-2">
                        {customers.map((customer, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              setSelectedCustomer(customer.name);
                              handleCustomerSelect(customer.name);
                            }}
                            className="px-3 py-1.5 bg-white border border-blue-300 rounded-lg text-sm font-medium text-blue-700 hover:bg-blue-100 hover:border-blue-400 transition-all"
                          >
                            {customer.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {parcels.length > 0 && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-white text-xl">✅</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-800 mb-1">ພົບພັດດຸຂອງລູກຄ້າ:</h3>
                        <p className="text-green-700 font-semibold text-xl">
                          {selectedCustomer} ({parcels.length} ລາຍການ)
                        </p>
                      </div>
                    </div>
                  </div>
                )}
            </div>
          </div>

          {/* Step 2: สแกนเลข Tracking */}
          {selectedCustomer && parcels.length > 0 && (
              <div className="mb-8 relative z-10">
                <h2 className="text-2xl font-extrabold text-slate-800 mb-4 flex items-center">
                  <span className="bg-gradient-to-br from-green-500 to-green-700 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-black mr-3 shadow-lg shadow-green-500/30">
                    2
                  </span>
                  ສະແກນເລກ Tracking
              </h2>
              
                <div className="space-y-4">
                  {/* Input สำหรับสแกน Tracking */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                      ກະລຸນາສະແກນຫຼືພິມເລກ Tracking:
                    </label>
                    <input
                      type="text"
                      value={scannedTracking}
                      onChange={(e) => setScannedTracking(e.target.value)}
                      onKeyPress={handleTrackingKeyPress}
                      onBlur={handleTrackingInput}
                      placeholder="ສະແກນຫຼືພິມເລກ Tracking..."
                      className="w-full px-6 py-4 text-lg font-mono font-semibold bg-white border-2 border-blue-300 rounded-xl shadow-lg focus:border-blue-500 focus:shadow-xl focus:shadow-blue-500/20 outline-none transition-all"
                      autoFocus
                    />
                    <p className="text-xs text-slate-600 mt-2">
                      💡 ສະແກນເລກ Tracking ຫຼືພິມແລ້ວກົດ Enter
                    </p>
                  </div>

                  {/* ตารางแสดงพัสดุทั้งหมด */}
                  <div className="bg-white rounded-3xl shadow-2xl border border-green-200 overflow-hidden">
                    <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-b-2 border-green-200">
                      <div className="text-sm font-semibold text-slate-700">
                        ສະແກນແລ້ວ: <span className="text-green-600 text-lg">{matchedParcels.length}</span> / {parcels.length} ລາຍການ
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gradient-to-r from-green-50 to-emerald-50">
                            <th className="px-6 py-4 text-left text-xs font-bold text-green-800 uppercase tracking-wider border-b-2 border-green-200">ລຳດັບ</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-green-800 uppercase tracking-wider border-b-2 border-green-200">ເລກ Tracking</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-green-800 uppercase tracking-wider border-b-2 border-green-200">ນ້ຳໜັກ (kg)</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-green-800 uppercase tracking-wider border-b-2 border-green-200">ປະລິມານ (CBM)</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-green-800 uppercase tracking-wider border-b-2 border-green-200">ຈຳນວນ</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-green-800 uppercase tracking-wider border-b-2 border-green-200">ເບີໂທ</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-green-800 uppercase tracking-wider border-b-2 border-green-200">ສະຖານະ</th>
                          </tr>
                        </thead>
                        <tbody>
                          {parcels.map((parcel, index) => {
                            const isMatched = matchedParcels.includes(parcel.id_parcel);
                            return (
                              <tr 
                                key={parcel.id_parcel} 
                                className={`transition-all duration-300 ${
                                  isMatched 
                                    ? 'bg-green-100 hover:bg-green-200' 
                                    : 'hover:bg-green-50/50 even:bg-green-50/20'
                                }`}
                              >
                                <td className="px-6 py-4 text-sm font-semibold text-slate-900 border-b border-green-100">{index + 1}</td>
                                <td className={`px-6 py-4 text-sm font-mono font-bold border-b border-green-100 ${
                                  isMatched ? 'text-green-700' : 'text-slate-900'
                                }`}>
                                  {isMatched && <span className="mr-2">✅</span>}
                                  {parcel.id_parcel}
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-600 border-b border-green-100">{parcel.weight || '0'}</td>
                                <td className="px-6 py-4 text-sm text-slate-600 border-b border-green-100">{parcel.volume || '0'}</td>
                                <td className="px-6 py-4 text-sm text-slate-600 border-b border-green-100">{parcel.amount || '0'}</td>
                                <td className="px-6 py-4 text-sm text-slate-600 border-b border-green-100">{parcel.tel || '-'}</td>
                                <td className="px-6 py-4 border-b border-green-100">
                                  {isMatched ? (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-600 text-white">
                                      ✓ ສະແກນແລ້ວ
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                      ລໍຖ້າສະແກນ
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
          )}

          {/* Step 2.5: รายการที่สแกนแล้ว */}
          {selectedCustomer && matchedParcels.length > 0 && (
              <div className="mb-8 relative z-10">
                <h2 className="text-2xl font-extrabold text-slate-800 mb-4 flex items-center">
                  <span className="bg-gradient-to-br from-amber-500 to-amber-700 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-black mr-3 shadow-lg shadow-amber-500/30">
                    📋
                  </span>
                  ລາຍການທີ່ສະແກນແລ້ວ ({matchedParcels.length} ລາຍການ)
              </h2>
              
                <div className="bg-white rounded-2xl shadow-xl border border-amber-200 overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-amber-50 to-orange-50">
                        <th className="px-6 py-4 text-left text-xs font-bold text-amber-800 uppercase tracking-wider border-b-2 border-amber-200">ລຳດັບ</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-amber-800 uppercase tracking-wider border-b-2 border-amber-200">ເລກ Tracking</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-amber-800 uppercase tracking-wider border-b-2 border-amber-200">ການດຳເນີນການ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {matchedParcels.map((trackingId, index) => (
                        <tr key={trackingId} className="transition-all duration-200 hover:bg-amber-50/50">
                          <td className="px-6 py-4 text-sm font-semibold text-slate-900 border-b border-amber-100">{index + 1}</td>
                          <td className="px-6 py-4 text-sm font-mono font-bold text-green-700 border-b border-amber-100">
                            ✅ {trackingId}
                          </td>
                          <td className="px-6 py-4 border-b border-amber-100">
                            <button
                              onClick={() => removeMatchedParcel(trackingId)}
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

            {/* Step 3: ยืนยันการส่งพัสดุ */}
            {selectedCustomer && matchedParcels.length > 0 && (
              <div className="mb-8 relative z-10">
                <h2 className="text-2xl font-extrabold text-slate-800 mb-4 flex items-center">
                  <span className="bg-gradient-to-br from-purple-500 to-purple-700 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-black mr-3 shadow-lg shadow-purple-500/30">
                    3
                  </span>
                  ຢືນຢັນການສົ່ງພັດສະດຸ
              </h2>
              
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-3xl p-6 shadow-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">ລູກຄ້າທີ່ເລືອກ:</label>
                      <div className="px-4 py-3 bg-white border border-purple-200 rounded-xl font-semibold text-slate-900 text-lg">
                        {selectedCustomer || 'ບໍ່ພົບຂໍ້ມູນ'}
                    </div>
                  </div>
                  <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">ຈຳນວນພັດດຸທີ່ສະແກນ:</label>
                      <div className="px-4 py-3 bg-white border border-purple-200 rounded-xl font-mono text-lg font-bold text-purple-600">
                        {matchedParcels.length} ລາຍການ
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={handleConfirm}
                    className="w-full bg-gradient-to-r from-purple-500 to-purple-700 text-white py-5 px-6 rounded-2xl font-bold text-xl shadow-xl shadow-purple-500/30 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-500/40 flex items-center justify-center gap-3"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    ຢືນຢັນ
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
