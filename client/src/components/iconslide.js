import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
// import "./App.css";
import Banner1 from "../assets/banner/1.jpg";
import Banner2 from "../assets/banner/2.jpg";
import Banner3 from "../assets/banner/3.jpg";
import Banner4 from "../assets/banner/4.jpg";
import Banner5 from "../assets/banner/5.jpg";
import Banner6 from "../assets/banner/6.jpg";
import Banner7 from "../assets/banner/7.jpg";
import Banner8 from "../assets/banner/8.jpg";
import Banner9 from "../assets/banner/9.jpg";
import Banner10 from "../assets/banner/10.jpg";

const IconSlide = () => {
  const sliderRef = useRef(null);

  useEffect(() => {
    // Duplicate the list to create infinite scroll effect
    const ul = sliderRef.current;
    ul.insertAdjacentHTML("afterend", ul.outerHTML);
    ul.nextSibling.setAttribute("aria-hidden", "true");
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.8,
        staggerChildren: 0.1
      }
    }
  };

  const iconVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20
      }
    }
  };

  const icons = [
    { src: Banner1, alt: "1" },
    { src: Banner2, alt: "2" },
    { src: Banner3, alt: "3" },
    { src: Banner4, alt: "4" },
    { src: Banner5, alt: "5" },
    { src: Banner6, alt: "6" },
    { src: Banner7, alt: "7" },
    { src: Banner8, alt: "8" },
    { src: Banner9, alt: "9" },
    { src: Banner10, alt: "10" }
  ];

  return (
    <motion.div 
      className="relative flex flex-col justify-center overflow-hidden"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={containerVariants}
    >
      <div className="w-full max-w-5xl md:px-10 py-24 mx-auto">
        <div className="text-center">
          <div className="w-full inline-flex flex-nowrap overflow-hidden mask-image-linear">
            <motion.ul
              ref={sliderRef}
              className="flex items-center justify-center md:justify-start [&_li]:mx-8 [&_img]:max-w-none animate-infinite-scroll"
              variants={containerVariants}
            >
              {icons.map((icon, index) => (
                <motion.li
                  key={index}
                  variants={iconVariants}
                  whileHover={{ 
                    scale: 1.2, 
                    y: -10,
                    transition: { 
                      type: "spring", 
                      stiffness: 400, 
                      damping: 25 
                    }
                  }}
                  whileTap={{ scale: 0.9 }}
                >
                  <motion.img 
                    src={icon.src} 
                    alt={icon.alt} 
                    className="w-auto h-48 object-cover drop-shadow-lg hover:drop-shadow-2xl transition-all duration-300 cursor-pointer"
                    whileHover={{ 
                      filter: "brightness(1.1) contrast(1.1)",
                      transition: { duration: 0.2 }
                    }}
                  />
                </motion.li>
              ))}
            </motion.ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default IconSlide;
