import React from "react";
import ExpressShipping from "../assets/fast_img.jpg";

function ExpressShippingPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-4 flex items-center justify-center">
      <div className="w-full max-w-6xl">
        <img 
          src={ExpressShipping} 
          alt="Express Shipping" 
          className="w-full h-auto object-contain rounded-lg shadow-lg"
          style={{ 
            maxHeight: 'calc(100vh - 32px)',
            width: '100%'
          }}
        />
      </div>
    </div>
  );
}

export default ExpressShippingPage;
