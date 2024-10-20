import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Slot from './models/Slot.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(async () => {
        console.log("Connected to MongoDB");

        // Seed initial parking slots
        const slots = [
            { slot_number: '1' },
            { slot_number: '2' },
            { slot_number: '3' },
            { slot_number: '4' },
            { slot_number: '5' }
        ];

        await Slot.insertMany(slots);
        console.log("Slots seeded successfully");

        mongoose.disconnect();
    })
    .catch(err => console.error("MongoDB connection error:", err));
