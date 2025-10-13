const User = require("../model/users");
const Parcel = require("../model/parcel");
const { sequelize } = require("../db");
const ParcelDetail = require("../model/saveData");
const SaveTime = require("../model/saveTime");
const SaveError = require("../model/saveerror");
const Rate = require("../model/rate");
const Uuid = require("../model/uuid");
const moment = require("moment-timezone");
const bcrypt = require("bcryptjs");
const { Op } = require("sequelize");
const jwt = require("jsonwebtoken");
const puppeteer = require("puppeteer");
const path = require("path");
const XLSX = require("xlsx");
const { v4: uuidv4 } = require("uuid");
const multer = require("multer");

const fs = require("fs");

// Setup associations
ParcelDetail.hasOne(SaveTime, {
  foreignKey: 'id_parcel',
  sourceKey: 'id_parcel',
  as: 'saveTime'
});

SaveTime.belongsTo(ParcelDetail, {
  foreignKey: 'id_parcel',
  targetKey: 'id_parcel',
  as: 'parcelDetail'
});

exports.signupUser = async (req, res) => {
  const { username, email, passwrd } = req.body;

  try {
    let user = await User.findOne({ where: { email } });
    if (user) {
      return res.status(400).json({ message: "Email already exists!" });
    }
    user = await User.findOne({ where: { username } });
    if (user) {
      return res.status(400).json({ message: "Username already exists!" });
    }

    const hashedPassword = await bcrypt.hash(passwrd, 16);

    const new_user = await User.create({
      username,
      email,
      passwrd: hashedPassword,
    });

    res.status(201).json({ message: "Signup Successful!", redirect: "/login" });
  } catch (err) {
    console.error("Error in signup:", err);
    res.status(500).json({ message: "Error 500 | Try again " });
  }
};

exports.idParcel = async (req, res) => {
  const { id_parcel, from } = req.body;

  try {
    let parcel = await Parcel.findOne({ where: { id_parcel } });
    if (parcel) {
      return res.status(400).json({ message: "ID Parcel already!" });
    }

    const originTime = moment
      .tz("Asia/Vientiane")
      .format("YYYY-MM-DD HH:mm:ss");

    // Generate UUID for this parcel
    const parcelUuid = uuidv4();

    await Parcel.create({
      id_parcel,
      from,
      uuid: parcelUuid
    });

    await SaveTime.create({
      id_parcel,
      from,
      origin: originTime,
      export: "",
      acceptorigin: "",
      spread: "",
      branch: "",
      success: "",
    });

    res.status(201).json({ message: "Save Parcel Successful!", redirect: "" });
  } catch (err) {
    console.error("500 | ERROR Try again", err);
    res.status(500).json({ message: "Error 500 | Try again ", err });
  }
};

exports.getAllParcels = async (req, res) => {
  const { from } = req.body;
  try {
    const parcels = await Parcel.findAll({
      where: {
        from: from,
      },
    });
    res.status(200).json(parcels);
  } catch (error) {
    console.error("Error fetching parcels: ", error);
    res.status(500).json({ message: "500 ERROR fetch percels | Try again!" });
  }
};

exports.parcelsWait = async (req, res) => {
  try {
    console.log("🔍 parcelsWait: Searching for parcels with status 'accepted'");
    const parcelswait = await ParcelDetail.findAll({
      where: { status: "accepted" },
    });

    console.log("📦 Found parcels:", parcelswait.length);

    if (!parcelswait || parcelswait.length === 0) {
      console.log("❌ No parcels found with status 'accepted'");
      return res
        .status(404)
        .json({ message: "No parcels found with status 'accepted'" });
    }
    res.status(200).json(parcelswait);
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ message: "Error fetching Parcel: " + error.message });
  }
};

exports.countParcels = async (req, res) => {
  const { from } = req.body;

  if (!from) {
    return res.status(400).json({ message: "400 ERROR | 'from' is required!" });
  }
  try {
    const count = await Parcel.count({
      where: { from },
    });

    if (count === 0) {
      return res.status(404).json({ message: "No parcels found.", total: 0 });
    }
    res.status(200).json({ total: count });
  } catch (error) {
    res.status(500).json({ message: "500 ERROR Count parcels | Try again!" });
  }
};
exports.countParcelsWarehouse = async (req, res) => {
  try {
    const count = await ParcelDetail.count({
      where: {
        status: "accepted",
      },
    });
    res.status(200).json({ total: count });
  } catch (error) {
    res.status(500).json({ message: "500 ERROR Count parcels | Try again!" });
  }
};
exports.countParcelsBranch = async (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res
      .status(400)
      .json({ message: "400 ERROR: Username is required!" });
  }
  try {
    const count = await ParcelDetail.count({
      where: {
        branch: username,
        status: "201",
      },
    });
    res.status(200).json({ total: count });
  } catch (error) {
    res.status(500).json({ message: "500 ERROR Count parcels | Try again!" });
  }
};

