const { sequelize } = require("../db");
const { DataTypes, Sequelize } = require("sequelize");

const Uuid = sequelize.define(
  "Uuid",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    batch_uuid: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    id_parcel: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
    },
  },
  {
    sequelize,
    modelName: "Uuid",
    tableName: "uuid",
    timestamps: false,
  }
);

module.exports = Uuid;
