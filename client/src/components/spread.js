import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import useAuth from "../hooks/useAuth";
import "../style/font-style.css";
import Swal from "sweetalert2";

const Spread = () => {
  const { branch } = useAuth();
  const [parcels, setParcels] = useState([]);

  const storedBranch = localStorage.getItem("branch");

  const [formID, setFormID] = useState({
    id_parcel: "",
    from: "",
  });

  useEffect(() => {
    const fetchParcels = async () => {
      try {
        const response = await axios.post(
          "https://xjllao.com/v1/api/parcels",
          {
            from: storedBranch,
          }
        );
        setParcels(response.data);
      } catch (error) {
        console.error("Error fetch Data:", error);
      }
    };
    fetchParcels();
  }, [storedBranch]);

  useEffect(() => {
    if (branch) {
      setFormID((prevFormID) => ({ ...prevFormID, from: branch }));
    }
  }, [branch]);

  const handleChangeID = (e) => {
    setFormID({ ...formID, [e.target.id]: e.target.value });
  };

  const handleSubmitID = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "https://xjllao.com/v1/api/parcel",
        formID
      );
      console.log(response.data);
      setFormID({ id_parcel: "" });
      window.location.reload();
    } catch (error) {
      console.error(
        "Error saving data:",
        error.response?.data || error.message
      );
      Swal.fire({
        title: "Already ID Parcel!",
        text: error.response?.data?.message || "Try Again",
        icon: "error",
      });
    }
  };
  const [selectedParcels, setSelectedParcels] = useState(new Set());
  // const [isAllSelected, setIsAllSelected] = useState(false);

  const handleSelectAll = () => {
    // กรองเฉพาะ status "origin"
    const originParcels = parcels.filter((parcel) => parcel.status === "origin");
    
    if (selectedParcels.size === originParcels.length) {
      setSelectedParcels(new Set());
    } else {
      // จำกัดการเลือกไม่เกิน 999 ชิ้น
      const maxSelection = Math.min(originParcels.length, 999);
      const allParcelIds = originParcels.slice(0, maxSelection).map((parcel) => parcel.id_parcel);
      setSelectedParcels(new Set(allParcelIds));
    }
  };

  const handleParcelSelect = (event, parcelId) => {
    const isChecked = event.target.checked;
    setSelectedParcels((prevSelected) => {
      const newSelected = new Set(prevSelected);
      if (isChecked) {
        newSelected.add(parcelId);
      } else {
        newSelected.delete(parcelId);
      }
      return newSelected;
    });
  };

  useEffect(() => {
    console.log("Selected Parcels:", Array.from(selectedParcels));
  }, [selectedParcels]);

  const handleSubmit = async () => {
    const parcelIds = Array.from(selectedParcels).filter(
      (id) => id && id !== ""
    );

    console.log("Sending parcelIds:", parcelIds);

    try {
      await axios.post(
        "https://xjllao.com/v1/api/update-parcel-status",
        {
          parcelIds: parcelIds,
        }
      );

      // อัปเดตสถานะของพัสดุ
      setParcels((prevParcels) =>
        prevParcels.map((parcel) =>
          parcelIds.includes(parcel.id_parcel)
            ? { ...parcel, status: "export" }
            : parcel
        )
      );

      // รีเซ็ตการเลือกทั้งหมด
      setSelectedParcels(new Set());
    } catch (error) {
      console.error("Error updating parcel status", error);
    }
  };

  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <div>
      <style>{`
        .overflow-auto::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        .overflow-auto::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 8px;
        }
        
        .overflow-auto::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 8px;
          border: 2px solid #f1f5f9;
        }
        
        .overflow-auto::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        
        .overflow-auto::-webkit-scrollbar-corner {
          background: #f1f5f9;
        }
      `}</style>
      {/* <h1>Total Parcels: {totalParcels}</h1> */}
      <div className="bg-[#FB923C] px-6 py-4 pb-6 rounded-lg">
        <label className="text-white font-semibold">
          Enter the parcel number
        </label>
        <form className="flex mt-2 gap-2" onSubmit={handleSubmitID}>
          <input
            type="text"
            onChange={handleChangeID}
            ref={inputRef}
            value={formID.id_parcel}
            name="parcel"
            id="id_parcel"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            placeholder="Enter Number Parcel."
          />
          <input
            hidden
            value={formID.from}
            name="from"
            onChange={handleChangeID}
            readOnly
          />
          <button
            type="submit"
            style={{
              background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
              color: "#FB923C",
              border: "1px solid rgba(251, 146, 60, 0.3)",
              borderRadius: "10px",
              padding: "10px 20px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s ease",
              boxShadow: "0 2px 8px rgba(251, 146, 60, 0.15)",
              letterSpacing: "0.5px",
              textTransform: "uppercase",
              position: "relative",
              overflow: "hidden",
            }}
            onMouseOver={(e) => {
              e.target.style.transform = "translateY(-1px)";
              e.target.style.background = "linear-gradient(135deg, #FB923C 0%, #F97316 100%)";
              e.target.style.color = "white";
              e.target.style.border = "1px solid #FB923C";
              e.target.style.boxShadow = "0 4px 12px rgba(251, 146, 60, 0.25)";
            }}
            onMouseOut={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.background = "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)";
              e.target.style.color = "#FB923C";
              e.target.style.border = "1px solid rgba(251, 146, 60, 0.3)";
              e.target.style.boxShadow = "0 2px 8px rgba(251, 146, 60, 0.15)";
            }}
          >
            save
          </button>
        </form>
      </div>

      <div className="flex items-end justify-end">
        <button
          onClick={handleSelectAll}
          style={{
            padding: "12px 24px",
            background: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "500",
            transition: "all 0.2s ease",
            marginTop: "24px",
          }}
          onMouseOver={(e) => {
            e.target.style.background = "#2563eb";
            e.target.style.transform = "translateY(-1px)";
          }}
          onMouseOut={(e) => {
            e.target.style.background = "#3b82f6";
            e.target.style.transform = "translateY(0)";
          }}
        >
          {selectedParcels.size === parcels.length
            ? "ຍົກເລີກການເລືອກທັງໝົດ"
            : "ເລືອກທັງໝົດ"}
        </button>
      </div>

      <div style={{
        background: "white",
        borderRadius: "20px",
        boxShadow: "0 10px 30px rgba(251, 146, 60, 0.15)",
        border: "1px solid rgba(251, 146, 60, 0.1)",
        overflow: "hidden"
      }}>
        <div 
          className="overflow-auto"
          style={{
            maxHeight: "70vh",
            borderRadius: "16px",
            scrollbarWidth: "thin",
            scrollbarColor: "#cbd5e1 #f1f5f9"
          }}
        >
          <table className="w-full" style={{
            minWidth: "600px",
            borderCollapse: "collapse",
            borderSpacing: "0"
          }}>
          <thead style={{
            position: "sticky",
            top: "0",
            zIndex: "10"
          }}>
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
                NO.
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
                ID PARCEL
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
                TO
              </th>
              <th style={{
                padding: "12px 20px",
                borderBottom: "2px solid rgba(251, 146, 60, 0.3)",
                background: "linear-gradient(135deg, rgba(251, 146, 60, 0.1) 0%, rgba(249, 115, 22, 0.08) 100%)",
                textAlign: "center",
                fontSize: "12px",
                fontWeight: "600",
                color: "rgb(55, 65, 81)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}>
                SEND
              </th>
            </tr>
          </thead>
          <tbody>
            {parcels.length > 0 ? (
              parcels
                .filter((parcel) => parcel.status === "origin")
                .map((parcel, index) => (
                  <tr
                    key={parcel.id_parcel}
                    style={{
                      backgroundColor: "white",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "rgba(251, 146, 60, 0.05)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "white";
                    }}
                  >
                    <td style={{
                      padding: "16px 24px",
                      backgroundColor: "white",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#374151",
                      borderTop: "none",
                      borderLeft: "none",
                      borderRight: "none",
                      borderBottom: "none"
                    }}>
                      {index + 1}
                    </td>
                    <td style={{
                      padding: "16px 24px",
                      backgroundColor: "white",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#374151",
                      borderTop: "none",
                      borderLeft: "none",
                      borderRight: "none",
                      borderBottom: "none"
                    }}>
                      {parcel.id_parcel}
                    </td>
                    <td style={{
                      padding: "16px 24px",
                      backgroundColor: "white",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#374151",
                      borderTop: "none",
                      borderLeft: "none",
                      borderRight: "none",
                      borderBottom: "none"
                    }}>
                      {parcel.to}
                    </td>
                    <td style={{
                      padding: "16px 24px",
                      backgroundColor: "white",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#374151",
                      textAlign: "center",
                      borderTop: "none",
                      borderLeft: "none",
                      borderRight: "none",
                      borderBottom: "none"
                    }}>
                      <input
                        type="checkbox"
                        checked={selectedParcels.has(parcel.id_parcel)}
                        onChange={(event) =>
                          handleParcelSelect(event, parcel.id_parcel)
                        }
                        style={{
                          width: "18px",
                          height: "18px",
                          accentColor: "#FB923C",
                          cursor: "pointer"
                        }}
                      />
                    </td>
                  </tr>
                ))
            ) : (
              <tr>
                <td colSpan="4" style={{
                  padding: "16px 24px",
                  backgroundColor: "white",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#6B7280",
                  textAlign: "center",
                  borderTop: "none",
                  borderLeft: "none",
                  borderRight: "none",
                  borderBottom: "none"
                }}>
                  No parcels found with status 'origin'.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>

      <div className="flex items-end justify-end">
        <button
          onClick={handleSubmit}
          style={{
            padding: "12px 24px",
            background: "#10b981",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "500",
            transition: "all 0.2s ease",
            marginTop: "24px",
          }}
          onMouseOver={(e) => {
            e.target.style.background = "#059669";
            e.target.style.transform = "translateY(-1px)";
          }}
          onMouseOut={(e) => {
            e.target.style.background = "#10b981";
            e.target.style.transform = "translateY(0)";
          }}
        >
          Update
        </button>
      </div>
    </div>
  );
};

export default Spread;
