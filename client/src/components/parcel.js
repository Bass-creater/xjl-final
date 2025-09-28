// import React, { useState, useEffect , useCallback} from "react";
// import axios from "axios";

// const Parcel = ({ onDetailsChange }) => {
//   // const [parcels, setParcels] = useState([]);
//   const [rateChina, setRateChina] = useState(0);
//   const [rateThai, setRateThai] = useState(0);
//   const [detailsData, setDetailsData] = useState({
//     typeParcel: "",
//     width: "",
//     height: "",
//     length: "",
//     weight: "",
//     amount: "",
//     price: "",
//   });
//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setDetailsData((prevData) => {
//       const updatedData = { ...prevData, [name]: value };
//       console.log(updatedData);
//       if (onDetailsChange) {
//         onDetailsChange(updatedData);
//       }
//       return updatedData;
//     });
//   };


//   useEffect(() => {
//     const fetchRate = async () => {
//       try {
//         const response = await axios.get("http://localhost:1000/api/rate");
//         setRateChina(response.data.china);
//         setRateThai(response.data.thai);
//       } catch (error) {
//         console.error("Error fetching rateChina", error);
//       }
//     };
//     fetchRate();
//   }, []);

//   const handlePriceChange = (e) => {
//     const price = e.target.value;
//     setDetailsData((prevData) => ({
//       ...prevData,
//       price,
//     }));
//   };

//   console.log("Calculating price with data:", detailsData);

//   const calculatePrice = useCallback(() => {
//     let price = 0;
//     let cbm = 0;
//     const width = parseFloat(detailsData.width) || 0;
//     const length = parseFloat(detailsData.length) || 0;
//     const height = parseFloat(detailsData.height) || 0;
//     const weight = parseFloat(detailsData.weight) || 0;
//     const amount = parseFloat(detailsData.amount) || 1;
  
//     const size = width * length * height;
//     const ton = weight / 1000;
  
//     switch (detailsData.typeParcel) {
//       case "Genaral":
//         price = weight * 15000;
//         break;
//       case "Electrical":
//         cbm = size / 1000000;
//         price = cbm * 700 * rateChina;
//         break;
//       case "Big-But-Light":
//         cbm = size / 1000000;
//         price = cbm * 650 * rateChina;
//         break;
//       case "Lots-of-Weight":
//         price = ton * 1400 * rateChina;
//         break;
//       default:
//         price = 11;
//     }
  
//     price = Math.round(price);
  
//     console.log("Calculated price:", price);
  
//     // อัปเดต state ด้วยราคาใหม่ที่คำนวณแล้ว
//     setDetailsData((prevData) => ({
//       ...prevData,
//       price: price * amount,
//     }));
//   }, [detailsData, rateChina]);
  


//   useEffect(() => {
//     calculatePrice();
//   }, [
//     detailsData.typeParcel,
//     detailsData.weight,
//     detailsData.width,
//     detailsData.length,
//     detailsData.height,
//     detailsData.amount,
//     rateChina,
//     rateThai,
//     // calculatePrice
//   ]);

//   useEffect(() => {
//     console.log(detailsData);
//   }, [detailsData]);

//   return (
//     <div>
//       <div
//         id="admin-lao"
//         style={{
//           borderRadius: "10px",
//           overflow: "hidden",
//           boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
//         }}
//       >
//         <div style={gradientHeaderStyle("#0031e0", "#0ad5f5")}>
//           <h2 style={{ margin: 0, color: "white" }}>ข้อมูลพัสดุ</h2>
//         </div>
//         <div style={bodyStyle}>
//           <div
//             style={{
//               display: "grid",
//               gap: "15px",
//               gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
//             }}
//           >
//             <div>
//               <label style={labelStyle}>ประเภท :</label>
//               <select
//                 style={inputStyle}
//                 onChange={handleInputChange}
//                 value={detailsData.typeParcel}
//                 name="typeParcel"
//               >
//                 <option value="" disabled>
//                   เลือกประเภท
//                 </option>
//                 <option value="O"> O </option>
//                 <option value="A"> A </option>
//                 <option value="2A"> 2A</option>
//                 <option value="B"> B</option>
//                 <option value="C"> C</option>
//                 <option value="D"> D</option>
//                 <option value="E"> E</option>
//                 <option value="F"> F</option>
//                 <option value="G"> G</option>
//                 <option value="H"> H</option>
//                 <option value="I"> I</option>
//                 <option value="Genaral"> เครื่องใช้ทั่วไป</option>
//                 <option value="Electrical"> เครื่องใช้ไฟฟ้า</option>
//                 <option value="Big-But-Light"> เครื่องใหญ่น้ำหนักเบา</option>
//                 <option value="Lots-of-Weight"> น้ำหนักเยอะ</option>
//               </select>
//             </div>
//             <div>
//               <label style={labelStyle}>ขนาด(cm) :</label>
//               <div style={{ display: "flex", gap: "5px" }}>
//                 <input
//                   name="width"
//                   type="number"
//                   onChange={handleInputChange}
//                   value={detailsData.width}
//                   placeholder="กว้าง"
//                   style={{ ...inputStyle, flex: 1 }}
//                 />
//                 <input
//                   name="length"
//                   type="number"
//                   onChange={handleInputChange}
//                   value={detailsData.length}
//                   placeholder="ยาว"
//                   style={{ ...inputStyle, flex: 1 }}
//                 />
//                 <input
//                   name="height"
//                   type="number"
//                   onChange={handleInputChange}
//                   value={detailsData.height}
//                   placeholder="สูง"
//                   style={{ ...inputStyle, flex: 1 }}
//                 />
//               </div>
//             </div>
//             <div>
//               <label style={labelStyle}>น้ำหนัก(kg) :</label>
//               <input
//                 name="weight"
//                 type="number"
//                 onChange={handleInputChange}
//                 value={detailsData.weight}
//                 placeholder="น้ำหนัก"
//                 style={inputStyle}
//               />
//             </div>
//             <div>
//               <label style={labelStyle}>จำนวน :</label>
//               <input
//                 name="amount"
//                 type="number"
//                 onChange={handleInputChange}
//                 value={detailsData.amount}
//                 placeholder="จำนวน(ชิ้น)"
//                 style={inputStyle}
//               />
//             </div>
//             <div>
//               <label style={labelStyle}>ราคา :</label>
//               <input
//                 name="price"
//                 type="number"
//                 onChange={handlePriceChange}
//                 onBlur={calculatePrice}
//                 value={detailsData.price}
//                 placeholder="ราคา"
//                 style={inputStyle}
//               />
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// const gradientHeaderStyle = (color1, color2) => ({
//   background: `linear-gradient(to right, ${color1}, ${color2})`,
//   padding: "15px 20px",
//   borderRadius: "20px 20px 0 0",
//   color: "white",
// });

// const bodyStyle = {
//   backgroundColor: "#f9f9f9",
//   padding: "20px",
// };

// const labelStyle = {
//   display: "block",
//   marginBottom: "5px",
//   fontWeight: "bold",
//   color: "#333",
// };

// const inputStyle = {
//   width: "100%",
//   padding: "8px",
//   borderRadius: "5px",
//   border: "1px solid #ccc",
//   boxSizing: "border-box",
// };

// export default Parcel;
