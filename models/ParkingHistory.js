import mongoose from "mongoose";

const parkingHistorySchema = new mongoose.Schema({
  tag: { type: String, required: true },
  entry_time: { type: Date, required: true },
  exit_time: { type: Date, default: null },
  slot: { type: mongoose.Schema.Types.ObjectId, ref: "Slot", required: true },
  slot_number: { type: String, required: true },  // Ensure this is included
  action: { type: String, required: true } // "entry" or "exit"
});

const ParkingHistory = mongoose.model("ParkingHistory", parkingHistorySchema);
export default ParkingHistory;
