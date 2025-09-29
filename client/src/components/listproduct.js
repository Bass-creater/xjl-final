import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { BarLoader } from "react-spinners";
// import useAuth from "../hooks/useAuth";

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
          "http://localhost:1000/api/listproduct",
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
        const response = await axios.post("http://localhost:1000/api/listOrigin", {
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
        "http://localhost:1000/api/import-excel-parcels-save",
        formData
      );

      if (response.status === 200) {
        const { batch_uuid, imported_count, imported_records } = response.data;
        
        let message = `Import to Parcels Save Successful!\n`;
        message += `Batch UUID: ${batch_uuid}\n`;
        message += `Imported Records: ${imported_count}\n`;
        message += `\nRecords:\n`;
        imported_records.forEach(record => {
          message += `- ${record.id_parcel} (${record.branch}, ${record.tel}, ${record.weight}kg)\n`;
        });

        Swal.fire({
          title: "Import Successful",
          text: message,
          icon: "success",
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
        "http://localhost:1000/api/parcel/update",
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
        "http://localhost:1000/api/parcel/save",
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
          "http://localhost:1000/api/parcel/searchwarehouse",
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
      {/* Loading overlay */}
      {importLoading && (
        <div className="absolute inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
          <div style={{ textAlign: "center", color: "white" }}>
            <BarLoader color="#28a745" loading={importLoading} size={50} />
            <div style={{ marginTop: "10px", fontSize: "16px" }}>Importing data to Parcels Save...</div>
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
                  cursor: "pointer",
                  marginBottom: "15px"
                }}
                onClick={() => document.getElementById('excelFileInputParcelsSave').click()}
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
                    minWidth: "150px"
                  }}
                  onMouseOver={(e) => {
                    if (selectedFile && !importLoading) {
                      e.target.style.backgroundColor = "#0056b3";
                      e.target.style.transform = "translateY(-2px)";
                    }
                  }}
                  onMouseOut={(e) => {
                    if (selectedFile && !importLoading) {
                      e.target.style.backgroundColor = "#007bff";
                      e.target.style.transform = "translateY(0)";
                    }
                  }}
                >
                  {importLoading ? "Importing..." : "Import to Parcels Save"}
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
        <div className="bg-[#732dcf] px-6 py-4 pb-6 rounded-lg w-full mb-10">
          <h1 style={{ fontSize: "16px", margin: "0", color: "#fff" }}>
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
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              placeholder="Enter Number Parcel."
            />
            <button
              className="bg-white rounded-lg px-4 text-[#732dcf] font-semibold text-md duration-200 hover:px-6 hover:duration-200"
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
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    No.
                  </th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="text-center px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-end text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    FROM
                  </th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
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
                        className="hover:bg-gray-100 bg-white"
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
