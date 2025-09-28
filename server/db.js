require("dotenv").config(); 
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    timezone: "+07:00",
  }
);

const connectDB = async () => {
  try {
    await sequelize.sync({ force: false });
    console.log("Connected SQL Successfully!");
  } catch (error) {
    console.error("Unable to connect SQL!", error);
  }
};

module.exports = { sequelize, connectDB };
