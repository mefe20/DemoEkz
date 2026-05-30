const pool = require('../db');

// для пользователя: создать заявку
exports.createBooking = async (req, res) => {
    try {
        const { user_id, hall_id, start_date, payment_method } = req.body;
        const newBooking = await pool.query(
            'INSERT INTO Bookings (user_id, hall_id, start_date, payment_method) VALUES ($1, $2, $3, $4) RETURNING *',
            [user_id, hall_id, start_date, payment_method]
        );
        res.status(201).json(newBooking.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// для пользователя: история заявок
exports.getUserBookings = async (req, res) => {
    try {
        const { userId } = req.params;
        const bookings = await pool.query(`
            SELECT b.id, h.name as hall_name, b.start_date, b.status, b.payment_method 
            FROM Bookings b 
            JOIN Halls h ON b.hall_id = h.id 
            WHERE b.user_id = $1`, [userId]);
        res.status(200).json(bookings.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// для администратора: получить все заявки
exports.getAllBookings = async (req, res) => {
    try {
        const bookings = await pool.query(`
            SELECT b.id, u.fio, h.name as hall_name, b.start_date, b.status 
            FROM Bookings b 
            JOIN Users u ON b.user_id = u.id 
            JOIN Halls h ON b.hall_id = h.id`);
        res.status(200).json(bookings.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// для администратора: изменить статус
exports.updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'Банкет назначен' или 'Банкет завершен'
        const updated = await pool.query(
            'UPDATE Bookings SET status = $1 WHERE id = $2 RETURNING *',
            [status, id]
        );
        res.status(200).json(updated.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// оставить или изменить отзыв
exports.addReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { review } = req.body;
        await pool.query('UPDATE Bookings SET review = $1 WHERE id = $2', [review, id]);
        res.status(200).json({ message: 'отзыв сохранен' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};