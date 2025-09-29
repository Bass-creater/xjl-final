import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import useAuth from "../hooks/useAuth";

const ParcelBranch = () => {
  const { username } = useAuth();
  const [parcels, setParcels] = useState([]);
  const [idParcel, setIdParcel] = useState("");
  const [parcelRes, setParcelRes] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchParcelsSave = async () => {
      try {
        const response = await axios.post(
          "https://xjllao.com/v1/api/parcelBranch",
          {
            username: username,
          }
        );
        setParcels(response.data);
      } catch (error) {
        console.error("Error fetching data", error);
      }
    };

    if (username) {
      fetchParcelsSave();
    }
  }, [username]);

  // ฟังก์ชันหลักสำหรับการค้นหาพัสดุ
  const searchParcel = async (parcelId) => {
    if (parcelId.length >= 5) {
      try {
        const response = await axios.post(
          "https://xjllao.com/v1/api/parcel/search",
          {
            id_parcel: parcelId,
            username: username,
          }
        );
        setParcelRes(response.data);
        setError("");
      } catch (error) {
        console.error(error);
        setParcelRes(null);
        setError("Parcel Not Found | This product was not delivered.");

        try {
          const saveResponse = await axios.post(
            "https://xjllao.com/v1/api/parcel/saveerror",
            {
              id_parcel: parcelId,
              username: username,
            }
          );
          console.log("Failed parcel saved:", saveResponse.data);
        } catch (saveError) {
          console.error("Error Saving!", saveError);
        }
      }
    }
  };

  // รองรับการ paste
  const handlePaste = async (e) => {
    const pastedData = e.clipboardData.getData("Text");
    setIdParcel(pastedData);
    await searchParcel(pastedData);
  };

  // รองรับการแสกนบาร์โค้ด และการพิมพ์
  const handleInputChange = async (e) => {
    const inputValue = e.target.value;
    setIdParcel(inputValue);
    
    // หน่วงเวลาเล็กน้อยเพื่อให้เครื่องสแกนบาร์โค้ดสแกนเสร็จ
    setTimeout(async () => {
      if (inputValue === e.target.value) {
        await searchParcel(inputValue);
      }
    }, 300);
  };

  const handleReceive = async () => {
    // console.log(idParcel);
    try {
      const responseUpdate = await axios.post(
        "https://xjllao.com/v1/api/updatereceive",
        { id_parcel: idParcel }
      );
      if (responseUpdate.status === 200) {
        window.location.reload();
      }
    } catch (error) {
      console.error("Error to Receive Parcel", error);
    }
  };

  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  });

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleReceive();
    }
  };

  return (
    <div className="flex items-center justify-center flex-col">
      <div className="bg-[#732dcf] px-6 py-4 pb-6 rounded-lg w-full xl:w-[70%] mb-10">
        <h1 style={{ fontSize: "16px", margin: "0", color: "#fff" }}>
          ຄົ້ນຫາລາຍການພັດດຸ
        </h1>

        <div className="flex mt-2 gap-2">
          <input
            type="text"
            value={idParcel}
            onChange={handleInputChange}
            onPaste={handlePaste}
            onKeyDown={handleKeyDown} // Add the keydown event listener
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            placeholder="Enter Number Parcel or Scan Barcode."
            ref={inputRef}
          />
          <button
            className="bg-white rounded-lg px-4 text-[#732dcf] font-semibold text-md duration-200 hover:px-6 hover:duration-200"
            onClick={handleReceive}
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

      {error && <div style={{ color: "red" }}>{error}</div>}
      {parcelRes && (
        <table className="w-full xl:w-[70%] table-auto">
          <thead>
            <tr className="bg-gray-200 text-gray-800 ">
              <th className="border px-4 py-2 text-start w-60">ID</th>
              <th className="border px-4 py-2">Weight (kg)</th>
              <th className="border px-4 py-2">Price (LAK)</th>
              <th className="border px-4 py-2 w-20">Amount</th>
            </tr>
          </thead>
          <tbody className="bg-green-500 text-white">
            <tr>
              <td className="border px-4 py-2">{parcelRes.id_parcel}</td>
              <td className="border px-4 py-2 text-center">
                {parcelRes.weight}
              </td>
              <td className="border px-4 py-2 text-center">
                {parcelRes.price}
              </td>
              <td className="border px-4 py-2 text-center">
                {parcelRes.amount}
              </td>
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ParcelBranch;
