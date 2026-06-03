const { Sequelize, DataTypes } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'prof_stom',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'postgres',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Models
db.User = require('./User')(sequelize, DataTypes);
db.Patient = require('./Patient')(sequelize, DataTypes);
db.Doctor = require('./Doctor')(sequelize, DataTypes);
db.Service = require('./Service')(sequelize, DataTypes);
db.Appointment = require('./Appointment')(sequelize, DataTypes);
db.AppointmentService = require('./AppointmentService')(sequelize, DataTypes);
db.TeethFormula = require('./TeethFormula')(sequelize, DataTypes);
db.Notification = require('./Notification')(sequelize, DataTypes);
db.Document = require('./Document')(sequelize, DataTypes);

// Associations
db.User.hasOne(db.Patient, { foreignKey: 'user_id' });
db.Patient.belongsTo(db.User, { foreignKey: 'user_id' });

db.User.hasOne(db.Doctor, { foreignKey: 'user_id' });
db.Doctor.belongsTo(db.User, { foreignKey: 'user_id' });

db.Doctor.hasMany(db.Appointment, { foreignKey: 'doctor_id' });
db.Appointment.belongsTo(db.Doctor, { foreignKey: 'doctor_id' });

db.Patient.hasMany(db.Appointment, { foreignKey: 'patient_id' });
db.Appointment.belongsTo(db.Patient, { foreignKey: 'patient_id' });

db.Appointment.belongsToMany(db.Service, { 
  through: db.AppointmentService, 
  foreignKey: 'appointment_id' 
});
db.Service.belongsToMany(db.Appointment, { 
  through: db.AppointmentService, 
  foreignKey: 'service_id' 
});

db.Appointment.hasMany(db.TeethFormula, { foreignKey: 'appointment_id' });
db.TeethFormula.belongsTo(db.Appointment, { foreignKey: 'appointment_id' });

db.Appointment.hasMany(db.Notification, { foreignKey: 'appointment_id' });
db.Notification.belongsTo(db.Appointment, { foreignKey: 'appointment_id' });

db.Patient.hasMany(db.Document, { foreignKey: 'patient_id' });
db.Document.belongsTo(db.Patient, { foreignKey: 'patient_id' });

module.exports = db;
