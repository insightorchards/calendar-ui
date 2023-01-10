const mongoose = require("mongoose");

const calendarEntrySchema = new mongoose.Schema(
  {
    eventId: {
      type: String,
      required: true,
    },
    creatorId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    allDay: {
      type: Boolean,
      required: true,
    },
    startTimeUtc: {
      type: Date,
      required: true,
    },
    endTimeUtc: {
      type: Date,
      required: true,
    },
    recurring: {
      type: Boolean,
      required: true,
    },
    recurrenceEndsUtc: {
      type: Date,
      required: false,
    },
    recurrencePattern: {
      type: String,
      required: false,
    },
    frequency: {
      type: String,
      required: false,
    },
    // recurringEventId: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "CalendarEntry",
    //   required: false,
    // },
    // recurrenceBegins: {
    //   type: Date,
    //   required: false,
    // },
    // recurrenceEnds: {
    //   type: Date,
    //   required: false,
    // },
  },
  {
    timestamps: true,
  },
);

const CalendarEntry = mongoose.model(
  "CalendarEntry",
  calendarEntrySchema,
  "calendarEntries",
);

module.exports = { CalendarEntry };
