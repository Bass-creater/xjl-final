const { sequelize } = require("../db");
const { DataTypes, Sequelize } = require("sequelize");

const Parcel = sequelize.define(
  "Parcel",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    id_parcel: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    from: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    to: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "LAO Warehouse",
    },
    time: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "origin",
    },
    timeexport: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '',
    },
    uuid: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Parcel",
    tableName: "parcels",
    timestamps: false,
  }
);

module.exports = Parcel;
