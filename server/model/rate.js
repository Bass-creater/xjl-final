const { Model, DataTypes } = require("sequelize");
const { sequelize } = require("../db");

class Rate extends Model {}

Rate.init({
  thai: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  china: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
},{
    sequelize,
    modelNames: "Rate",
    tableName: "rate",
    timestamps: false,
});


module.exports = Rate;