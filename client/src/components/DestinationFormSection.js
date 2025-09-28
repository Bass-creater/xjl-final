import React from 'react';
import '../style/DestinationFormSection.css';

function DestinationFormSection({ title, color }) {
  return (
    <div className={`form-section ${color}`}>
      <h3>{title}</h3>
      <div className="input-group">
        <label>ສາຂາ:</label>
        <select>
          <option>{'ສາຂາທີ່ປະຈຳການ'}</option>
        </select>
      </div>
      <div className="input-group">
        <label>ໝາຍເລກສັ່ງຊື້:</label>
        <input type="text" placeholder="+66" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5" />
      </div>
      <div className="input-group">
        <label>ຊື່ຜູ້ສັ່ງ:</label>
        <input type="text" placeholder="Name Lastname" />
      </div>
    <div>
      <input type='checkbox' className='flex'/>
      <p className='text-md'>ເອົາຢູ່ສາຂາ</p>
    </div>
      <div className="input-group">
        <label>ບັນທຶກ:</label>
        <textarea placeholder="ເພີ່ມບັນທຶກ"></textarea>
      </div>
    </div>
  );
}

export default DestinationFormSection;
