const bcrypt = require('bcrypt');
const { 
  User, Patient, Doctor, Service, Appointment 
} = require('../models');

async function seed() {
  try {
    console.log('🌱 Seeding database...');

    // Clear existing (optional for demo)
    await User.destroy({ where: {}, force: true });

    // Create Admin
    const adminUser = await User.create({
      email: 'admin@profstom.ru',
      password: await bcrypt.hash('Admin123', 10),
      full_name: 'Администратор Система',
      phone: '+7 (999) 123-45-67',
      role: 'admin'
    });

    // Create Doctors
    const doctorUser1 = await User.create({
      email: 'doctor1@profstom.ru',
      password: await bcrypt.hash('Doctor123', 10),
      full_name: 'Иванов Иван Иванович',
      phone: '+7 (999) 234-56-78',
      role: 'doctor'
    });
    const doctor1 = await Doctor.create({
      user_id: doctorUser1.id,
      specialization: 'Стоматолог-терапевт',
      work_hours_start: '09:00',
      work_hours_end: '18:00',
      cabinet: '101'
    });

    const doctorUser2 = await User.create({
      email: 'doctor2@profstom.ru',
      password: await bcrypt.hash('Doctor123', 10),
      full_name: 'Петрова Анна Сергеевна',
      phone: '+7 (999) 345-67-89',
      role: 'doctor'
    });
    const doctor2 = await Doctor.create({
      user_id: doctorUser2.id,
      specialization: 'Стоматолог-ортопед',
      work_hours_start: '10:00',
      work_hours_end: '19:00',
      cabinet: '102'
    });

    // Create Patients
    const patientUser1 = await User.create({
      email: 'patient1@profstom.ru',
      password: await bcrypt.hash('Patient123', 10),
      full_name: 'Сидоров Алексей Петрович',
      phone: '+7 (999) 456-78-90',
      role: 'patient'
    });
    const patient1 = await Patient.create({
      user_id: patientUser1.id,
      date_of_birth: '1990-05-15'
    });

    const patientUser2 = await User.create({
      email: 'patient2@profstom.ru',
      password: await bcrypt.hash('Patient123', 10),
      full_name: 'Козлова Мария Александровна',
      phone: '+7 (999) 567-89-01',
      role: 'patient'
    });
    const patient2 = await Patient.create({
      user_id: patientUser2.id,
      date_of_birth: '1985-11-20'
    });

    // Create Services
    const services = await Service.bulkCreate([
      { name: 'Консультация', category: 'Терапия', price: 1500, duration: 30 },
      { name: 'Лечение кариеса', category: 'Терапия', price: 4500, duration: 60 },
      { name: 'Профессиональная гигиена', category: 'Терапия', price: 5500, duration: 45 },
      { name: 'Установка пломбы', category: 'Терапия', price: 3800, duration: 40 },
      { name: 'Удаление зуба', category: 'Хирургия', price: 6500, duration: 30 },
      { name: 'Имплантация', category: 'Хирургия', price: 45000, duration: 120 },
      { name: 'Установка коронки', category: 'Ортопедия', price: 25000, duration: 90 },
      { name: 'Отбеливание', category: 'Эстетика', price: 18000, duration: 60 }
    ]);

    // Create sample appointments
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    await Appointment.bulkCreate([
      {
        patient_id: patient1.id,
        doctor_id: doctor1.id,
        appointment_date: today,
        appointment_time: '10:00',
        status: 'confirmed',
        source: 'admin',
        notes: 'Плановый осмотр'
      },
      {
        patient_id: patient2.id,
        doctor_id: doctor2.id,
        appointment_date: tomorrow,
        appointment_time: '14:30',
        status: 'pending',
        source: 'patient',
        notes: 'Жалобы на чувствительность'
      }
    ]);

    console.log('✅ Seed completed successfully!');
    console.log('\nTest accounts:');
    console.log('Admin:    admin@profstom.ru / Admin123');
    console.log('Doctor 1: doctor1@profstom.ru / Doctor123');
    console.log('Doctor 2: doctor2@profstom.ru / Doctor123');
    console.log('Patient 1: patient1@profstom.ru / Patient123');
    console.log('Patient 2: patient2@profstom.ru / Patient123');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
