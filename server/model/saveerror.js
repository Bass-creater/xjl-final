const { sequelize } = require("../db");
const { DataTypes } = require("sequelize");

const SaveError = sequelize.define(
  "savebranch",
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
    timesave: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    branch: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "SaveBranch",
    tableName: "savebranch",
    timestamps: false,
  }
);

module.exports = SaveError;
