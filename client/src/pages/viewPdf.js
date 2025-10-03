import { useParams } from "react-router-dom";

const ViewPdfPage = () => {
  const { parcelId } = useParams();
  const pdfUrl = `https://xjllao.com/v1/pdf/${parcelId}.pdf`;

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <iframe
        src={pdfUrl}
        width="100%"
        height="100%"
        style={{ border: "none" }}
        title={`ใบพัสดุ ${parcelId}`}
      ></iframe>
    </div>
  );
};

export default ViewPdfPage;
