module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Service', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    duration: {
      type: DataTypes.INTEGER,
      defaultValue: 30
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'services',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
};
