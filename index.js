import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import Slot from "./models/Slot.js";
import ParkingHistory from "./models/ParkingHistory.js";
import { fileURLToPath } from "url";

// Get the current file path (equivalent of __dirname in CommonJS)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();
const app = express();

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Middleware to parse JSON bodies
app.use(express.json());

const port = process.env.PORT || 3000;

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// API Endpoint to handle parking actions
app.get("/parking", async (req, res) => {
  const { tag, action, slot } = req.query;

  if (!tag || !action) {
    return res.status(400).send("Invalid parameters");
  }

  try {
    if (action === "entry") {
      const existingHistory = await ParkingHistory.findOne({ tag, exit_time: null });

      // If the car is already inside
      if (existingHistory) {
        return res.status(400).send("Car already inside");
      }

      // Find the selected slot
      const selectedSlot = await Slot.findOne({ slot_number: slot });

      // Check if the slot exists and is not occupied
      if (!selectedSlot) {
        return res.status(400).send("Invalid slot");
      }

      if (selectedSlot.is_occupied) {
        return res.status(400).send("Slot already occupied");
      }

      // Mark the slot as occupied
      selectedSlot.is_occupied = true;
      await selectedSlot.save();

      // Create a new parking history record
      const entry_time = new Date();
      const parkingRecord = new ParkingHistory({
        tag,
        entry_time,
        exit_time: null,
        slot: selectedSlot._id,
        slot_number: selectedSlot.slot_number,
        action: "entry",
      });
      await parkingRecord.save();

      return res.status(200).send(`Entry recorded. Assigned Slot: ${selectedSlot.slot_number}`);

    } else if (action === "exit") {
      console.log("Attempting exit for tag:", tag);
      const parkingRecord = await ParkingHistory.findOne({ tag, exit_time: null }).populate("slot");
      console.log("Found Parking Record:", parkingRecord);

      // Check if parking record exists
      if (!parkingRecord) {
        return res.status(400).send("Car not found or already exited");
      }

      const exit_time = new Date();
      parkingRecord.exit_time = exit_time;
      parkingRecord.action = "exit"; // Ensure action is set
      await parkingRecord.save();

      const slot = parkingRecord.slot;
      slot.is_occupied = false;
      await slot.save();

      return res.status(200).send(`Exit recorded. Freed Slot: ${slot.slot_number}`);
    } else {
      return res.status(400).send("Invalid action");
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return res.status(500).send("Internal server error");
  }
});

// API Endpoint to get the current parking status
app.get("/status", async (req, res) => {
  try {
    // Fetch parked car data from ParkingHistory
    const parkedCars = await ParkingHistory.find({ exit_time: null }).populate("slot").exec();

    // Format the data for the response
    const formattedCars = parkedCars.map((car) => ({
      tag: car.tag,
      entry_time: car.entry_time.toLocaleString(), // Format date
      exit_time: car.exit_time ? car.exit_time.toLocaleString() : "Still Parked",
      slot_number: car.slot ? car.slot.slot_number : "No Slot Assigned",
    }));

    // Respond with the formatted parked cars data
    res.json(formattedCars);
  } catch (error) {
    console.error("Error fetching status:", error);
    res.status(500).send("Server error");
  }
});

// API Endpoint to get parking history
app.get("/history", async (req, res) => {
  try {
    const history = await ParkingHistory.find().sort({ entry_time: -1 }).populate("slot"); // Sort by entry time and populate the slot
    res.json(history);
  } catch (error) {
    console.error("Error fetching history:", error);
    res.status(500).send("Internal server error");
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
