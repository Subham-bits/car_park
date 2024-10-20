import mongoose from 'mongoose';

const slotSchema = new mongoose.Schema({
    slot_number: { type: Number, required: true, unique: true },
    is_occupied: { type: Boolean, default: false }
});

const Slot = mongoose.model('Slot', slotSchema);

export default Slot;
