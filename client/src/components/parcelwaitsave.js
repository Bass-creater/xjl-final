import axios from "axios";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ParcelWaitSave = () => {
  const [parcels, setParcels] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchParcels = async () => {
      try {
        const response = await axios.get("http://localhost:1000/api/parcelswait");
        setParcels(response.data);
      } catch (error) {
        console.error("Error fetch Parcel: ", error);
      }
    };
    fetchParcels();
  }, []);

  const handleSend = async (parcels) => {
    const updateStatus = {
      id_parcel: parcels.id_parcel,
      status: "201",
    };

    try {
      const response = await axios.post(
        "http://localhost:1000/api/parcel/updatebranch",
        updateStatus
      );

      if (response.status === 200) {
        setParcels((prevParcels) =>
          prevParcels.filter((item) => item.id_parcel !== parcels.id_parcel)
        );
      }
    } catch (error) {
      console.error("Error updating parcel status:", error);
    }
  };

  // const overFlowPage = () => ({
  //   overFlow: "auto",
  // });
  const handleSendAll = async () => {
    for (let parcel of parcels) {
      await handleSend(parcel); // เรียก handleSend สำหรับแต่ละ parcel
    }
  };

  const openPDF = (id_parcel) => {
    const pdfUrl = `http://localhost:1000/pdf/${id_parcel}.pdf`;
    window.open(pdfUrl, "_blank", "noopener,noreferrer");
  };

  const handleViewPdf = (id_parcel) => {
    const parcelId = id_parcel;
    navigate(`/view-pdf/${parcelId}`);
  };

  return (
    <div className="overflow-auto">
      {parcels.length > 0 && (
        <div className="mt-4 text-end">
          <button
            style={{
              padding: "12px 24px",
              background: "linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)",
              color: "white",
              border: "none",
              borderRadius: "12px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "600",
              transition: "all 0.3s ease",
              boxShadow: "0 4px 15px rgba(59, 130, 246, 0.3)",
            }}
            onMouseOver={(e) => {
              e.target.style.background = "linear-gradient(135deg, #1D4ED8 0%, #1E40AF 100%)";
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 8px 25px rgba(59, 130, 246, 0.4)";
            }}
            onMouseOut={(e) => {
              e.target.style.background = "linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)";
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 4px 15px rgba(59, 130, 246, 0.3)";
            }}
            onClick={handleSendAll}
          >
            Send All Parcels
          </button>
        </div>
      )}
      <div style={{
        background: "white",
        borderRadius: "20px",
        boxShadow: "0 10px 30px rgba(251, 146, 60, 0.15)",
        border: "1px solid rgba(251, 146, 60, 0.1)",
        overflow: "hidden",
        marginTop: "24px"
      }}>
        <table className="w-full leading-normal">
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
                width: "80px",
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
                Date | Time
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
                From
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
                Branch
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
                Type
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
                Weight (kg)
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
                width: "120px",
              }}>
                Price
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
                .slice()
                .reverse()
                .map((parcel, index) => (
                  <tr
                    key={`${parcel.id_parcel}-${index}`}
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
                    <td style={{
                      padding: "16px 24px",
                      backgroundColor: "white",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#374151"
                    }}>
                      {index + 1}
                    </td>
                    <td style={{
                      padding: "16px 24px",
                      backgroundColor: "white",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#374151"
                    }}>
                      {parcel.id_parcel}
                    </td>
                    <td style={{
                      padding: "16px 24px",
                      backgroundColor: "white",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#374151"
                    }}>
                      {parcel.time}
                    </td>
                    <td style={{
                      padding: "16px 24px",
                      backgroundColor: "white",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#374151"
                    }}>
                      {parcel.from}
                    </td>
                    <td style={{
                      padding: "16px 24px",
                      backgroundColor: "white",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#374151"
                    }}>
                      {parcel.branch}
                    </td>
                    <td style={{
                      padding: "16px 24px",
                      backgroundColor: "white",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#374151"
                    }}>
                      {parcel.typeParcel}
                    </td>
                    <td style={{
                      padding: "16px 24px",
                      backgroundColor: "white",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#374151"
                    }}>
                      {parcel.weight}
                    </td>
                    <td style={{
                      padding: "16px 24px",
                      backgroundColor: "white",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#374151"
                    }}>
                      {Number(parcel.price).toLocaleString("en-US")}
                    </td>
                    <td style={{
                      padding: "16px 24px",
                      backgroundColor: "white",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#374151",
                      textAlign: "center"
                    }}>
                      <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                        <button
                          style={{
                            display: "flex",
                            alignItems: "center",
                            borderRadius: "8px",
                            background: "linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)",
                            padding: "8px 12px",
                            border: "none",
                            color: "white",
                            cursor: "pointer",
                            fontSize: "12px",
                            fontWeight: "600",
                            transition: "all 0.3s ease",
                            boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
                          }}
                          onMouseOver={(e) => {
                            e.target.style.background = "linear-gradient(135deg, #1D4ED8 0%, #1E40AF 100%)";
                            e.target.style.transform = "translateY(-1px)";
                          }}
                          onMouseOut={(e) => {
                            e.target.style.background = "linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)";
                            e.target.style.transform = "translateY(0)";
                          }}
                          onClick={() => handleViewPdf(parcel.id_parcel)}
                        >
                          👁️
                        </button>
                        <button
                          style={{
                            display: "flex",
                            alignItems: "center",
                            borderRadius: "8px",
                            background: "linear-gradient(135deg, #FB923C 0%, #F97316 100%)",
                            padding: "8px 12px",
                            border: "none",
                            color: "white",
                            cursor: "pointer",
                            fontSize: "12px",
                            fontWeight: "600",
                            transition: "all 0.3s ease",
                            boxShadow: "0 4px 12px rgba(251, 146, 60, 0.3)",
                          }}
                          onMouseOver={(e) => {
                            e.target.style.background = "linear-gradient(135deg, #F97316 0%, #EA580C 100%)";
                            e.target.style.transform = "translateY(-1px)";
                          }}
                          onMouseOut={(e) => {
                            e.target.style.background = "linear-gradient(135deg, #FB923C 0%, #F97316 100%)";
                            e.target.style.transform = "translateY(0)";
                          }}
                          onClick={() => handleSend(parcel)}
                        >
                          ✓
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
            ) : (
              <tr>
                <td colSpan="9" style={{
                  padding: "16px 24px",
                  backgroundColor: "white",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#6B7280",
                  textAlign: "center"
                }}>
                  No parcels found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default ParcelWaitSave;
