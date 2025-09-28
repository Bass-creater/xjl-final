import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import "../style/font-style.css";


function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleScrollToAbout = (e) => {
    e.preventDefault();
    const aboutSection = document.getElementById("about");
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: "smooth" });
    }
  };
  
  const handleScrollToHome = (e) => {
    e.preventDefault();
    const aboutSection = document.getElementById("home");
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Animation variants
  const navVariants = {
    hidden: { y: -100, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20
      }
    }
  };

  const menuVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20
      }
    }
  };

  return (
    <motion.nav
      className="border-gray-200 transition duration-300 bg-white bg-opacity-90 z-50 shadow-lg"
      style={{ position: "fixed", width: "100%" }}
      initial="hidden"
      animate="visible"
      variants={navVariants}
    >
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-2">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link to="/" className="flex flex-col items-center">
            <span className="text-2xl font-bold text-[#ff8c00] drop-shadow-md">XJL EXPRESS</span>
            <span className="text-lg font-medium text-[#ff8c00] drop-shadow-md">ໄຊຈະເລີນ ຂົນສົ່ງ ຈີນ-ລາວ</span>
          </Link>
        </motion.div>
        
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className="duration-300 inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-[#ff8c00] rounded-lg md:hidden hover:bg-[#ff8c00] hover:text-[#fff] focus:outline-none focus:ring-2 focus:ring-[#ff8c00] shadow-md hover:shadow-lg transition-all duration-300"
          aria-controls="navbar-default"
          aria-expanded={isOpen ? "true" : "false"}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <span className="sr-only">Open main menu</span>
          <svg
            className="w-5 h-5"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 17 14"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M1 1h15M1 7h15M1 13h15"
            />
          </svg>
        </motion.button>
        
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="w-full md:flex md:items-center text-start md:w-auto duration-300 md:bg-opacity-0 bg-opacity-90 bg-white rounded shadow-xl"
              id="navbar-default"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.ul 
                className="font-medium flex flex-col p-4 md:p-0 mt-4 rounded-lg text-white md:flex-row md:space-x-8 md:mt-0 md:border-0"
                variants={menuVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.li variants={itemVariants}>
                  <motion.a
                    href="#home"
                    onClick={handleScrollToHome}
                    className="font-bold block py-2 px-3 md:text-[#ff8c00] rounded bg-[#ff8c00] text-white md:bg-transparent md:p-0 hover:bg-orange-600 transition-colors duration-300"
                    whileHover={{ scale: 1.05, x: 5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Home
                  </motion.a>
                </motion.li>
                <motion.li variants={itemVariants}>
                  <motion.a
                    href="#about"
                    onClick={handleScrollToAbout}
                    className="font-bold block py-2 px-3 text-[#ff8c00] rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-orange-600 md:p-0 transition-colors duration-300"
                    whileHover={{ scale: 1.05, x: 5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    About
                  </motion.a>
                </motion.li>
                <motion.li variants={itemVariants}>
                  <motion.div
                    whileHover={{ scale: 1.05, x: 5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      to="https://www.facebook.com/share/1Au6TyZYpE/?mibextid=LQQJ4d"
                      className="font-bold block py-2 px-3 text-[#ff8c00] rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-orange-600 md:p-0 transition-colors duration-300"
                    >
                      ຕິດຕາມພັດສະດຸ
                    </Link>
                  </motion.div>
                </motion.li>
                <motion.li variants={itemVariants}>
                  <motion.div
                    whileHover={{ scale: 1.05, x: 5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      to="https://www.facebook.com/share/1Au6TyZYpE/?mibextid=LQQJ4d"
                      className="font-bold block py-2 px-3 text-[#ff8c00] rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-orange-600 md:p-0 transition-colors duration-300"
                    >
                      ຄຳນວນຄ່າຂົນສົ່ງ
                    </Link>
                  </motion.div>
                </motion.li>
              </motion.ul>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Desktop menu */}
        <motion.div 
          className="hidden md:flex md:items-center md:space-x-8"
          variants={menuVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.li 
            className="list-none"
            variants={itemVariants}
          >
            <motion.a
              href="#home"
              onClick={handleScrollToHome}
              className="font-bold block py-2 px-3 md:text-[#ff8c00] rounded bg-[#ff8c00] text-white md:bg-transparent md:p-0 hover:bg-orange-600 transition-colors duration-300"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              Home
            </motion.a>
          </motion.li>
          <motion.li 
            className="list-none"
            variants={itemVariants}
          >
            <motion.a
              href="#about"
              onClick={handleScrollToAbout}
              className="font-bold block py-2 px-3 text-[#ff8c00] rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-orange-600 md:p-0 transition-colors duration-300"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              About
            </motion.a>
          </motion.li>
          <motion.li 
            className="list-none"
            variants={itemVariants}
          >
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="https://www.facebook.com/share/1Au6TyZYpE/?mibextid=LQQJ4d"
                className="font-bold block py-2 px-3 text-[#ff8c00] rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-orange-600 md:p-0 transition-colors duration-300"
              >
                ຕິດຕາມພັດສະດຸ
              </Link>
            </motion.div>
          </motion.li>
          <motion.li 
            className="list-none"
            variants={itemVariants}
          >
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="https://www.facebook.com/share/1Au6TyZYpE/?mibextid=LQQJ4d"
                className="font-bold block py-2 px-3 text-[#ff8c00] rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-orange-600 md:p-0 transition-colors duration-300"
              >
                ຄຳນວນຄ່າຂົນສົ່ງ
              </Link>
            </motion.div>
          </motion.li>
        </motion.div>
      </div>
      <motion.hr 
        className="bg-gray-700"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      />
    </motion.nav>
  );
}

export default Navbar;
