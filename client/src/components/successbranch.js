import React, { useEffect, useState } from "react";
import useAuth from "../hooks/useAuth";
import axios from "axios";
const Successbranch = () => {
  const { username } = useAuth();
  const [parcels, setParcels] = useState([]);
  const [findParcel, setFindParcel] = useState("");
  const [parcelResponse, setParcelResponse] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSuccess = async () => {
      try {
        const response = await axios.post(
          "http://localhost:1000/api/parcelBranch",
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
      fetchSuccess();
    }
  }, [username]);
  const handleSeachPaste = async (e) => {
    const pasted = e.clipboardData.getData("Text");
    setFindParcel(pasted);
    setParcels([]);

    if (pasted.length >= 5) {
      try {
        const response = await axios.post(
          "http://localhost:1000/api/parcel/searchsuccess",
          {
            id_parcel: pasted,
            username: username,
          }
        );
        setParcelResponse(response.data);
        setError("");
      } catch (error) {
        console.error("Error to Search | Try again", error);
        setParcelResponse(null);
        setError("This ID number was not found.");
      }
    }
  };

  const handleSuccess = async () => {
    const id_parcel = parcelResponse.id_parcel;
    try {
      const success = await axios.post("http://localhost:1000/api/updatesuccess", {
        id_parcel: id_parcel,
      });
      if (success.status === 200) {
        window.location.reload();
      }
    } catch (error) {
      console.error("Error to change status | unsuccessful", error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSuccess();
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
            value={findParcel}
            onKeyDown={handleKeyDown}
            // onChange={(e) => setIdParcel(e.target.value)}
            onPaste={handleSeachPaste}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            placeholder="Enter Number Parcel."
          />
          <button
            className="bg-white rounded-lg px-4 text-[#732dcf] font-semibold text-md duration-200 hover:px-6 hover:duration-200"
            type="button"
            onClick={handleSuccess}
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
      {parcelResponse ? (
        <>
          <p>ຢືນຢັນການຈັດສົ່ງສິນຄ້າໃຫ້ລູກຄ້າ</p>
          <table className="w-ful xl:w-[70%]">
            <thead>
              <tr className="bg-gray-200 text-gray-800">
                <th className="border px-4 py-2 text-start w-60">ID</th>
                <th className="border px-4 py-2">Weight (kg)</th>
                <th className="border px-4 py-2">Price (LAK)</th>
                <th className="border px-4 py-2 w-20">Amount</th>
                <th className="border px-4 py-2 w-20">Submit</th>
              </tr>
            </thead>
            <tbody className="bg-green-500 text-white">
              <tr key={parcelResponse.id_parcel}>
                <td className="border px-4 py-2">{parcelResponse.id_parcel}</td>
                <td className="border px-4 py-2 text-center">
                  {parcelResponse.weight}
                </td>
                <td className="border px-4 py-2 text-center">
                  {parcelResponse.price}
                </td>
                <td className="border px-4 py-2 text-center">
                  {parcelResponse.amount}
                </td>
                <td className="border px-4 py-2 text-center">
                  <button
                    className="flex items-center rounded-md bg-[#fff] from-slate-800 hover:text-white to-slate-700 py-2 px-4 border border-transparent text-center text-sm text-white transition-all shadow-sm hover:shadow-lg focus:bg-slate-700 hover:text-white focus:shadow-none active:bg-slate-700 hover:bg-green-700 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                    type="button"
                    onClick={handleSuccess}
                  >
                    <svg
                      className="w-6 h-6 text-green-600 hover:text-white"
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
                        d="m8.032 12 1.984 1.984 4.96-4.96m4.55 5.272.893-.893a1.984 1.984 0 0 0 0-2.806l-.893-.893a1.984 1.984 0 0 1-.581-1.403V7.04a1.984 1.984 0 0 0-1.984-1.984h-1.262a1.983 1.983 0 0 1-1.403-.581l-.893-.893a1.984 1.984 0 0 0-2.806 0l-.893.893a1.984 1.984 0 0 1-1.403.581H7.04A1.984 1.984 0 0 0 5.055 7.04v1.262c0 .527-.209 1.031-.581 1.403l-.893.893a1.984 1.984 0 0 0 0 2.806l.893.893c.372.372.581.876.581 1.403v1.262a1.984 1.984 0 0 0 1.984 1.984h1.262c.527 0 1.031.209 1.403.581l.893.893a1.984 1.984 0 0 0 2.806 0l.893-.893a1.985 1.985 0 0 1 1.403-.581h1.262a1.984 1.984 0 0 0 1.984-1.984V15.7c0-.527.209-1.031.581-1.403Z"
                      />
                    </svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </>
      ) : parcels.length > 0 ? (
        <>
          <p className="text-start">ຢືນຢັນການຈັດສົ່ງສິນຄ້າໃຫ້ລູກຄ້າ</p>
          <table className="w-full xl:w-[70%]">
            <thead>
              <tr>
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
                  width: "80px",
                }}>No.</th>
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
                  width: "240px",
                }}>ID</th>
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
                }}>Weight (kg)</th>
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
                }}>Date</th>
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
                }}>Price (LAK)</th>
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
                }}>Amount</th>
                {/* <th className="border px-4 py-2 w-20">Submit</th> */}
              </tr>
            </thead>
            <tbody className="bg-white text-gray-800">
              {parcels
                .slice()
                .sort((a, b) => {
                  if (a.status === "202" && b.status !== "202") return -1;
                  if (a.status !== "202" && b.status === "202") return 1;
                  return 0;
                })
                .map((parcel, index) => (
                  <tr
                    key={parcel.id_parcel}
                    className={`border ${
                      parcel.status === "success" ? "bg-blue-200" : ""
                    }`}
                  >
                    <td className="border py-2 text-center">{index + 1}</td>
                    <td className="border px-4 py-2">{parcel.id_parcel}</td>
                    <td className="border px-4 py-2 text-center">
                      {parcel.weight}
                    </td>
                    <td className="border px-4 py-2 text-center">
                      {new Date(parcel.time).toLocaleDateString("en-GB")}
                    </td>
                    <td className="border px-4 py-2 text-center">
                      {parcel.price?.toLocaleString()}
                    </td>
                    <td className="border px-4 py-2 text-center">
                      {parcel.amount}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </>
      ) : (
        <div>
          <h1>No Parcel Data Please try again!</h1>
        </div>
      )}
    </div>
  );
};

export default Successbranch;
