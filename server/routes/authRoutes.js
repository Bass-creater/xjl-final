const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const authControl = require("../controller/authController");

const auth = (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(401).json({ message: "Unauthorization | Try again!" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorization | Try again!" });
    }

    req.user = decoded;
    next();
  });
};
router.post("/signup", authControl.signupUser);
router.post("/login", authControl.loginUser);
router.post("/parcel", authControl.idParcel);

router.post("/parcels", authControl.getAllParcels);
router.get("/parcelswait", authControl.parcelsWait);
router.post("/parcels/count", authControl.countParcels);
router.post("/parcels/countwarehouse", authControl.countParcelsWarehouse);
router.post("/parcels/countbranch", authControl.countParcelsBranch);
router.post("/saveData", authControl.saveData);

router.get("/homeAdmin/main", auth, (req, res) => {
  res.json({ message: "Hi, Admin", user: req.user });
});
router.get("/homeAdmin/list", auth, (req, res) => {
  res.json({ message: "List Data", user: req.user });
});
router.get("/homeAdmin/distribution", auth, (req, res) => {
  res.json({ message: "Hi, Admin", user: req.user });
});
router.get("/homeAdmin/branch", auth, (req, res) => {
  res.json({ message: "Hi, Admin", user: req.user });
});
router.get("/check/:id", authControl.checkIdInTables);

router.post("/update-parcel-status", authControl.updateParcelStatus);
router.post("/smallParcels", authControl.smallParcels);
router.post("/smallParcelsSave", authControl.smallParcelsSave);

router.post("/listproduct", authControl.listProduct);
router.post("/listOrigin", authControl.listProductOrigin);
router.post("/listparcel", authControl.percelInStored);

router.post("/credit", authControl.credit);
router.post("/checkcredit", authControl.checkCredit);
router.post("/listBranch", authControl.listBranch);

router.post("/parcel/save", authControl.saveParcelStatus);

router.post("/parcel/update", authControl.updateAccept);
router.post("/parcel/updatebranch", authControl.updateBranch);
router.post("/updatereceive", authControl.updateReceive);
router.post("/updatesuccess", authControl.updateSuccess);

router.post("/parcelBranch", authControl.parcelBranch);
router.post("/parcel/search", authControl.searchParcel);
router.post("/parcel/searchwarehouse", authControl.searchWareHouse);
router.post("/parcel/searchsuccess", authControl.searchSuccessParcel);
router.post("/parcel/saveerror", authControl.saveerror);
router.get("/rate", authControl.rate);

router.post("/checkstatus", authControl.checkStatus);

// Excel import route - ไม่ต้อง auth แต่ยังส่ง JWT token ไป
router.post("/import-excel", authControl.uploadExcel, authControl.importExcel);
router.post("/import-excel-parcels-save", authControl.uploadFile, authControl.importExcelToParcelsSave);

module.exports = router;
