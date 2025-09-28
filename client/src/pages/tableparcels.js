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

  const storedRole = localStorage.getItem("role");
  const storedBranch = localStorage.getItem("branch");

  // Sidebar states
  const [activePage, setActivePage] = useState("tableparcels");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Sample data - replace with your actual API call
  const sampleParcels = [
    { id: 1, parcelId: "KYE001", recipient: "ມິດສະຫວາຍ ລີ", phone: "020 1234567", from: "ຈີນ", to: "ວຽງຈັນ", status: "ກຳລັງສົ່ງ", weight: "2.5", price: "25,000", date: "2024-01-15" },
    { id: 2, parcelId: "KYE002", recipient: "ນາງ ສາວ ວັນນີ", phone: "020 2345678", from: "ຈີນ", to: "ລຸ່ງພະບາງ", status: "ສຳເລັດ", weight: "1.8", price: "18,000", date: "2024-01-14" },
    { id: 3, parcelId: "KYE003", recipient: "ນາຍ ບຸນມີ", phone: "020 3456789", from: "ຈີນ", to: "ສະຫວັນນະເຂດ", status: "ລໍຖ້າຮັບ", weight: "3.2", price: "32,000", date: "2024-01-13" },
    { id: 4, parcelId: "KYE004", recipient: "ນາງ ສົມພອນ", phone: "020 4567890", from: "ຈີນ", to: "ຈຳປາສັກ", status: "ກຳລັງສົ່ງ", weight: "0.8", price: "12,000", date: "2024-01-12" },
    { id: 5, parcelId: "KYE005", recipient: "ນາຍ ພູມມີ", phone: "020 5678901", from: "ຈີນ", to: "ວຽງຈັນ", status: "ສຳເລັດ", weight: "4.1", price: "45,000", date: "2024-01-11" },
    { id: 6, parcelId: "KYE006", recipient: "ນາງ ຈິດສະນຸກ", phone: "020 6789012", from: "ຈີນ", to: "ບໍລິຄຳໄຊ", status: "ລໍຖ້າຮັບ", weight: "2.0", price: "22,000", date: "2024-01-10" },
    { id: 7, parcelId: "KYE007", recipient: "ນາຍ ສຸກສັນ", phone: "020 7890123", from: "ຈີນ", to: "ຄຳມ່ວນ", status: "ກຳລັງສົ່ງ", weight: "1.5", price: "16,500", date: "2024-01-09" },
    { id: 8, parcelId: "KYE008", recipient: "ນາງ ພັນທິຍາ", phone: "020 8901234", from: "ຈີນ", to: "ຫຼວງນ້ຳທາ", status: "ສຳເລັດ", weight: "2.8", price: "28,000", date: "2024-01-08" }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setParcels(sampleParcels);
      setLoading(false);
    }, 1000);
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
    padding: "10px",
    marginBottom: "5px",
    borderRadius: "5px",
    paddingRight: "10px",
    backgroundColor: activePage === page ? "#34495e" : "transparent",
    transition: "background-color 0.3s",
  });

  // Filter parcels based on search term
  const filteredParcels = parcels.filter(parcel =>
    parcel.parcelId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    parcel.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
    parcel.phone.includes(searchTerm)
  );

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentParcels = filteredParcels.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredParcels.length / itemsPerPage);

  const getStatusColor = (status) => {
    switch (status) {
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

  return (
    <div className="flex h-screen font-sans">
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
               <Link
                 to="/homeAdmin/tableparcels"
                 style={sidebarLinkStyle("tablesparcels")}
                 onClick={() => {
                   setActivePage("distribution");
                   isMobile && toggleSidebar();
                 }}
               >
                 ຕາຕະລາງພັດດຸ
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
      <main className="flex-1 overflow-auto bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              {isMobile && (
                <button
                  onClick={toggleSidebar}
                  className="mr-4 text-gray-600 hover:text-gray-900"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              )}
              <h1 className="text-2xl font-bold text-gray-900">ຕາຕະລາງພັດດຸ</h1>
            </div>
            {!isMobile && (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  {new Date().toLocaleDateString("th-TH")}
                </span>
                <span className="text-sm text-gray-600">
                  {new Date().toLocaleTimeString("th-TH", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <span className="text-sm font-medium text-gray-800">
                  {username} | {role}
                </span>
                <Link
                  to="/"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                >
                  ໜ້າແຣກ
                </Link>
              </div>
            )}
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          {/* Search and Controls */}
          <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="ຊອກຫາລະຫັດພັດດຸ, ຊື່ຜູ້ຮັບ, ຫຼື ເບີໂທ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-80 px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              ທັງໝົດ {filteredParcels.length} ລາຍການ
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ລຳດັບ
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ລະຫັດພັດດຸ
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ຜູ້ຮັບ
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ເບີໂທ
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ຈາກ - ໄປ
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ນ້ຳໜັກ (kg)
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ລາຄາ (LAK)
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ສະຖານະ
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ວັນທີ
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ການດຳເນີນງານ
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
                              {parcel.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {parcel.date}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button className="text-blue-600 hover:text-blue-900 transition-colors">
                                ແກ້ໄຂ
                              </button>
                              <button className="text-green-600 hover:text-green-900 transition-colors">
                                ເບິ່ງ
                              </button>
                              <button className="text-red-600 hover:text-red-900 transition-colors">
                                ລົບ
                              </button>
                            </div>
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
