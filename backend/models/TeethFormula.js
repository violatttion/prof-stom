module.exports = (sequelize, DataTypes) => {
  return sequelize.define('TeethFormula', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    appointment_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'appointments', key: 'id' }
    },
    tooth_number: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('healthy', 'caries', 'filling', 'extracted', 'implant', 'crown', 'root_canal'),
      defaultValue: 'healthy'
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'teeth_formulas',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['appointment_id', 'tooth_number']
      }
    ]
  });
};