exports.loginUser = async (req, res) => {
  const { email, passwrd } = req.body;

  try {
    let user = await User.findOne({
      where: {
        [Op.or]: [{ email: email }, { username: email }],
      },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid username or email!" });
    }

    const isMatch = await bcrypt.compare(passwrd, user.passwrd);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect Password!" });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({
      token,
      message: "Login Successful!",
      username: user.username,
      role: user.role,
      branch: user.branch,
      // credit: user.credit,
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Server Error | Try again :<" });
  }
};

exports.rate = async (req, res) => {
  try {
    const rate = await Rate.findOne({
      attributes: ["china", "thai"],
    });
    if (!rate) {
      return res.status(404).json({ message: "Rate not found" });
    }
    res.status(200).json(rate);
  } catch (error) {
    res.status(500).json({ message: "Error fetching rate: " + error.message });
  }
};
exports.smallParcels = async (req, res) => {
  const { parcels_id } = req.body;
  try {
    const existingParcel = await Parcel.findOne({
      where: { id_parcel: parcels_id, status: "accepted" },
      attributes: ["from"],
    });
    if (!existingParcel) {
      return res.status(404).json({ message: "Parcel not found in OldParcelTable" });
    }
    res.status(200).json(existingParcel);
    
  } catch (error) {
    res.status(500).json({ message: "Error fetching small parcels: " + error.message });
  }
};

exports.smallParcelsSave = async (req, res) => {
  try {
    const { parcels_id, branch } = req.body;
    console.log("📦 START smallParcelsSave", { parcels_id, branch });

    // ตรวจสอบว่า parcels_id เป็น array หรือไม่
    if (!Array.isArray(parcels_id)) {
      return res.status(400).json({ message: "parcels_id ต้องเป็น array" });
    }

    if (!branch) {
      return res.status(400).json({ message: "branch ต้องระบุ" });
    }

    // ตรวจสอบสาขา
    const userBranch = await User.findOne({ where: { branch } });
    if (!userBranch) {
      return res.status(404).json({ message: "ไม่พบสาขานี้ในระบบ" });
    }

    const results = [];

    // Loop ผ่าน parcels_id และอัปเดตแต่ละ parcel
    for (const parcelData of parcels_id) {
      try {
        // ตรวจสอบว่า parcelData มี id หรือไม่
        if (!parcelData.id) {
          console.log("⚠️ parcelData ไม่มี id:", parcelData);
          results.push({
            id: parcelData.id || 'unknown',
            status: "error",
            message: "ไม่มี id"
          });
          continue;
        }

        const parcelId = parcelData.id;
        console.log(`🔄 Processing parcel ID: ${parcelId}`);

        // อัปเดต ParcelDetail โดยตรง
        const updated = await ParcelDetail.update(
          {
            status: "201",
            branch: branch,
            type: "delivery",
            time: new Date()
          },
          {
            where: { id_parcel: parcelId }
          }
        );

        if (updated && updated[0] > 0) {
          console.log(`✅ Successfully updated parcel ${parcelId}`);
          results.push({
            id: parcelId,
            status: "success",
            message: "อัปเดตสำเร็จ"
          });
        } else {
          console.log(`❌ Failed to update parcel ${parcelId} - not found`);
          results.push({
            id: parcelId,
            status: "error",
            message: "ไม่พบ parcel ในระบบ"
          });
        }

      } catch (error) {
        console.error(`❌ Error processing parcel ${parcelData.id}:`, error);
        results.push({
          id: parcelData.id || 'unknown',
          status: "error",
          message: error.message
        });
      }
    }

    console.log("✅ smallParcelsSave completed", {
      totalProcessed: results.length,
      branch: branch,
      results: results
    });

    res.status(200).json({
      message: "Small parcels processed successfully!",
      data: {
        branch: branch,
        totalProcessed: results.length,
        results: results
      }
    });

  } catch (error) {
    console.error("❌ Error in smallParcelsSave:", error);
    res.status(500).json({ 
      message: "Error processing small parcels: " + error.message 
    });
  }
};
exports.saveData = async (req, res) => {
  try {
    const { parcel, detail } = req.body;
    console.log("📦 START saveData", parcel?.id_parcel);

    const existingParcel = await Parcel.findOne({
      where: { id_parcel: parcel.id_parcel, status: "accepted" },
      attributes: ["from"],
    });
    if (!existingParcel) {
      console.log("❌ Parcel not found with accepted status");
      return res
        .status(404)
        .json({ message: "Parcel not found in OldParcelTable" });
    }

    if (existingParcel) {
      const mainParcel = parcel;
      const fromValue = existingParcel.from;

      const dataExpress = {
        id_parcel: mainParcel.id_parcel || "-",
        from: fromValue || "-",
        status: "accepted",
        type_tel: mainParcel.type_tel || "-",
        tel: mainParcel.tel || "-",
        type: mainParcel.type || "-",
        note: mainParcel.note || "-",
        branch: mainParcel.branch || "-",
        typeParcel: detail.typeParcel || "-",
        width: detail.width || 0,
        length: detail.length || 0,
        height: detail.height || 0,
        weight: detail.weight || 0,
        amount: detail.amount || 0,
        price: detail.price || 0,
        time: detail.time || new Date().toISOString(),
      };

      // ข้ามการหักเครดิตไปก่อน - เก็บเฉพาะการคำนวณราคา
      console.log("💰 Price calculated:", dataExpress.price);
      console.log("🏪 Branch/Customer:", dataExpress.branch);
      console.log("⏭️ Skipping credit deduction for now");

      console.log(dataExpress);

      const updated = await ParcelDetail.update(dataExpress, {
        where: { id_parcel: mainParcel.id_parcel },
      });
      if (updated) {
        // Comment: ปิดการลบ Parcel record เพื่อให้ SaveTime record ยังคงอยู่
        // await Parcel.destroy({
        //   where: { id_parcel: parcel.id_parcel },
        // });

        function imageToBase64(imagePath) {
          const image = fs.readFileSync(imagePath);
          return image.toString("base64");
        }

        const getCurrentDateTime = () => {
          const now = new Date();
          const options = {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          };
          return now.toLocaleDateString("en-US", options);
        };

        const base64Image = imageToBase64(path.join(__dirname, "logo.jpg"));

        const priceFormatted = Number(detail.price).toLocaleString("en-US");
        const htmlContent = `<html lang="th">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Parcel Information</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      @import url("https://fonts.googleapis.com/css2?family=Noto+Sans+Lao:wght@100..900&display=swap");

      body {
        font-family: "Noto Sans Lao", serif;
      }
    </style>
  </head>
  <body class="flex justify-center items-center p-2 pt-0">
    <div
      class="container mx-auto bg-white w-full h-full flex flex-col items-center"
    >
      <!-- โลโก้ -->
      <div class="w-full flex justify-center my-2">
        <img
          src="data:image/jpeg;base64,${base64Image}"
          alt="Logo"
          class="w-1/3"
        />
      </div>

      <!-- ข้อมูลผู้ส่งและผู้รับ -->
      <div
        class="flex justify-between w-full text-[10px] font-medium text-gray-800 ">
        <p><strong>ຕົ້ນທາງ :</strong> ${fromValue}</p>
        <p><strong>ປາຍທາງ :</strong> ${mainParcel.branch}</p>
      </div>

      <!-- รหัสพัสดุ -->
      <p class="text-[15px] font-semibold text-gray-900 my-4">
        ${mainParcel.id_parcel}
      </p>

      <p class="text-[10px] font-medium text-gray-900">
        ${getCurrentDateTime()}
      </p>

      <!-- ตารางข้อมูลพัสดุ -->
      <table class="table-auto w-full text-[7px] mt-[20px] border border-gray-500 rounded-lg overflow-hidden">
        <thead class="bg-gray-300 text-gray-800">
          <tr>
            <th class="py-[2px] px-2 text-center">Width (cm)</th>
            <th class="py-[2px] px-2 text-center">Length (cm)</th>
            <th class="py-[2px] px-2 text-center">Height (cm)</th>
            <th class="py-[2px] px-2 text-center">Weight (kg)</th>
          </tr>
        </thead>
        <tbody>
          <tr class="even:bg-gray-100 odd:bg-white">
            <td class="py-[10px] px-2 text-center">${detail.width}</td>
            <td class="py-[10px] px-2 text-center">${detail.length}</td>
            <td class="py-[10px] px-2 text-center">${detail.height}</td>
            <td class="py-[10px] px-2 text-center">${detail.weight}</td>
          </tr>
        </tbody>
      </table>

      <!-- จำนวนและราคารวม -->
      <div
        class="w-full mt-[1vh] text-right text-[10px] font-medium text-gray-900"
      >
        <p class="mb-2"><strong>ຈຳນວນ :</strong> ${detail.amount}</p>
        <p><strong>ລາຄາລວມ :</strong> ${priceFormatted}</p>
      </div>
      <footer
        class="w-full text-[7px] mt-[10px] border border-gray-500 rounded-lg p-2"
      >
        <p class="font-semibold text-[6px]">ໝາຍເຫດ :</p>
        ${mainParcel.note}
      </footer>
    </div>
  </body>
</html>
`;
        try {
          const browser = await puppeteer.launch({
            headless: true,
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
          });
          const page = await browser.newPage();
          await page.setContent(htmlContent);
          const pdfFileName = `${mainParcel.id_parcel}.pdf`;
          const pdfPath = path.join(
            __dirname,
            "../../client/public/pdf",
            pdfFileName
          );
          await page.pdf({
            path: pdfPath,
            // format: "A4",
            width: "7.5cm",
            height: "10cm",
            printBackground: true,
            margin: { top: "1mm", bottom: "1mm", left: "1mm", right: "1mm" },
          });

          console.log(`PDF saved as ${pdfPath}`);

          await browser.close();
        } catch (pdfErr) {
          console.error("❌ PDF Generate Error:", pdfErr);
        }

        res.status(200).json({
          message: "Parcel updated successfully!",
          data: dataExpress,
        });
      } else {
        res.status(404).json({ message: "ParcelDetail not found for update" });
      }
    } else {
      res.status(404).json({ message: "Parcel not found in OldParcelTable" });
    }
  } catch (error) {
    console.error("Error Save | Try again", error);
    res.status(500).json({ message: error.message || "Unknown error" });
  }
};

exports.checkIdInTables = async (req, res) => {
  const id = req.params.id;

  try {
    const foundInSavetime = await SaveTime.findOne({
      where: { id_parcel: id },
    });

    if (!foundInSavetime) {
      return res
        .status(404)
        .json({ message: "No data found for this id_parcel" });
    }

    const columns = [
      "origin",
      "export",
      "acceptedorigin",
      "spread",
      "branch",
      "success",
    ];

    let lastColumn = null;
    for (let i = columns.length - 1; i >= 0; i--) {
      if (foundInSavetime[columns[i]]) {
        lastColumn = columns[i];
        break;
      }
    }

    if (!lastColumn) {
      return res.status(404).json({ message: "No non-empty columns found" });
    }

    return res.json({ lastColumn });
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Database query failed", message: err.message });
  }
};

exports.updateParcelStatus = async (req, res) => {
  const { parcelIds } = req.body;

  try {
    const result = await Parcel.update(
      { status: "export" },
      {
        where: {
          id_parcel: parcelIds,
        },
      }
    );

    if (result[0] === 0) {
      return res.status(404).json({ message: "Parcel not found to update" });
    }

    const exportTime = moment
      .tz("Asia/Vientiane")
      .format("YYYY-MM-DD HH:mm:ss");

    const updateTimeExport = await SaveTime.update(
      {
        export: exportTime,
      },
      {
        where: {
          id_parcel: parcelIds,
        },
      }
    );

    if (updateTimeExport[0] === 0) {
      return res.status(404).json({ message: "SaveTime not found ID parcel" });
    }

    res.status(200).json({ message: "Parcel status updated successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error while updating parcel status" });
  }
};

exports.listProduct = async (req, res) => {
  const { to } = req.body;
  try {
    const products = await Parcel.findAll({
      where: { status: "export", to: to },
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch products" });
  }
};
exports.listProductOrigin = async (req, res) => {
  const { from } = req.body;
  try {
    const products = await Parcel.findAll({
      where: { status: "export", from: from },
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch products" });
  }
};

exports.percelInStored = async (req, res) => {
  try {
    const parcelWareHouse = await ParcelDetail.findAll({
      where: { status: "accepted" },
    });
    res.json(parcelWareHouse);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch Parcel!" });
  }
};

exports.saveParcelStatus = async (req, res) => {
  const { id_parcel, from, status } = req.body;

  try {
    const newParcel = await ParcelDetail.create({
      id_parcel,
      from,
      status,
    });

    const acceptedorigin = moment
      .tz("Asia/Vientiane")
      .format("YYYY-MM-DD HH:mm:ss");

    const savetime = await SaveTime.update(
      {
        acceptorigin: acceptedorigin,
      },
      {
        where: {
          id_parcel: id_parcel,
        },
      }
    );

    if (savetime[0] === 0) {
      return res.status(404).json({ message: "SaveTime not found ID parcel" });
    }

    res.status(200).json({
      message: "Parcel information saved successfully",
      data: newParcel,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error saving parcel information" });
  }
};

exports.updateBranch = async (req, res) => {
  const { id_parcel, status } = req.body;

  console.log("🔄 updateBranch called with:", { id_parcel, status });

  try {
    // อัปเดต ParcelDetail status
    const reUpdate = await ParcelDetail.update(
      { status },
      {
        where: {
          id_parcel,
        },
      }
    );
    console.log("📦 ParcelDetail updated:", reUpdate[0], "rows");

    // เช็คว่ามี SaveTime record อยู่หรือไม่
    const existingSaveTime = await SaveTime.findOne({
      where: { id_parcel }
    });
    console.log("🔍 Existing SaveTime record:", existingSaveTime ? "Found" : "Not Found");

    if (!existingSaveTime) {
      console.log("❌ SaveTime record not found for id_parcel:", id_parcel);
      return res.status(404).json({ message: "SaveTime not found for ID parcel: " + id_parcel });
    }

    const successTime = moment
      .tz("Asia/Vientiane")
      .format("YYYY-MM-DD HH:mm:ss");
    console.log("⏰ Success time to set:", successTime);

    const successUpdate = await SaveTime.update(
      {
        success: successTime,
      },
      {
        where: {
          id_parcel: id_parcel,
        },
      }
    );
    console.log("✅ SaveTime.success updated:", successUpdate[0], "rows");

    if (successUpdate[0] === 0) {
      console.log("❌ Failed to update SaveTime.success");
      return res.status(404).json({ message: "SaveTime not found ID parcel" });
    }

    if (reUpdate[0] === 0) {
      console.log("❌ Failed to update ParcelDetail");
      return res.status(404).json({ message: "Parcel don't update!" });
    }

    console.log("🎉 updateBranch completed successfully");
    res.status(200).json({ message: "Parcel status updated successfully" });
  } catch (error) {
    console.error("Error updating parcel status:", error);
    res
      .status(500)
      .json({ message: "Server error while updating parcel status" });
  }
};

exports.updateReceive = async (req, res) => {
  const { id_parcel } = req.body;

  try {
    const [updateReceive] = await ParcelDetail.update(
      { status: "202" },
      {
        where: {
          id_parcel: id_parcel,
        },
      }
    );

    const branchTime = moment
      .tz("Asia/Vientiane")
      .format("YYYY-MM-DD HH:mm:ss");

    const branch = await SaveTime.update(
      {
        branch: branchTime,
      },
      {
        where: {
          id_parcel: id_parcel,
        },
      }
    );

    if (branch[0] === 0) {
      return res.status(404).json({ message: "SaveTime not found ID parcel" });
    }

    if (updateReceive === 0) {
      return res.status(404).json({ message: "Parcel not found" });
    }

    res.status(200).json(updateReceive);
  } catch (error) {
    console.error("Error updating parcel status:", error);
    res
      .status(500)
      .json({ message: "Server error while updating parcel status" });
  }
};

exports.updateSuccess = async (req, res) => {
  const { id_parcel, parcels_id } = req.body;

  const savetime = moment.tz("Asia/Vientiane").format("YYYY-MM-DD HH:mm:ss");

  try {
    // รองรับทั้งแบบ single และ array
    let parcelIds = [];
    
    if (parcels_id && Array.isArray(parcels_id)) {
      // ถ้าส่งมาเป็น array ของ objects [{ id: "xxx" }]
      parcelIds = parcels_id.map(item => item.id);
    } else if (id_parcel) {
      // ถ้าส่งมาเป็น single value
      parcelIds = [id_parcel];
    }

    if (parcelIds.length === 0) {
      return res.status(400).json({ message: "No parcel IDs provided" });
    }

    console.log('Updating status to success for parcels:', parcelIds);

    // อัปเดต status เป็น "success" ในตาราง parcels_save
    const updateSuccess = await ParcelDetail.update(
      { status: "success", time: savetime },
      {
        where: {
          id_parcel: parcelIds,
        },
      }
    );

    const successTime = moment
      .tz("Asia/Vientiane")
      .format("YYYY-MM-DD HH:mm:ss");

    // อัปเดต column success ในตาราง SaveTime
    const successExport = await SaveTime.update(
      {
        success: successTime,
      },
      {
        where: {
          id_parcel: parcelIds,
        },
      }
    );

    console.log(`✅ Updated ${updateSuccess[0]} parcels in parcels_save`);
    console.log(`✅ Updated ${successExport[0]} records in SaveTime`);

    res.status(200).json({ 
      message: "Success!", 
      time: savetime,
      updated_parcels: updateSuccess[0],
      updated_savetime: successExport[0]
    });
  } catch (error) {
    console.error('Error updating success status:', error);
    res.status(500).json({ 
      message: "Error unsuccessful",
      error: error.message 
    });
  }
};

exports.updateAccept = async (req, res) => {
  const { id_parcel, status } = req.body;

  try {
    const result = await Parcel.update(
      { status },
      {
        where: {
          id_parcel,
        },
      }
    );

    if (result[0] === 0) {
      return res.status(404).json({ message: "Parcel not found to update" });
    }
    res.status(200).json({ message: "Parcel status updated successfully" });
  } catch (error) {
    console.error("Error updating parcel status:", error);
    res
      .status(500)
      .json({ message: "Server error while updating parcel status" });
  }
};

exports.parcelBranch = async (req, res) => {
  const { username } = req.body;

  try {
    const parcelsSave = await ParcelDetail.findAll({
      where: {
        branch: username,
        status: {
          [Op.in]: ["202", "success"],
        },
      },
    });

    if (!parcelsSave || parcelsSave.length === 0) {
      return res
        .status(404)
        .json({ message: "No parcels found for this branch" });
    }

    res.status(200).json(parcelsSave);
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ message: "Error fetching ParcelSave: " + error.message });
  }
};

exports.searchWareHouse = async (req, res) => {
  const { id_parcel } = req.body;

  try {
    const parcel = await Parcel.findOne({
      where: { id_parcel, status: "export" },
    });

    if (parcel) {
      res.status(200).json(parcel);
    } else {
      res.status(404).json({ message: "Parcel not found" });
    }
  } catch (error) {
    console.error("Error fetching parcel:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.searchParcel = async (req, res) => {
  const { id_parcel, username } = req.body;

  try {
    const parcel = await ParcelDetail.findOne({
      where: {
        id_parcel,
        branch: username,
        status: "201",
        type: "delivery",
      },
    });

    if (!parcel) {
      return res.status(404).json({ message: "Parcel not found" });
    }

    res.status(200).json(parcel);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error parcel" });
  }
};

exports.searchSuccessParcel = async (req, res) => {
  const { id_parcel, username } = req.body;

  try {
    const parcelId = await ParcelDetail.findOne({
      where: {
        id_parcel,
        branch: username,
        status: {
          [Op.in]: ["202", "success"],
        },
        type: "delivery",
      },
    });
    if (!parcelId) {
      return res.status(404).json({ message: "Parcel Not Found!" });
    }

    res.status(200).json(parcelId);
  } catch (error) {
    console.error("Error Can't Find Parcel | Try Again", error);
    res.status(500).json({ message: "Error can't Found Data!" });
  }
};

exports.saveerror = async (req, res) => {
  const { id_parcel, username } = req.body;

  const savetime = moment.tz("Asia/Vientiane").format("YYYY-MM-DD HH:mm:ss");
  try {
    const saveerror = await SaveError.create({
      id_parcel,
      branch: username,
      timesave: savetime,
    });
    res
      .status(200)
      .json({ message: "Saved Error successfully", parcel: saveerror });
  } catch (error) {
    console.error("Error saving failed parcel:", error);
    res
      .status(500)
      .json({ message: "Server error while saving failed parcel" });
  }
};

exports.credit = async (req, res) => {
  const { username } = req.body;

  try {
    const credit = await User.findOne({
      where: {
        username: username,
      },
    });
    res.status(200).json(credit);
  } catch (error) {
    console.error("Error", error);
    res.status(500);
  }
};
exports.listBranch = async (req, res) => {
  try {
    const listBranch = await User.findAll({
      where: {
        role: "branch",
      },
    });

    if (listBranch.length === 0) {
      return res.status(404).json({ message: "No branches found" });
    }

    res.status(200).json(listBranch);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.checkCredit = async (req, res) => {
  const { branch } = req.body;

  try {
    const user = await User.findOne({ where: { branch: branch } });

    if (!user) {
      return res.status(404).json({ message: "Branch not found" });
    }
    if (user.credit < 0) {
      return res
        .status(404)
        .json({ message: "No credit found for this branch" });
    }

    res.status(200).json({ credit: user.credit });
  } catch (error) {
    res.status(500).json({ message: "Error checking credit", error });
  }
};

exports.checkStatus = async (req, res) => {
  const { id_parcel } = req.body;

  let branchData = null;
  let infoBranch = null;

  try {
    const status = await SaveTime.findOne({
      where: { id_parcel },
    });

    if (!status) {
      return res.status(404).json({
        message: "No status found for this parcel ID.",
      });
    }

    const requireBranch =
      !!status.spread || !!status.branch || !!status.success;

    let branchData = null;
    if (requireBranch) {
      const branch = await ParcelDetail.findOne({
        where: { id_parcel },
      });

      if (!branch) {
        return res.status(404).json({
          message: "No branch found for this parcel ID.",
        });
      }
      branchData = branch.branch;

      const userbranch = await User.findOne({
        where: { branch: branchData },
      });

      if (userbranch) {
        infoBranch = userbranch.info;
      }
    }

    const result = {};
    if (status.origin) result.origin = status.origin;
    if (status.export) result.export = status.export;
    if (status.acceptorigin) result.acceptorigin = status.acceptorigin;
   //if (status.spread) result.spread = status.spread;
    //if (status.branch) result.branch = status.branch;
    if (status.success) result.success = status.success;

    res.status(200).json({
      id_parcel: status.id_parcel,
      status: result,
      branch: infoBranch || "ສາຂາ",
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error checking status", error: error.message });
  }
};

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    console.log('File upload attempt:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    });
    
    const fileName = file.originalname.toLowerCase();
    const isExcelFile = file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                       file.mimetype === 'application/vnd.ms-excel' ||
                       fileName.endsWith('.xlsx') ||
                       fileName.endsWith('.xls') ||
                       fileName.endsWith('.xlxs');
    
    if (isExcelFile) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files (.xlsx, .xls, .xlxs) are allowed!'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

exports.importExcel = async (req, res) => {
  try {
    console.log('📁 Import Excel request received');
    console.log('Request file:', req.file);
    
    if (!req.file) {
      console.log('❌ No file uploaded');
      return res.status(400).json({ message: "กรุณาอัปโหลดไฟล์ Excel" });
    }

    const filePath = req.file.path;
    console.log('📂 File path:', filePath);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(400).json({ message: "ไฟล์ไม่พบ" });
    }

    let workbook;
    try {
      workbook = XLSX.readFile(filePath);
    } catch (readError) {
      console.error("Error reading Excel file:", readError);
      return res.status(400).json({ 
        message: "ไม่สามารถอ่านไฟล์ Excel ได้ กรุณาตรวจสอบรูปแบบไฟล์",
        error: readError.message 
      });
    }

    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      return res.status(400).json({ message: "ไฟล์ Excel ไม่มีชีต" });
    }

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    if (!worksheet) {
      return res.status(400).json({ message: "ไม่สามารถเข้าถึงชีตแรกได้" });
    }
    
    // Convert to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    if (!jsonData || jsonData.length === 0) {
      return res.status(400).json({ message: "ไฟล์ Excel ไม่มีข้อมูล" });
    }
    
    // Generate batch UUID
    const batchUuid = uuidv4();
    
    // Get current time
    const currentTime = moment.tz("Asia/Vientiane").format("YYYY-MM-DD HH:mm:ss");
    
    // Get user info from token to determine the from value (optional - ไม่บังคับ auth)
    let fromValue = "China"; // default value
    
    try {
      const token = req.headers.authorization;
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.id);
        
        if (user) {
          fromValue = user.branch || "China";
        }
      }
    } catch (tokenError) {
      console.log('Token verification failed or no token provided, using default fromValue:', fromValue);
    }
    
    const importedParcels = [];
    const errors = [];
    const processedIds = new Set(); // เก็บ parcel IDs ที่ประมวลผลแล้ว
    
    // Process each row (skip header row if exists)
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i];
      
      // Skip empty rows completely
      if (!row || row.length === 0) {
        continue;
      }
      
      // Check if column D exists and has data
      if (row[3] !== undefined && row[3] !== null && row[3] !== '') { // Column D is index 3 (0-based)
        const idParcel = String(row[3]).trim();
        
        if (idParcel && idParcel !== 'undefined' && idParcel !== 'null') {
          try {
            // ตรวจสอบว่า parcel ID ซ้ำในไฟล์เดียวกันหรือไม่
            if (processedIds.has(idParcel)) {
              errors.push(`Row ${i + 1}: Parcel ID ${idParcel} is duplicate in Excel file - skipped`);
              continue;
            }
            
            // ตรวจสอบว่า parcel ID มีอยู่ในฐานข้อมูลแล้วหรือไม่
            const existingParcel = await Parcel.findOne({
              where: { id_parcel: idParcel }
            });
            
            if (existingParcel) {
              errors.push(`Row ${i + 1}: Parcel ID ${idParcel} already exists in database - skipped`);
              continue;
            }
            
            // เพิ่ม parcel ID เข้าไปใน Set เพื่อป้องกันการซ้ำ
            processedIds.add(idParcel);
            
            // Create new parcel
            const newParcel = await Parcel.create({
              id_parcel: idParcel,
              from: fromValue,
              to: "LAO Warehouse",
              time: currentTime,
              status: "origin",
              timeexport: "",
              uuid: batchUuid
            });
            
            // Create UUID record
            const uuidRecord = await Uuid.create({
              batch_uuid: batchUuid,
              id_parcel: idParcel
            });
            
            // Create SaveTime record
            await SaveTime.create({
              id_parcel: idParcel,
              from: fromValue,
              origin: currentTime,
              export: "",
              acceptorigin: "",
              spread: "",
              branch: "",
              success: ""
            });
            
            importedParcels.push({
              id_parcel: idParcel,
              batch_uuid: batchUuid
            });
            
          } catch (error) {
            errors.push(`Row ${i + 1}: Error processing parcel ${idParcel}: ${error.message}`);
          }
        }
      }
    }
    
    // Clean up uploaded file
    fs.unlinkSync(filePath);
    
    res.status(200).json({
      message: "Import completed",
      batch_uuid: batchUuid,
      imported_count: importedParcels.length,
      imported_parcels: importedParcels,
      errors: errors
    });
    
  } catch (error) {
    console.error("Import Excel Error:", error);
    res.status(500).json({ 
      message: "เกิดข้อผิดพลาดในการ import ไฟล์ Excel", 
      error: error.message 
    });
  }
};

// Export multer middleware for use in routes
exports.uploadExcel = upload.single('excelFile');
exports.uploadFile = upload.single('file');

// New Excel import function for parcels_save
exports.parcelsWait = async (req, res) => {
  try {
    const parcels = await ParcelDetail.findAll({
      attributes: [
        'id_parcel',
        'from',
        'status',
        'tel',
        'branch',
        'typeParcel',
        'weight',
        'volume',
        'amount',
        'price',
        'time',
        'uuid'
      ],
      include: [{
        model: SaveTime,
        as: 'saveTime',
        attributes: ['origin', 'acceptorigin'],
        required: false
      }],
      order: [['time', 'DESC']]
    });

    // Map the data to include saveTime fields at root level
    const mappedParcels = parcels.map(parcel => {
      const parcelData = parcel.toJSON();
      return {
        ...parcelData,
        origin: parcelData.saveTime?.origin || null,
        acceptorigin: parcelData.saveTime?.acceptorigin || null,
        saveTime: undefined // Remove nested saveTime object
      };
    });

    res.status(200).json(mappedParcels);
  } catch (error) {
    console.error("Error fetching parcels wait:", error);
    res.status(500).json({ 
      message: "An error occurred while fetching parcels", 
      error: error.message 
    });
  }
};

exports.importExcelToParcelsSave = async (req, res) => {
  try {
    console.log('📁 Import Excel to Parcels Save request received');
    console.log('Request file:', req.file);
    
    if (!req.file) {
      console.log('❌ No file uploaded');
      return res.status(400).json({ message: "Please upload an Excel file" });
    }

    const filePath = req.file.path;
    console.log('📂 File path:', filePath);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(400).json({ message: "File not found" });
    }

    let workbook;
    try {
      workbook = XLSX.readFile(filePath);
    } catch (readError) {
      console.error("Error reading Excel file:", readError);
      return res.status(400).json({ 
        message: "Cannot read Excel file. Please check file format",
        error: readError.message 
      });
    }

    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      return res.status(400).json({ message: "Excel file has no sheets" });
    }

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    if (!worksheet) {
      return res.status(400).json({ message: "Cannot access first sheet" });
    }
    
    // Convert to JSON (starting from row 1, columns B-G)
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
      header: 1
    });
    
    if (!jsonData || jsonData.length === 0) {
      return res.status(400).json({ message: "Excel file has no data" });
    }
    
    // Get current time
    const currentTime = moment.tz("Asia/Vientiane").format("YYYY-MM-DD HH:mm:ss");
    
    const processedData = [];
    const errors = [];
    const seenIds = new Set(); // Track IDs seen in Excel file
    
    // Process each row starting from row 2 (index 1)
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i];
      
      // Skip empty rows completely
      if (!row || row.length === 0) {
        continue;
      }
      
      // Check if columns B, C, D, E exist and have data (indices 1, 2, 3, 4)
      // Columns F (volume) and G (amount) are optional
      if (row[1] !== undefined && row[2] !== undefined && row[3] !== undefined && row[4] !== undefined &&
          row[1] !== null && row[2] !== null && row[3] !== null && row[4] !== null &&
          row[1] !== '' && row[2] !== '' && row[3] !== '' && row[4] !== '') {
        
        const branch = String(row[1]).trim();
        const tel = String(row[2]).trim();
        const id_parcel = String(row[3]).trim();
        const weight = String(row[4]).trim();
        const volume = row[5] !== undefined && row[5] !== null && row[5] !== '' ? String(row[5]).trim() : '0';
        
        // Extract only numbers from column G (amount), e.g., "2B" -> 2, "1A" -> 1
        let amount = 0;
        if (row[6] !== undefined && row[6] !== null && row[6] !== '') {
          const amountStr = String(row[6]).trim();
          const numMatch = amountStr.match(/\d+/); // Extract first number
          amount = numMatch ? parseInt(numMatch[0]) : 0;
        }
        
        if (branch && tel && id_parcel && weight && 
            branch !== 'undefined' && tel !== 'undefined' && 
            id_parcel !== 'undefined' && weight !== 'undefined' &&
            branch !== 'null' && tel !== 'null' && 
            id_parcel !== 'null' && weight !== 'null') {
          
          // Check for duplicates within Excel file - skip silently
          if (seenIds.has(id_parcel)) {
            console.log(`⚠️ Skipping duplicate parcel ID in Excel: ${id_parcel} (Row ${i + 1})`);
            continue;
          }
          
          seenIds.add(id_parcel);
          processedData.push({
            row: i + 1, // Actual row number in Excel (same as China side)
            branch,
            tel,
            id_parcel,
            weight: parseFloat(weight) || 0,
            volume: parseFloat(volume) || 0,
            amount: amount
          });
        }
        // Skip rows with empty data without adding to errors
      }
      // Skip rows with missing columns without adding to errors
    }
    
    if (processedData.length === 0) {
      return res.status(400).json({ 
        message: "No valid data found in Excel file",
        errors 
      });
    }
    
    // Check first row in parcels table
    const firstRow = processedData[0];
    const firstParcel = await Parcel.findOne({
      where: { id_parcel: firstRow.id_parcel },
      attributes: ['id_parcel', 'uuid', 'from']
    });
    
    if (!firstParcel) {
      return res.status(404).json({ 
        message: `Parcel ID ${firstRow.id_parcel} not found in parcels table`,
        row: firstRow.row
      });
    }
    
    if (!firstParcel.uuid) {
      return res.status(404).json({ 
        message: `UUID not found for parcel ID ${firstRow.id_parcel}`,
        row: firstRow.row
      });
    }
    
    const batchUuid = firstParcel.uuid;
    
    // Check all other rows
    for (let i = 1; i < processedData.length; i++) {
      const row = processedData[i];
      const parcel = await Parcel.findOne({
        where: { id_parcel: row.id_parcel },
        attributes: ['id_parcel', 'uuid']
      });
      
      if (!parcel) {
        errors.push(`Row ${row.row}: Parcel ID ${row.id_parcel} not found in parcels table`);
      } else if (parcel.uuid !== batchUuid) {
        errors.push(`Row ${row.row}: Parcel ID ${row.id_parcel} has different UUID (${parcel.uuid}) than first row (${batchUuid})`);
      }
    }
    
    // If there are errors, don't proceed with bulk insert
    if (errors.length > 0) {
      return res.status(400).json({
        message: "Validation failed",
        errors,
        batch_uuid: batchUuid,
        total_rows: processedData.length
      });
    }
    
    // Get from value from parcels table
    const fromValue = firstParcel.from || "China"; // ใช้ค่า from จาก parcels table
    
    console.log('🔍 Debug UUID:', {
      batchUuid: batchUuid,
      fromValue: fromValue,
      firstParcel: firstParcel
    });
    
    // Check for duplicates in parcels_save table
    const parcelIds = processedData.map(row => row.id_parcel);
    console.log('🔍 Checking duplicates for parcel IDs:', parcelIds);
    
    const existingParcels = await ParcelDetail.findAll({
      where: {
        id_parcel: parcelIds
      },
      attributes: ['id_parcel']
    });
    
    console.log('🔍 Existing parcels found:', existingParcels.map(p => p.id_parcel));
    
    const existingIds = new Set(existingParcels.map(p => p.id_parcel));
    
    // Filter out duplicates - skip silently
    const uniqueData = processedData.filter(row => {
      const isDuplicate = existingIds.has(row.id_parcel);
      if (isDuplicate) {
        console.log(`⚠️ Skipping duplicate parcel ID in database: ${row.id_parcel}`);
      }
      return !isDuplicate;
    });
    
    console.log('🔍 Unique data after filtering:', {
      originalCount: processedData.length,
      uniqueCount: uniqueData.length,
      duplicatesSkipped: processedData.length - uniqueData.length
    });
    
    // If all parcels are duplicates, return success with message
    if (uniqueData.length === 0) {
      return res.status(200).json({
        message: "All parcels already exist in parcels_save table - no new data imported",
        batch_uuid: batchUuid,
        total_rows: processedData.length,
        duplicates_skipped: processedData.length,
        imported_count: 0
      });
    }
    
    // Bulk insert to parcels_save
    const parcelsSaveData = uniqueData.map(row => ({
      id_parcel: row.id_parcel,
      from: fromValue,
      status: 'accepted',
      type_tel: '+856',
      tel: row.tel,
      type: '-',
      note: '-',
      branch: row.branch,
      typeParcel: '-',
      width: 0.0,
      length: 0.0,
      height: 0.0,
      weight: row.weight,
      volume: row.volume,
      amount: row.amount,
      price: 0,
      time: currentTime,
      uuid: batchUuid
    }));
    
    console.log('📦 Debug parcelsSaveData:', {
      sample: parcelsSaveData[0],
      batchUuid: batchUuid,
      totalRecords: parcelsSaveData.length
    });
    
    // Assuming parcels_save table exists, if not we need to create the model
    const insertedRecords = await ParcelDetail.bulkCreate(parcelsSaveData);
    
    // อัปเดต status ในตาราง parcels เป็น "accepted" สำหรับพัสดุที่ import สำเร็จ
    if (insertedRecords.length > 0) {
      const parcelIdsToUpdate = insertedRecords.map(record => record.id_parcel);
      
      await Parcel.update(
        { status: "accepted" },
        {
          where: {
            id_parcel: parcelIdsToUpdate,
            status: "export"
          }
        }
      );
      
      // อัปเดต column acceptorigin ในตาราง SaveTime
      await SaveTime.update(
        { acceptorigin: currentTime },
        {
          where: {
            id_parcel: parcelIdsToUpdate
          }
        }
      );
      
      console.log(`✅ Updated ${parcelIdsToUpdate.length} parcels status to "accepted" in parcels table`);
      console.log(`✅ Updated ${parcelIdsToUpdate.length} parcels acceptorigin in SaveTime table`);
    }
    
    // Clean up uploaded file
    fs.unlinkSync(filePath);
    
    res.status(200).json({
      message: "Import to parcels_save completed successfully",
      batch_uuid: batchUuid,
      imported_count: insertedRecords.length,
      duplicates_skipped: processedData.length - uniqueData.length,
      total_rows: processedData.length,
      imported_records: insertedRecords.map(record => ({
        id_parcel: record.id_parcel,
        branch: record.branch,
        tel: record.tel,
        weight: record.weight,
        volume: record.volume,
        amount: record.amount
      }))
    });
    
  } catch (error) {
    console.error("Import Excel to Parcels Save Error:", error);
    res.status(500).json({ 
      message: "An error occurred while importing Excel file to parcels_save", 
      error: error.message 
    });
  }
};
