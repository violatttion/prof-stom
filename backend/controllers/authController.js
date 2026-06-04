const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, Patient, Doctor } = require('../models');

class AuthController {
  async register(req, res) {
    try {
      const { email, password, full_name, phone, role = 'patient', date_of_birth, specialization } = req.body;

      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await User.create({
        email,
        password: hashedPassword,
        full_name,
        phone,
        role
      });

      if (role === 'patient') {
        await Patient.create({
          user_id: user.id,
          date_of_birth: date_of_birth || null
        });
      } else if (role === 'doctor') {
        await Doctor.create({
          user_id: user.id,
          specialization: specialization || 'Стоматолог-терапевт'
        });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      res.status(201).json({
        message: 'Регистрация прошла успешно',
        token,
        user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Ошибка при регистрации' });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({ error: 'Неверный email или пароль' });
      }

      let isPasswordValid = false;

      // Защита от null/undefined
      if (user.password && typeof user.password === 'string') {
        if (user.password.startsWith('$2b$')) {
          // Пароль захеширован
          isPasswordValid = await bcrypt.compare(password, user.password);
        } else {
          // Пароль в открытом виде (тестовые аккаунты)
          isPasswordValid = password === user.password;
        }
      }

      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Неверный email или пароль' });
      }

      if (!user.is_active) {
        return res.status(403).json({ error: 'Аккаунт заблокирован' });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
          phone: user.phone
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Ошибка при входе' });
    }
  }

  async getMe(req, res) {
    try {
      const user = await User.findByPk(req.user.id, {
        attributes: { exclude: ['password'] },
        include: [
          { model: require('../models').Patient, required: false },
          { model: require('../models').Doctor, required: false }
        ]
      });
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new AuthController();