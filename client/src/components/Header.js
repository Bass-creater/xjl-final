import React from 'react';
import '../style/Header.css';

function Header() {
  // const [username, setUsername] = useState();
  // const [position, setPosition] = useState();
  // const [currentDate, setcurrentDate] = useState();

  return (
    <div className="header">
      <div className="date-info">
         XX/XX/XX<br />
        XX:XX
      </div>
      <div className="user-info">
        <span>{'{ USERNAME }'} | { 'ຕຳເເຫນ່ງໂກດັງ ຫລື ສາຂາທີ່ປະຈຳຢູ່' }</span>
        <button className="home-btn">ຫນ້າທໍາອິດ</button>
      </div>
    </div>
  );
}

export default Header;
