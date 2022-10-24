import express from "express";
import mongoose from "mongoose";
import {
  getCalendarEntries,
  seedDatabaseWithEntry,
  createCalendarEntry,
} from "./controllers/calendarEntry.controller";
import * as dotenv from "dotenv";

const app = express();
app.use(express.json());
dotenv.config();

const connectionString = "mongodb://127.0.0.1:27017/calendar-app";
const PORT = process.env.NODE_ENV === "test" ? 4001 : 4000;

app.get("/entries", getCalendarEntries);
app.post("/seedDatabase", seedDatabaseWithEntry);
app.post("/entries", createCalendarEntry);

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
