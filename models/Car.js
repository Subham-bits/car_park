import mongoose from 'mongoose';

const carSchema = new mongoose.Schema({
    tag: { type: String, required: true, unique: true},
    entry_time: { type: Date },
    exit_time: { type: Date },
    slot: { type: mongoose.Schema.Types.ObjectId, ref: 'Slot' }
});

const Car = mongoose.model('Car', carSchema);

export default Car;
