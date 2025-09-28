import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import "./style/main.css";
import { MoonLoader } from "react-spinners";

const Home = lazy(() => import("./pages/home"));
const Login = lazy(() => import("./pages/login"));
const Signup = lazy(() => import("./pages/signup"));
const Distribution = lazy(() => import("./pages/distribution.js"));
const List = lazy(() => import("./pages/list.js"));
const Branch = lazy(() => import("./pages/branchdata.js"));
const Firstpage = lazy(() => import("./pages/firstpage.js"));
const CalculateTH = lazy(() => import("./pages/calculateTH.js"));
const CalculateChina = lazy(() => import("./pages/calculateChina.js"));
const Forbidden = lazy(() => import("./pages/forbidden.js"));
const DataParcel = lazy(() => import("./pages/data_parcel.js"));
const ParcelCalculator = lazy(() => import("./pages/parcelcalculate.js"));
const ViewPdfPage = lazy(() => import("./pages/viewPdf.js"));
const TableParcels = lazy(() => import("./pages/tableparcels.js"));
const NormalShippingPage = lazy(() => import("./pages/normalShipping.js"));
const ExpressShippingPage = lazy(() => import("./pages/expressShipping.js"));

function App() {
  return (
    <Suspense
      fallback={
        <div>
                           <MoonLoader
                   color="#ff8c00"
            size={80}
            style={{
              position: "absolute",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)' 
            }}
          />
        </div>
      }
    >
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/homeAdmin/distribution" element={<Distribution />} />
        <Route path="/homeAdmin/list" element={<List />} />
        <Route path="/homeAdmin/branch" element={<Branch />} />
        <Route path="/homeAdmin/main" element={<Firstpage />} />
        <Route path="/calculateTH" element={<CalculateTH />} />
        <Route path="/calculateChina" element={<CalculateChina />} />
        <Route path="/forbidden" element={<Forbidden />} />
        <Route path="/data_parcel/:id" element={<DataParcel />} />
        <Route path="/parcelcalculate" element={<ParcelCalculator />} />
        <Route path="/homeAdmin/tableparcels" element={<TableParcels />} />
        <Route path="/view-pdf/:parcelId" element={<ViewPdfPage />} />
        <Route path="/normalShipping" element={<NormalShippingPage />} />
        <Route path="/expressShipping" element={<ExpressShippingPage />} />
        
      </Routes>
    </Suspense>
  );
}

export default App;
