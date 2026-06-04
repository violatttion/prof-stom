const { Sequelize, DataTypes } = require('sequelize');

// Проверка наличия DATABASE_URL
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL не найден в переменных окружения');
  process.exit(1);
}

console.log("=== DATABASE CONNECTION ===");
console.log("Используется внутренняя БД Railway");
console.log("DATABASE_URL существует:", !!process.env.DATABASE_URL);

// Подключение к базе (оптимизировано под внутреннее подключение Railway)
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,                    // Поставь true, если хочешь видеть SQL-запросы в логах
  dialectOptions: {
    ssl: false                       // ← Для внутреннего подключения Railway SSL не нужен
  }
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Модели
db.User = require('./User')(sequelize, DataTypes);
db.Patient = require('./Patient')(sequelize, DataTypes);
db.Doctor = require('./Doctor')(sequelize, DataTypes);
db.Service = require('./Service')(sequelize, DataTypes);
db.Appointment = require('./Appointment')(sequelize, DataTypes);
db.AppointmentService = require('./AppointmentService')(sequelize, DataTypes);
db.TeethFormula = require('./TeethFormula')(sequelize, DataTypes);
db.Notification = require('./Notification')(sequelize, DataTypes);
db.Document = require('./Document')(sequelize, DataTypes);

// Связи (Associations)
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