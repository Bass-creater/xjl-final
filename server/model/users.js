const { Model, DataTypes } = require("sequelize");
const { sequelize } = require("../db");

class User extends Model {}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    passwrd: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING,
      defaultValue: "user",
    },
    branch: {
      type: DataTypes.STRING,
      defaultValue: "-",
      allowNull: false,
    },
    info: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    credit: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    sequelize, // เชื่อมต่อกับฐานข้อมูล
    modelName: "User",
    tableName: "users",
    timestamps: false,
  }
);

module.exports = User;
