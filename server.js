const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
dotenv.config();  // Load environment variables from .env file



// Enable CORS for all origins
const app = express();
const port = process.env.PORT || 5000;  // Use port from .env or default to 5000

// Body parser middleware
app.use(cors());
app.use(bodyParser.json());

//MongoDB connection setup
const URL= process.env.MONGOURL;

mongoose.connect(URL) .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('Failed to connect to MongoDB:', err));
  
  


  

// MongoDB Schema and Model for Booking
const bookingSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    date: String,
    time: String,
    guests: Number,
    seatingPreference: String,
    specialRequests: String
});

const Booking = mongoose.model('Booking', bookingSchema);

// POST route to create a booking
app.post('https://backend-table-booking-zeta.vercel.app/create-booking', async (req, res) => {
    const { firstName, lastName, email, phone, date, time, guests, seatingPreference, specialRequests } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !date || !time) {
        return res.status(400).json({ message: 'Please provide required fields: firstName, lastName, email, date, time' });
    }

    try {
        const newBooking = new Booking({
            firstName,
            lastName,
            email,
            phone,
            date,
            time,
            guests,
            seatingPreference,
            specialRequests
        });

        await newBooking.save();  // Save to MongoDB
        return res.status(201).json({ message: 'Booking created successfully', booking: newBooking });
    } catch (err) {
        return res.status(500).json({ message: 'Error creating booking', error: err });
    }
});

// GET route to retrieve a booking by ID
app.get('/get-booking', async (req, res) => {
    const { phone } = req.query;
    
    if (!phone) {
        return res.status(400).json({ error: 'Please provide a phone number.' });
    }
    
    try {
        const bookingDetails = await Booking.findOne({ phone });
        if (!bookingDetails) {
            return res.status(404).json({ error: 'No booking found for the provided phone number.' });
        }
        res.json(bookingDetails);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching booking details' });
    }
});
// DELETE route to delete a booking by ID
app.delete('/delete-booking', async (req, res) => {
    const { phone } = req.query;
    
    if (!phone) {
        return res.status(400).json({ error: 'Please provide a phone number.' });
    }
    
    try {
        const booking = await Booking.findOneAndDelete({ phone });
        if (!booking) {
            return res.status(404).json({ error: 'No booking found for the provided phone number.' });
        }
        res.json({ message: 'Booking deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Error deleting booking' });
    }
});



// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});