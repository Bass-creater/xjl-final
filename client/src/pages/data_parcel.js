import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/navbar";
import "../style/data_parcel.css";
import axios from "axios";
import Correct from "../assets/correct.png";
import unCorrect from "../assets/uncorrect.png";

function Data_parcel() {
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const [branch, setBranch] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const responseStatus = await axios.post(
          "https://xjllao.com/v1/api/checkstatus",
          {
            id_parcel: id,
          }
        );
        setResult(responseStatus.data.status);
        setBranch(responseStatus.data.branch);
      } catch (error) {
        console.error("Error checking ID Parcel:", error);
        setError("Failed to fetch data. Please try again later.");
      }
    };

    checkStatus();
  }, [id]);

  return (
    <div>
      <Navbar />

      <div className="content">
        <div className="contentText">
          <p>
            <strong>ໝາຍເລກເຄື່ອງ: {id}</strong>
          </p>
        </div>

        {error && <p className="error">{error}</p>}
        {!error && result && (
          <div className="result">
            {/* <div className="line"></div> */}

            <div className="statusDetails">
              <div className="statusItem">
                {result.origin ? (
                  <div className="statusItem">
                    <img src={Correct} alt="correct" />
                  </div>
                ) : (
                  <div className="statusItem">
                    <img src={unCorrect} alt="correct" />
                  </div>
                )}
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
                    stroke-linejoin="round"
                    strokeWidth="2"
                    d="M10 12v1h4v-1m4 7H6a1 1 0 0 1-1-1V9h14v9a1 1 0 0 1-1 1ZM4 5h16a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z"
                  />
                </svg>

                <strong id="start">
                ສາງຈີນໄດ້ຮັບສິນຄ້າແລ້ວ
                  {result.origin && (
                    <div className="statusTime">{result.origin}</div>
                  )}
                </strong>
              </div>
              <div className="statusItem">
                {result.export ? (
                  <div className="statusItem">
                    <img src={Correct} alt="correct" />
                  </div>
                ) : (
                  <div className="statusItem">
                    <img src={unCorrect} alt="correct" />
                  </div>
                )}
                <svg
                  className="w-6 h-6 text-gray-800"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <g clip-path="url(#clip0_15_44)">
                    <rect width="24" height="24" />
                    <path
                      d="M19.3074 7.63582C19.3074 7.63582 20.4246 5.92462 19.364 4.86396C18.3033 3.8033 16.5921 4.92053 16.5921 4.92053L13.0566 8.45606L5.45753 6.04247L3.57191 7.92809L9.75674 11.7559L7.87112 13.6415L4.40158 13.9432L3.69448 14.6503L7.34315 16.8848L9.60589 20.5617L10.313 19.8546L10.5864 16.3568L12.472 14.4712L16.2998 20.656L18.1854 18.7704L15.7719 11.1714L19.3074 7.63582Z"
                      stroke="#000000"
                      stroke-linejoin="round"
                      strokeWidth="1.7"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_15_44">
                      <rect width="24" height="24" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
                <strong>
                  ສີນຄ້າກຳລັງຖືກຈັດສົ່ງສູນຄັດແຍກປະເທດລາວ
                  {result.export && (
                    <div className="statusTime">{result.export}</div>
                  )}
                </strong>
              </div>
              <div className="statusItem">
                {result.acceptorigin ? (
                  <div className="statusItem">
                    <img src={Correct} alt="correct" />
                  </div>
                ) : (
                  <div className="statusItem">
                    <img src={unCorrect} alt="correct" />
                  </div>
                )}
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
                    d="M7 14.0014H17M7 14.0014V11.6014C7 11.0413 7 10.7613 7.10899 10.5474C7.20487 10.3592 7.35785 10.2062 7.54601 10.1104C7.75992 10.0014 8.03995 10.0014 8.6 10.0014H15.4C15.9601 10.0014 16.2401 10.0014 16.454 10.1104C16.6422 10.2062 16.7951 10.3592 16.891 10.5474C17 10.7613 17 11.0413 17 11.6014V14.0014M7 14.0014V18.0014V21.0014M17 14.0014V18.0014V21.0014M18.3466 6.17468L14.1466 4.07468C13.3595 3.68113 12.966 3.48436 12.5532 3.40691C12.1876 3.33832 11.8124 3.33832 11.4468 3.40691C11.034 3.48436 10.6405 3.68113 9.85338 4.07468L5.65337 6.17468C4.69019 6.65627 4.2086 6.89707 3.85675 7.25631C3.5456 7.574 3.30896 7.95688 3.16396 8.37725C3 8.85262 3 9.39106 3 10.4679V19.4014C3 19.9614 3 20.2414 3.10899 20.4554C3.20487 20.6435 3.35785 20.7965 3.54601 20.8924C3.75992 21.0014 4.03995 21.0014 4.6 21.0014H19.4C19.9601 21.0014 20.2401 21.0014 20.454 20.8924C20.6422 20.7965 20.7951 20.6435 20.891 20.4554C21 20.2414 21 19.9614 21 19.4014V10.4679C21 9.39106 21 8.85262 20.836 8.37725C20.691 7.95688 20.4544 7.574 20.1433 7.25631C19.7914 6.89707 19.3098 6.65627 18.3466 6.17468Z"
                    stroke="#000000"
                    strokeWidth="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                <strong>
                  ສີນຄ້າມາຮອດສູນຄັດແຍກປະເທດລາວແລ້ວ
                  {result.acceptorigin && (
                    <div className="statusTime">{result.acceptorigin}</div>
                  )}
                </strong>
              </div>
              <div className="statusItem">
                {result.success ? (
                  <div className="statusItem">
                    <img src={Correct} alt="correct" />
                  </div>
                ) : (
                  <div className="statusItem">
                  <img src={unCorrect} alt="correct" />
                </div>
                )}
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M17.4964 21.9284C17.844 21.7894 18.1491 21.6495 18.4116 21.5176C18.9328 22.4046 19.8969 23 21 23C22.6569 23 24 21.6568 24 20V14C24 12.3431 22.6569 11 21 11C19.5981 11 18.4208 11.9616 18.0917 13.2612C17.8059 13.3614 17.5176 13.4549 17.2253 13.5384C16.3793 13.7801 15.3603 13.9999 14.5 13.9999C13.2254 13.9999 10.942 13.5353 9.62034 13.2364C8.61831 13.0098 7.58908 13.5704 7.25848 14.5622L6.86313 15.7483C5.75472 15.335 4.41275 14.6642 3.47619 14.1674C2.42859 13.6117 1.09699 14.0649 0.644722 15.1956L0.329309 15.9841C0.0210913 16.7546 0.215635 17.6654 0.890813 18.2217C1.66307 18.8581 3.1914 20.0378 5.06434 21.063C6.91913 22.0782 9.21562 22.9999 11.5 22.9999C14.1367 22.9999 16.1374 22.472 17.4964 21.9284ZM20 20C20 20.5523 20.4477 21 21 21C21.5523 21 22 20.5523 22 20V14C22 13.4477 21.5523 13 21 13C20.4477 13 20 13.4477 20 14V20ZM14.5 15.9999C12.9615 15.9999 10.4534 15.4753 9.17918 15.1872C9.17918 15.1872 8.84483 16.1278 8.7959 16.2745L12.6465 17.2776C13.1084 17.3979 13.372 17.8839 13.2211 18.3367C13.0935 18.7194 12.7092 18.9536 12.3114 18.8865C11.0903 18.6805 8.55235 18.2299 7.25848 17.8365C5.51594 17.3066 3.71083 16.5559 2.53894 15.9342C2.53894 15.9342 2.22946 16.6189 2.19506 16.7049C2.92373 17.3031 4.32792 18.3799 6.0246 19.3086C7.76488 20.2611 9.70942 20.9999 11.5 20.9999C15.023 20.9999 17.1768 19.9555 18 19.465V15.3956C16.8681 15.7339 15.6865 15.9999 14.5 15.9999Z"
                    fill="#0F0F0F"
                  />
                  <path
                    d="M12 1C11.4477 1 11 1.44772 11 2V7.58564L9.7071 6.29278C9.3166 5.9024 8.68342 5.9024 8.29292 6.29278C7.90235 6.68341 7.90235 7.31646 8.29292 7.70709L11.292 10.7063C11.6823 11.0965 12.3149 11.0968 12.7055 10.707L15.705 7.71368C16.0955 7.3233 16.0955 6.69 15.705 6.29962C15.3145 5.90899 14.6813 5.90899 14.2908 6.29962L13 7.59034V2C13 1.44772 12.5523 1 12 1Z"
                    fill="#0F0F0F"
                  />
                </svg>
                <strong id="end">
                  ລູກຄ້າມາຮັບຂອງທີ່ໂກດັງແລ້ວ
                  {result.success && (
                    <div className="statusTime">{result.success}</div>
                  )}
                </strong>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Data_parcel;
