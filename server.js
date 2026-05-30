const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcrypt');
const pool = require('./db');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// === АВТОРИЗАЦИЯ И РЕГИСТРАЦИЯ ===
app.post('/api/auth/register', async (req, res) => {
    try {
        const { fio, phone, email, login, password } = req.body;
        if (!/^[a-zA-Z0-9]{6,}$/.test(login)) return res.status(400).json({ error: 'Логин: латиница и цифры, от 6 симв.' });
        if (password.length < 8) return res.status(400).json({ error: 'Пароль от 8 символов' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await pool.query(
            'INSERT INTO Users (fio, phone, email, login, password) VALUES ($1, $2, $3, $4, $5) RETURNING id',
            [fio, phone, email, login, hashedPassword]
        );
        res.status(201).json(newUser.rows[0]);
    } catch (err) {
        if (err.code === '23505') return res.status(400).json({ error: 'Логин уже занят' });
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { login, password } = req.body;
        if (login === 'Admin26' && password === 'Demo20') {
            return res.status(200).json({ userId: 0, role: 'admin' });
        }
        const user = await pool.query('SELECT * FROM Users WHERE login = $1', [login]);
        if (user.rows.length === 0) return res.status(400).json({ error: 'Неверный логин или пароль' });
        
        const validPass = await bcrypt.compare(password, user.rows[0].password);
        if (!validPass) return res.status(400).json({ error: 'Неверный логин или пароль' });
        
        res.status(200).json({ userId: user.rows[0].id, role: 'user' });
    } catch (err) { res.status(500).json({ error: 'Ошибка сервера' }); }
});

// === ЗАЯВКИ ПОЛЬЗОВАТЕЛЯ ===
app.post('/api/bookings', async (req, res) => {
    try {
        const { user_id, hall_id, start_date, payment_method } = req.body;
        await pool.query(
            'INSERT INTO Bookings (user_id, hall_id, start_date, payment_method) VALUES ($1, $2, $3, $4)',
            [user_id, hall_id, start_date, payment_method]
        );
        res.status(201).json({ message: 'Создано' });
    } catch (err) { res.status(500).json({ error: 'Ошибка сервера' }); }
});

app.get('/api/bookings/user/:id', async (req, res) => {
    try {
        const bookings = await pool.query(`
            SELECT b.id, h.name as hall_name, b.start_date, b.payment_method, b.status, b.review 
            FROM Bookings b JOIN Halls h ON b.hall_id = h.id WHERE b.user_id = $1 ORDER BY b.id DESC
        `, [req.params.id]);
        res.json(bookings.rows);
    } catch (err) { res.status(500).json({ error: 'Ошибка сервера' }); }
});

app.put('/api/bookings/:id/review', async (req, res) => {
    try {
        await pool.query('UPDATE Bookings SET review = $1 WHERE id = $2', [req.body.review, req.params.id]);
        res.json({ message: 'Отзыв добавлен' });
    } catch (err) { res.status(500).json({ error: 'Ошибка сервера' }); }
});

// === АДМИНКА ===
app.get('/api/bookings', async (req, res) => {
    try {
        const bookings = await pool.query(`
            SELECT b.id, u.fio, u.phone, h.name as hall_name, b.start_date, b.payment_method, b.status, b.review 
            FROM Bookings b JOIN Users u ON b.user_id = u.id JOIN Halls h ON b.hall_id = h.id ORDER BY b.id DESC
        `);
        res.json(bookings.rows);
    } catch (err) { res.status(500).json({ error: 'Ошибка сервера' }); }
});

app.put('/api/bookings/:id/status', async (req, res) => {
    try {
        await pool.query('UPDATE Bookings SET status = $1 WHERE id = $2', [req.body.status, req.params.id]);
        res.json({ message: 'Статус обновлен' });
    } catch (err) { res.status(500).json({ error: 'Ошибка сервера' }); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Сервер: http://localhost:${PORT}`));