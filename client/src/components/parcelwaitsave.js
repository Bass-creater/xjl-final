import axios from "axios";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ParcelWaitSave = () => {
  const [parcels, setParcels] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchParcels = async () => {
      try {
        const response = await axios.get("https://xjllao.com/v1/api/parcelswait");
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
        "https://xjllao.com/v1/api/parcel/updatebranch",
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
    const pdfUrl = `https://xjllao.com/v1/pdf/${id_parcel}.pdf`;
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
            className="bg-blue-500 py-2 px-4 rounded-md text-white"
            onClick={handleSendAll}
          >
            Send All Parcels
          </button>
        </div>
      )}
      <table className="mt-6 w-full text-sm text-left rtl:text-right text-gray-500">
        <thead className="text-xs text-start text-white uppercase bg-blue-500">
          <tr>
            <th scope="col" className="px-6 py-3 text-start w-28">
              No
            </th>
            <th scope="col" className="px-6 py-3 text-start">
              ID PARCEL
            </th>
            <th scope="col" className="px-6 py-3 text-start">
              Date | Time
            </th>
            <th scope="col" className="px-6 py-3 text-start">
              From
            </th>
            <th scope="col" className="px-6 py-3 text-start">
              Branch
            </th>
            <th scope="col" className="px-6 py-3 text-start">
              Type
            </th>
            <th scope="col" className="px-6 py-3 text-start">
              Weight (kg)
            </th>
            <th scope="col" className="px-6 py-3 text-start w-40">
              Price
            </th>
            <th scope="col" className="px-6 py-3 text-end">
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
                  className="bg-white border-b"
                  key={`${parcel.id_parcel}-${index}`}
                >
                  {/* แสดงลำดับ */}
                  <td className="px-6 py-4 font-medium text-start text-gray-900 whitespace-nowrap">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 font-medium text-start text-gray-900 whitespace-nowrap">
                    {parcel.id_parcel}
                  </td>
                  <td className="px-6 py-4 font-medium text-start text-gray-900 whitespace-nowrap">
                    {parcel.time}
                  </td>
                  <td className="px-6 py-4 text-start text-gray-900">
                    {parcel.from}
                  </td>
                  <td className="px-6 py-4 text-start text-gray-900">
                    {parcel.branch}
                  </td>
                  <td className="px-6 py-4 text-start text-gray-900">
                    {parcel.typeParcel}
                  </td>
                  <td className="px-6 py-4 text-start text-gray-900">
                    {parcel.weight}
                  </td>
                  <td className="px-6 py-4 text-start text-gray-900">
                    {Number(parcel.price).toLocaleString("en-US")}
                  </td>
                  <td className="px-6 py-4 text-start text-gray-900 flex gap-4 justify-end">
                    {/* ปุ่มที่ต้องการ */}
                    <button
                      className="flex items-center rounded-md bg-white from-slate-800 to-slate-700 py-2 px-4 border border-[#4842ed] text-center text-sm text-white transition-all shadow-sm focus:bg-slate-700 focus:shadow-none active:bg-slate-700 hover:bg-slate-700 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                      type="button"
                      // onClick={() => openPDF(parcel.id_parcel)}
                      onClick={() => handleViewPdf(parcel.id_parcel)}
                    >
                      {/* ไอคอน */}
                      <svg
                        className="w-6 h-6 text-[#4842ed]"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke="currentColor"
                          strokeWidth="2"
                          d="M21 12c0 1.2-4.03 6-9 6s-9-4.8-9-6c0-1.2 4.03-6 9-6s9 4.8 9 6Z"
                        />
                        <path
                          stroke="currentColor"
                          strokeWidth="2"
                          d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                        />
                      </svg>
                    </button>
                    <button
                      className="flex items-center rounded-md bg-[#4842ed] from-slate-800 to-slate-700 py-2 px-4 border border-transparent text-center text-sm text-white transition-all shadow-sm hover:shadow-lg focus:bg-slate-700 focus:shadow-none active:bg-slate-700 hover:bg-slate-700 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                      type="button"
                      onClick={() => handleSend(parcel)}
                    >
                      <svg
                        className="w-6 h-6 text-gray-800 dark:text-white"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12 2c-.791 0-1.55.314-2.11.874l-.893.893a.985.985 0 0 1-.696.288H7.04A2.984 2.984 0 0 0 4.055 7.04v1.262a.986.986 0 0 1-.288.696l-.893.893a2.984 2.984 0 0 0 0 4.22l.893.893a.985.985 0 0 1 .288.696v1.262a2.984 2.984 0 0 0 2.984 2.984h1.262c.261 0 .512.104.696.288l.893.893a2.984 2.984 0 0 0 4.22 0l.893-.893a.985.985 0 0 1 .696-.288h1.262a2.984 2.984 0 0 0 2.984-2.984V15.7c0-.261.104-.512.288-.696l.893-.893a2.984 2.984 0 0 0 0-4.22l-.893-.893a.985.985 0 0 1-.288-.696V7.04a2.984 2.984 0 0 0-2.984-2.984h-1.262a.985.985 0 0 1-.696-.288l-.893-.893A2.984 2.984 0 0 0 12 2Zm3.683 7.73a1 1 0 1 0-1.414-1.413l-4.253 4.253-1.277-1.277a1 1 0 0 0-1.415 1.414l1.985 1.984a1 1 0 0 0 1.414 0l4.96-4.96Z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
          ) : (
            <tr>
              <td colSpan="8" className="px-6 py-4 text-center">
                No parcels found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
export default ParcelWaitSave;
