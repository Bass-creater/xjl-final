import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
// import useAuth from "../hooks/useAuth";

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
    background: linear-gradient(135deg, #007bff 0%, #0056b3 100%) !important;
    border: none !important;
    border-radius: 12px !important;
    padding: 12px 24px !important;
    font-weight: 700 !important;
    font-size: 16px !important;
    box-shadow: 0 8px 25px rgba(0, 123, 255, 0.3) !important;
    transition: all 0.3s ease !important;
  }
  
  .swal2-confirm:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 12px 30px rgba(0, 123, 255, 0.4) !important;
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
      transform: translate(-50%, -50%) scale(1);
    }
    50% {
      transform: translate(-50%, -50%) scale(1.1);
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

const Listproduct = () => {
  const [products, setProducts] = useState();
  const [productsOrigin, setProductsOrigin] = useState();
  const [importLoading, setImportLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const storedBranch = localStorage.getItem("branch");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.post(
          "https://xjllao.com/v1/api/listproduct",
          { to: storedBranch }
        );
        const sorted = response.data.sort(
          (a, b) => new Date(b.time) - new Date(a.time)
        );
        setProducts(sorted);
      } catch (error) {
        console.error("Error fetching products: ", error);
      }
    };
    fetchProducts();
  }, [storedBranch]);

  useEffect(() => {
    const fetchOrigin = async () => {
      try {
        const response = await axios.post("https://xjllao.com/v1/api/listOrigin", {
          from: storedBranch,
        });
        const sortedRes = response.data.sort(
          (a, b) => new Date(b.time) - new Date(a.time)
        );
        setProductsOrigin(sortedRes);
      } catch (error) {
        console.error("Error fetching products: ", error);
      }
    };
    fetchOrigin();
  }, [storedBranch]);

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
      formData.append('file', selectedFile);

      const response = await axios.post(
        "https://xjllao.com/v1/api/import-excel-parcels-save",
        formData
      );

      if (response.status === 200) {
        const { batch_uuid, imported_count, duplicates_skipped, imported_records } = response.data;
        
        // สร้าง HTML สำหรับแสดงผลแบบสวยงาม
        let htmlContent = `
          <div style="text-align: center; font-family: 'Inter', sans-serif;">
            <div style="margin-bottom: 20px;">
              <div style="font-size: 48px; margin-bottom: 10px;">✅</div>
              <h2 style="color: #007bff; margin: 0; font-size: 24px; font-weight: 700;">Import สำเร็จ!</h2>
              <p style="color: #6B7280; margin: 8px 0 0 0; font-size: 14px;">Batch UUID: ${batch_uuid}</p>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
              <div style="background: linear-gradient(135deg, rgba(0, 123, 255, 0.1) 0%, rgba(0, 86, 179, 0.05) 100%); 
                          padding: 15px; border-radius: 12px; border: 1px solid rgba(0, 123, 255, 0.2);">
                <div style="font-size: 24px; font-weight: 800; color: #007bff; margin-bottom: 5px;">${imported_count}</div>
                <div style="font-size: 14px; color: #0056b3; font-weight: 600;">นำเข้าสำเร็จ</div>
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
              <h3 style="color: #007bff; font-size: 16px; font-weight: 700; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 18px;">📦</span>
                Parcel IDs ที่นำเข้าสำเร็จ (${imported_records.length} รายการ)
              </h3>
              <div style="max-height: 200px; overflow-y: auto; background: rgba(0, 123, 255, 0.05); 
                          border-radius: 8px; padding: 10px; border: 1px solid rgba(0, 123, 255, 0.1);">
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 8px;">
          `;
          
          imported_records.forEach(record => {
            htmlContent += `
              <div style="background: linear-gradient(135deg, rgba(0, 123, 255, 0.15) 0%, rgba(0, 86, 179, 0.1) 100%); 
                          padding: 8px 12px; border-radius: 6px; border: 1px solid rgba(0, 123, 255, 0.2); 
                          font-size: 12px; font-weight: 600; color: #0056b3; text-align: center;">
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
          confirmButtonColor: "#007bff",
          customClass: {
            popup: 'swal-custom-popup',
            title: 'swal-custom-title',
            content: 'swal-custom-content'
          }
        }).then(() => {
          setSelectedFile(null);
          // Reset file input
          const fileInput = document.getElementById('excelFileInputParcelsSave');
          if (fileInput) {
            fileInput.value = '';
          }
          // Reload page to show new data
          window.location.reload();
        });
      }
    } catch (error) {
      console.error("Import Error:", error);
      let errorMessage = error?.response?.data?.message || "An error occurred while importing the file";
      
      if (error?.response?.data?.errors) {
        errorMessage += "\n\nErrors:\n" + error.response.data.errors.join('\n');
      }
      
      Swal.fire({
        title: "Import Failed",
        text: errorMessage,
        icon: "error",
      });
    } finally {
      setImportLoading(false);
    }
  };

  const handleAccept = async (product) => {
    const dataToSave = {
      id_parcel: product.id_parcel,
      from: product.from,
      status: "accepted",
    };

    const updateParcel = {
      id_parcel: product.id_parcel,
      status: "accepted",
    };

    try {
      const response = await axios.post(
        "https://xjllao.com/v1/api/parcel/update",
        updateParcel
      );

      if (response.status === 200) {
        // alert("Parcel status updated successfully");
        window.location.reload();
        setProducts((prevProducts) =>
          prevProducts.filter((item) => item.id_parcel !== product.id_parcel)
        );
      }
    } catch (error) {
      console.error("Error updating parcel status:", error);
      Swal.fire({
        title: "Error Update",
        text: "Contact Developer!",
        icon: "error",
      });
    }

    try {
      const response = await axios.post(
        "https://xjllao.com/v1/api/parcel/save",
        dataToSave
      );

      if (response.status === 200) {
        // alert("Parcel status saved");

        setProducts((prevProducts) =>
          prevProducts.map((item) =>
            item.id_parcel === product.id_parcel
              ? { ...item, status: "accepted" }
              : item
          )
        );
      }
    } catch (error) {
      console.error("Error saving parcel: ", error);
    }
  };
  // const { username } = useAuth();
  const [findParcel, setFindParcel] = useState("");
  const [parcelResponse, setParcelResponse] = useState(null);
  const [error, setError] = useState("");

  const handleSeachPaste = async (e) => {
    const pasted = e.clipboardData.getData("Text").trim();
    setFindParcel(pasted);
    if (pasted.length >= 5) {
      try {
        const response = await axios.post(
          "https://xjllao.com/v1/api/parcel/searchwarehouse",
          {
            id_parcel: pasted,
          }
        );

        setParcelResponse(response.data);
        setError("");
      } catch (error) {
        console.error("Error to Search | Try again", error);
        setParcelResponse(null);
        setError("This ID Parcel was not found.");
      }
    }
  };

  return (
    <div>
      {/* Enhanced Loading overlay */}
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
              color: "#9CA3AF",
              fontStyle: "italic"
            }}>
              Import to Parcels Save
            </div>
          </div>
        </div>
      )}

      {/* Excel Import Section for Parcels Save - Only show for LAO Warehouse */}
      {storedBranch === "LAO Warehouse" && (
        <div className="mb-6">
          <div
            style={{
              borderRadius: "10px",
              overflow: "hidden",
              boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
            }}
          >
            <div style={{
              background: "linear-gradient(to right, #007bff, #0056b3)",
              padding: "15px 20px",
              borderRadius: "20px 20px 0 0",
              color: "white",
            }}>
              <h2 style={{ margin: 0, color: "white" }}>Import Excel to Parcels Save</h2>
            </div>
            <div style={{
              backgroundColor: "#f9f9f9",
              padding: "20px",
            }}>
              {/* Drag and Drop Area */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                style={{
                  border: isDragOver ? "2px dashed #007bff" : "2px dashed #ccc",
                  borderRadius: "10px",
                  padding: "20px",
                  textAlign: "center",
                  backgroundColor: isDragOver ? "#f8f9fa" : "#fff",
                  transition: "all 0.3s ease",
                  cursor: importLoading ? "not-allowed" : "pointer",
                  marginBottom: "15px",
                  opacity: importLoading ? 0.6 : 1,
                  position: "relative"
                }}
                onClick={() => !importLoading && document.getElementById('excelFileInputParcelsSave').click()}
              >
                {importLoading && (
                  <div style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    background: "rgba(255, 255, 255, 0.9)",
                    borderRadius: "50%",
                    padding: "10px",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
                  }}>
                    <div style={{
                      width: "20px",
                      height: "20px",
                      border: "2px solid rgba(0, 123, 255, 0.3)",
                      borderTop: "2px solid #007bff",
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite"
                    }}></div>
                  </div>
                )}
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
                id="excelFileInputParcelsSave"
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
                    backgroundColor: selectedFile && !importLoading ? "#007bff" : "#6c757d",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: selectedFile && !importLoading ? "pointer" : "not-allowed",
                    fontSize: "16px",
                    fontWeight: "500",
                    transition: "all 0.3s ease",
                    minWidth: "150px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    position: "relative",
                    overflow: "hidden"
                  }}
                  onMouseOver={(e) => {
                    if (selectedFile && !importLoading) {
                      e.target.style.backgroundColor = "#0056b3";
                      e.target.style.transform = "translateY(-2px)";
                      e.target.style.boxShadow = "0 8px 25px rgba(0, 123, 255, 0.3)";
                    }
                  }}
                  onMouseOut={(e) => {
                    if (selectedFile && !importLoading) {
                      e.target.style.backgroundColor = "#007bff";
                      e.target.style.transform = "translateY(0)";
                      e.target.style.boxShadow = "none";
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
                    {importLoading ? "กำลังนำเข้า..." : "Import to Parcels Save"}
                  </span>
                </button>
              </div>

              {/* Instructions */}
              <div style={{ marginTop: "15px", fontSize: "12px", color: "#666", textAlign: "center" }}>
                <strong>Note:</strong> The system will read data from columns B-E (Branch, Tel, ID Parcel, Weight) starting from row 2. All parcels must have the same UUID from the parcels table.
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-center flex-col">
        <div style={{
          background: "linear-gradient(135deg, #FB923C 0%, #F97316 50%, #EA580C 100%)",
          padding: "16px 24px 24px 24px",
          borderRadius: "12px",
          width: "100%",
          marginBottom: "40px",
          boxShadow: "0 8px 25px rgba(251, 146, 60, 0.3), 0 4px 12px rgba(249, 115, 22, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
          border: "1px solid rgba(251, 146, 60, 0.4)",
          position: "relative",
          overflow: "hidden",
        }}>
          <h1 style={{ 
            fontSize: "16px", 
            margin: "0", 
            color: "#fff",
            textShadow: "0 2px 8px rgba(0, 0, 0, 0.2), 0 1px 4px rgba(0, 0, 0, 0.1)",
            fontWeight: "600",
          }}>
            ຄົ້ນຫາລາຍການພັດດຸ
          </h1>

          <div className="flex mt-2 gap-2">
            <input
              type="text"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const parcel = products.find(
                    (item) => item.id_parcel === findParcel
                  );
                  if (parcel) {
                    handleAccept(parcel);
                  } else {
                    Swal.fire({
                      title: "Parcel Not Found",
                      text: "Please check the Parcel ID again.",
                      icon: "error",
                    });
                  }
                }
              }}
              // value={findParcel}
              onChange={(e) => setFindParcel(e.target.value)}
              onPaste={handleSeachPaste}
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                color: "#374151",
                fontSize: "14px",
                borderRadius: "8px",
                width: "100%",
                padding: "10px 12px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
                backdropFilter: "blur(10px)",
                outline: "none",
                transition: "all 0.3s ease",
              }}
              placeholder="Enter Number Parcel."
            />
            <button
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                borderRadius: "8px",
                padding: "10px 16px",
                color: "#FB923C",
                fontWeight: "600",
                fontSize: "14px",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
                backdropFilter: "blur(10px)",
                transition: "all 0.3s ease",
                cursor: "pointer",
              }}
              type="button"
              onClick={() => {
                const parcel = products.find(
                  (item) => item.id_parcel === findParcel
                );
                if (parcel) {
                  handleAccept(parcel);
                } else {
                  Swal.fire({
                    title: "Parcel Not Found",
                    text: "Please check the Parcel ID again.",
                    icon: "error",
                  });
                }
              }}
            >
              <svg
                className="w-6 h-6 text-gray-800"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 15v2a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-2m-8 1V4m0 12-4-4m4 4 4-4"
                />
              </svg>
            </button>
          </div>
        </div>

        {error && <div className="text-red-500 font-semibold">{error}</div>}

        <div className="w-full mx-4 sm:-mx-8 px-4 sm:px-8 py-4 overflow-x-auto">
          <div className="inline-block min-w-full shadow rounded-lg overflow-hidden">
            <table className="w-full leading-normal">
              <thead>
                <tr>
                  {/* เพิ่มหัวข้อคอลัมน์ "No." */}
                  <th style={{
                    padding: "12px 20px",
                    borderBottom: "2px solid rgba(251, 146, 60, 0.3)",
                    background: "linear-gradient(135deg, rgba(251, 146, 60, 0.1) 0%, rgba(249, 115, 22, 0.08) 100%)",
                    textAlign: "left",
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#374151",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}>
                    No.
                  </th>
                  <th style={{
                    padding: "12px 20px",
                    borderBottom: "2px solid rgba(251, 146, 60, 0.3)",
                    background: "linear-gradient(135deg, rgba(251, 146, 60, 0.1) 0%, rgba(249, 115, 22, 0.08) 100%)",
                    textAlign: "left",
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#374151",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}>
                    ID
                  </th>
                  <th style={{
                    padding: "12px 20px",
                    borderBottom: "2px solid rgba(251, 146, 60, 0.3)",
                    background: "linear-gradient(135deg, rgba(251, 146, 60, 0.1) 0%, rgba(249, 115, 22, 0.08) 100%)",
                    textAlign: "center",
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#374151",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}>
                    Status
                  </th>
                  <th style={{
                    padding: "12px 20px",
                    borderBottom: "2px solid rgba(251, 146, 60, 0.3)",
                    background: "linear-gradient(135deg, rgba(251, 146, 60, 0.1) 0%, rgba(249, 115, 22, 0.08) 100%)",
                    textAlign: "right",
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#374151",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}>
                    FROM
                  </th>
                  <th style={{
                    padding: "12px 20px",
                    borderBottom: "2px solid rgba(251, 146, 60, 0.3)",
                    background: "linear-gradient(135deg, rgba(251, 146, 60, 0.1) 0%, rgba(249, 115, 22, 0.08) 100%)",
                    textAlign: "right",
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#374151",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}>
                    Time
                  </th>
                </tr>
              </thead>
              <tbody>
                {parcelResponse
                  ? (() => {
                      // ค้นหา index ของ parcelResponse ใน products หรือ productsOrigin
                      const dataList =
                        storedBranch === "LAO Warehouse"
                          ? products
                          : productsOrigin;
                      const index = dataList.findIndex(
                        (product) =>
                          product.id_parcel === parcelResponse.id_parcel
                      );

                      return (
                        <tr className="bg-green-200">
                          {/* แสดงลำดับที่ตามตำแหน่งใน dataList */}
                          <td className="px-5 py-5 border-b border-gray-200 text-sm">
                            {index + 1}
                          </td>
                          <td className="px-5 py-5 border-b border-gray-200 text-sm">
                            <p className="text-gray-900 whitespace-no-wrap">
                              {parcelResponse.id_parcel}
                            </p>
                          </td>
                          <td className="text-center px-5 py-5 border-b border-gray-200 text-sm">
                            <span className="relative inline-block px-3 py-1 font-semibold text-green-900 leading-tight">
                              <span
                                aria-hidden
                                className="absolute inset-0 bg-green-200 opacity-50 rounded-full"
                              ></span>
                              {parcelResponse.status ? (
                                <p>ລໍຖ້າສາງເພື່ອຮັບສິນຄ້າ</p>
                              ) : null}
                            </span>
                          </td>
                          <td className="text-end px-5 py-5 border-b border-gray-200 text-sm">
                            <p className="text-gray-900 whitespace-no-wrap">
                              {parcelResponse.from}
                            </p>
                          </td>
                          <td className="px-5 py-5 border-b border-gray-200 text-sm text-end">
                            <p className="text-gray-900 whitespace-no-wrap">
                              {parcelResponse.time}
                            </p>
                          </td>
                        </tr>
                      );
                    })()
                  : (storedBranch === "LAO Warehouse"
                      ? products
                      : productsOrigin
                    )?.map((product, index) => (
                      <tr
                        key={product.id_parcel}
                        style={{
                          backgroundColor: "white",
                          transition: "all 0.3s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = "rgba(251, 146, 60, 0.05)";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = "white";
                        }}
                      >
                        {/* เพิ่ม Column แสดงลำดับโดยใช้ index */}
                        <td className="px-5 py-5 border-b border-gray-200 text-sm">
                          <p className="text-gray-900 whitespace-no-wrap">
                            {index + 1}
                          </p>
                        </td>
                        <td className="px-5 py-5 border-b border-gray-200 text-sm">
                          <p className="text-gray-900 whitespace-no-wrap">
                            {product.id_parcel}
                          </p>
                        </td>
                        <td className="text-center px-5 py-5 border-b border-gray-200 text-sm">
                          <span className="relative inline-block px-3 py-1 font-semibold text-green-900 leading-tight">
                            <span
                              aria-hidden
                              className="absolute inset-0 bg-green-200 opacity-50 rounded-full"
                            ></span>
                            {product.status ? (
                              <p>ລໍຖ້າສາງເພື່ອຮັບສິນຄ້າ</p>
                            ) : null}
                          </span>
                        </td>
                        <td className="text-end px-5 py-5 border-b border-gray-200 text-sm">
                          <p className="text-gray-900 whitespace-no-wrap">
                            {product.from}
                          </p>
                        </td>
                        <td className="px-5 py-5 border-b border-gray-200 text-sm text-end">
                          <p className="text-gray-900 whitespace-no-wrap">
                            {product.time}
                          </p>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Listproduct;
