const { Model, DataTypes } = require("sequelize");
const { sequelize } = require("../db");

class ParcelDetail extends Model {}

ParcelDetail.init(
  {
    id_parcel: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    from: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    type_tel: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tel: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    branch: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    typeParcel: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    width: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    length: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    height: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    weight: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    price: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    time: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    uuid: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize, // เชื่อมต่อกับฐานข้อมูล
    modelName: "ParcelDetail",
    tableName: "parcels_save",
    timestamps: false
  }
);

module.exports = ParcelDetail;
