const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

router.post('/', bookingController.createBooking);
router.get('/user/:userId', bookingController.getUserBookings);
router.get('/', bookingController.getAllBookings);
router.put('/:id/status', bookingController.updateStatus);
router.put('/:id/review', bookingController.addReview);

module.exports = router;