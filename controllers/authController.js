const pool = require('../db');
const bcrypt = require('bcrypt');

exports.register = async (req, res) => {
    try {
        const { fio, phone, email, login, password } = req.body;

        // Валидация по ТЗ
        const loginRegex = /^[a-zA-Z0-9]{6,}$/;
        if (!loginRegex.test(login)) {
            return res.status(400).json({ error: 'Логин должен содержать только латиницу и цифры, минимум 6 символов.' });
        }
        if (password.length < 8) {
            return res.status(400).json({ error: 'Пароль должен быть не менее 8 символов.' });
        }

        // хэширование пароля и сохранение в бедешке
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await pool.query(
            'INSERT INTO Users (fio, phone, email, login, password) VALUES ($1, $2, $3, $4, $5) RETURNING id, login',
            [fio, phone, email, login, hashedPassword]
        );

        res.status(201).json(newUser.rows[0]);
    } catch (err) {
        if (err.code === '23505') {
            return res.status(400).json({ error: 'Пользователь с таким логином уже существует.' });
        }
        res.status(500).json({ error: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { login, password } = req.body;

        // проверка на администратора 
        if (login === 'Admin26' && password === 'Deto20') {
            return res.status(200).json({ message: 'Успешный вход администратора', role: 'admin' });
        }

        const user = await pool.query('SELECT * FROM Users WHERE login = $1', [login]);
        if (user.rows.length === 0) {
            return res.status(400).json({ error: 'Неверный логин или пароль.' });
        }

        const validPassword = await bcrypt.compare(password, user.rows[0].password);
        if (!validPassword) {
            return res.status(400).json({ error: 'Неверный логин или пароль.' });
        }

        res.status(200).json({ message: 'Успешный вход', userId: user.rows[0].id, role: 'user' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};