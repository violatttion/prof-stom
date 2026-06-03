const { sequelize } = require('../models');

async function initDb() {
  try {
    await sequelize.sync({ force: true }); // WARNING: drops tables in development
    console.log('✅ Database initialized (tables created)');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

initDb();
