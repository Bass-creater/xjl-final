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
          "http://localhost:1000/api/parcels",
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
        "http://localhost:1000/api/parcel",
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
    if (selectedParcels.size === parcels.length) {
      setSelectedParcels(new Set());
    } else {
      const allParcelIds = parcels.map((parcel) => parcel.id_parcel);
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
        "http://localhost:1000/api/update-parcel-status",
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
      {/* <h1>Total Parcels: {totalParcels}</h1> */}
      <div className="bg-[#732dcf] px-6 py-4 pb-6 rounded-lg">
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
            className="bg-white rounded-lg px-4 text-[#732dcf] font-semibold text-md duration-200 hover:px-6 hover:duration-200"
          >
            save
          </button>
        </form>
      </div>

      <div className="flex items-end justify-end">
        <button
          onClick={handleSelectAll}
          className="px-4 py-2 bg-orange-600 text-white rounded mt-6 text-sm"
        >
          {selectedParcels.size === parcels.length
            ? "ຍົກເລີກການເລືອກທັງໝົດ"
            : "ເລືອກທັງໝົດ"}
        </button>
      </div>

      <table className="mt-2 w-full text-sm text-left rtl:text-right text-gray-500">
        <thead className="text-xs text-gray-700 uppercase bg-gray-300">
          <tr>
            <th scope="col" className="px-6 py-3 w-32">
              No
            </th>
            <th scope="col" className="px-6 py-3">
              ID PARCEL
            </th>
            <th scope="col" className="px-6 py-3">
              TO
            </th>
            <th scope="col" className="px-6 py-3">
              Send
            </th>
          </tr>
        </thead>
        <tbody>
          {parcels.length > 0 ? (
            parcels
              .filter((parcel) => parcel.status === "origin")
              .map((parcel, index) => (
                <tr className="bg-white border-b" key={parcel.id_parcel}>
                  {/* แสดงลำดับ */}
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                    {parcel.id_parcel}
                  </td>
                  <td className="px-6 py-4 text-gray-900">{parcel.to}</td>
                  <td className="px-6 py-4 text-gray-900">
                    <input
                      type="checkbox"
                      checked={selectedParcels.has(parcel.id_parcel)}
                      onChange={(event) =>
                        handleParcelSelect(event, parcel.id_parcel)
                      }
                    />
                  </td>
                </tr>
              ))
          ) : (
            <tr>
              <td colSpan="4" className="px-6 py-4 text-center">
                No parcels found with status 'origin'.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="flex items-end justify-end">
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-orange-600 text-white rounded mt-6 text-sm"
        >
          Update
        </button>
      </div>
    </div>
  );
};

export default Spread;
