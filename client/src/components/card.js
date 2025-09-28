import "../style/font-style.css";
import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Plane from "../assets/plane.jpg";
import Make from "../assets/make.jpg";
import Keep from "../assets/keep.jpg";
import Find from "../assets/find.jpg";

function Card() {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  const titleVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20,
      },
    },
  };

  return (
    <motion.div
      className="webService"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={containerVariants}
    >
      <motion.div className="serviceDetails" variants={titleVariants}>
        <h1 className="text-2xl my-10 2xl">
          <span className="text-[#ff8c00] font-extrabold">|</span>{" "}
          ລາຍລະອຽດທີ່ຢູ່ສາງ
        </h1>
        <motion.div
          className="flex gap-20 align-center justify-center"
          variants={containerVariants}
        >
          <div className="flex-col align-center justify-center">
            <div className="flex flex-col md:flex-row gap-5 md:gap-10 mb-5 md:mb-10">
              <motion.div
                className="service flex align-center justify-center"
                variants={cardVariants}
                whileHover={{
                  scale: 1.05,
                  y: -10,
                  transition: { type: "spring", stiffness: 300, damping: 20 },
                }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="max-w-sm bg-[#fff] border border-gray-200 rounded-lg shadow-lg hover:shadow-2xl hover:shadow-orange-500/30 transition-all duration-500 transform">
                  <Link href="#">
                    <img
                      className="rounded-t-lg w-full h-48 object-cover"
                      src={Plane}
                      alt="blankimg"
                    />
                  </Link>
                  <div className="p-5">
                    <Link href="#">
                      <h5 className="mb-2 text-xl font-bold tracking-tight text-[#ff8c00] hover:text-orange-600 transition-colors duration-300">
                        1. ທີ່ຢູ່ສາງເຄື່ອງດ່ວນ
                      </h5>
                    </Link>
                    <p className="mb-3 font-normal text-sm text-[#ff8c00] hover:text-orange-600 transition-colors duration-300">
                      收货人：ຊື່ລູກຄ້າ 广州总仓电话: 1862068 5468
                      广州仓收货地址：广东省广州市花都区花山镇花都大道汇江物流园8栋中通国际那通XJL公司(ຊື່+ເບີວັອດແອັບລູກຄ້າ）
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="service flex align-center justify-center"
                variants={cardVariants}
                whileHover={{
                  scale: 1.05,
                  y: -10,
                  transition: { type: "spring", stiffness: 300, damping: 20 },
                }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="max-w-sm bg-[#fff] border border-gray-200 rounded-lg shadow-lg hover:shadow-2xl hover:shadow-orange-500/30 transition-all duration-500 transform">
                  <Link href="#">
                    <img
                      className="rounded-t-lg w-full h-48 object-cover"
                      src={Find}
                      alt="blankimg"
                    />
                  </Link>
                  <div className="p-5">
                    <Link href="#">
                      <h5 className="mb-2 text-xl font-bold tracking-tight text-[#ff8c00] hover:text-orange-600 transition-colors duration-300">
                        2. ທີ່ຢູ່ສາງເຄື່ອງແບບທົ່ວໄປ
                      </h5>
                    </Link>
                    <p className="mb-3 font-normal text-sm text-[#ff8c00] hover:text-orange-600 transition-colors duration-300">
                      收货人:XJL(ຊື່ລູກຄ້າ) 电话：18927779935
                      广东省佛山市南海区里水镇官和路北28号5号老挝仓XJL（ຊື່ລູກຄ້າ+ເບີ້ວັອດແອັບ）
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
            <div className="flex flex-col md:flex-row gap-5 md:gap-10">
              <motion.div
                className="service flex align-center justify-center"
                variants={cardVariants}
                whileHover={{
                  scale: 1.05,
                  y: -10,
                  transition: { type: "spring", stiffness: 300, damping: 20 },
                }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="max-w-sm bg-[#fff] border border-gray-200 rounded-lg shadow-lg hover:shadow-2xl hover:shadow-orange-500/30 transition-all duration-500 transform">
                  <Link href="#">
                    <img
                      className="rounded-t-lg w-full h-48 object-cover"
                      src={Make}
                      alt="blankimg"
                    />
                  </Link>
                  <div className="p-5">
                    <Link href="#">
                      <h5 className="mb-2 text-xl font-bold tracking-tight text-[#ff8c00] hover:text-orange-600 transition-colors duration-300">
                        3. ທີ່ຢູ່ທາງອາກາດ
                      </h5>
                    </Link>
                    <p className="mb-3 font-normal text-sm text-[#ff8c00] hover:text-orange-600 transition-colors duration-300">
                      收货人： ຊື່ລູກຄ້າ ເບີໂທລູກຄ້າ 收货仓电话：19927666536
                      收货仓地址：广东省广州市花都区花山镇花都大道金茂加油站旁汇江物流中通国际航空部（Hk）转老挝中通
                      ( 那通XJL公司 ) ຊື່ລູກຄ້າ ເບີໂທລູກຄ້າ
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="service flex align-center justify-center"
                variants={cardVariants}
                whileHover={{
                  scale: 1.05,
                  y: -10,
                  transition: { type: "spring", stiffness: 300, damping: 20 },
                }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="max-w-sm bg-[#fff] border border-gray-200 rounded-lg shadow-lg hover:shadow-2xl hover:shadow-orange-500/30 transition-all duration-500 transform">
                  <Link href="#">
                    <img
                      className="rounded-t-lg w-full h-48 object-cover"
                      src={Keep}
                      alt="blankimg"
                    />
                  </Link>
                  <div className="p-5">
                    <Link href="#">
                      <h5 className="mb-2 text-xl font-bold tracking-tight text-[#ff8c00] hover:text-orange-600 transition-colors duration-300">
                        4.ທີ່ຢູ່ເຄື່ອງເຢັນ:
                      </h5>
                    </Link>
                    <p className="mb-3 font-normal text-sm text-[#ff8c00] hover:text-orange-600 transition-colors duration-300">
                      收货人:ຊື່ລູກຄ້າ 电话：15800037587
                      云南省昆明市呈贡区马金铺街道
                      经开区小石坝民办科技园5号中通国际冷链仓库
                      那通XJL公司（ຊື່+ເບີ້ໂທ)
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default Card;
