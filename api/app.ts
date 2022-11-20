import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import {
  getCalendarEntries,
  getCalendarEntry,
  seedDatabaseWithEntry,
  createCalendarEntry,
  deleteCalendarEntry,
} from "./controllers/calendarEntry.controller";
import * as dotenv from "dotenv";

const app = express();
app.use(express.json());
app.use(cors());

dotenv.config();

const connectionString = "mongodb://127.0.0.1:27017/calendar-app";
const PORT = process.env.NODE_ENV === "test" ? 4001 : 4000;

app.post("/entries", createCalendarEntry);
app.delete("/entries/:id", deleteCalendarEntry);
app.get("/entries", getCalendarEntries);
app.get("/entries/:id", getCalendarEntry);
app.post("/seedDatabase", seedDatabaseWithEntry);

const start = async () => {
  try {
    await mongoose.connect(connectionString);
    app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

start();

module.exports = { app };
