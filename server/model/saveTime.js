const { sequelize } = require("../db");
const { DataTypes } = require("sequelize");

const SaveTime = sequelize.define(
  "savetime",
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
    origin: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    export: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    acceptorigin: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    spread: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    branch: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    success: {
        type: DataTypes.STRING,
        allowNull: true,
      },
  },
  {
    sequelize,
    modelName: "SaveTime",
    tableName: "savetime",
    timestamps: false,
  }
);

module.exports = SaveTime;
