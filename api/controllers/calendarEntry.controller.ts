import { Request, Response, NextFunction } from "express";
import { CalendarEntry } from "../models/calendarEntry";
import {
  dayAfter,
  getMillisecondsBetween,
  addMillisecondsToDate,
} from "../lib/dateHelpers";
import { RRule, RRuleSet, rrulestr } from "rrule";

const FREQUENCY_MAPPING = {
  monthly: RRule.MONTHLY,
  weekly: RRule.WEEKLY,
};

// type CalendarEntry =
//   | NonRecurringEntry
//   | RecurringParentEntry
//   | RecurringChildEntry;

// type NonRecurringEntry = {
//   id: string;
//   eventId: string;
//   creatorId: string;
//   title: string;
//   description?: string;
//   allDay: boolean;
//   recurring: false;
//   startTimeUtc: Date;
//   endTimeUtc: Date;
//   createdAt: Date;
//   updatedAt: Date;
// };

type RecurringEntry = {
  id: string;
  eventId: string;
  creatorId: string;
  title: string;
  description?: string;
  allDay: boolean;
  recurring: true;
  startTimeUtc: Date;
  endTimeUtc: Date;
  frequency: string;
  recurrenceEndsUtc: Date;
  recurrencePattern: string;
  createdAt: Date;
  updatedAt: Date;
};

// type RecurringChildEntry = {
//   id: string;
//   eventId: string;
//   creatorId: string;
//   title: string;
//   description?: string;
//   allDay: boolean;
//   recurring: boolean;
//   frequency: string;
//   recurrenceBegins: Date;
//   recurrenceEnds: Date;
//   startTimeUtc: Date;
//   endTimeUtc: Date;
//   recurringEventId: mongoose.Schema.Types.ObjectId;
//   createdAt: Date;
//   updatedAt: Date;
// };

// const isNonRecurringEntry = (entry) => {
//   return (entry as NonRecurringEntry).recurring === false;
// };

const isRecurringEntry = (entry) => {
  return (entry as RecurringEntry).recurring === true;
};

// // Not currently used but will be used during future features
// const isRecurringChildEntry = (entry) => {
//   return (
//     (entry as RecurringChildEntry).recurring === true &&
//     (entry as RecurringChildEntry).recurringEventId !== undefined
//   );
// };

const expandRecurringEntry = (entry, start, end) => {
  const duration = getMillisecondsBetween(entry.startTimeUtc, entry.endTimeUtc);
  const rule = rrulestr(entry.recurrencePattern);
  const rruleSet = new RRuleSet();

  rruleSet.rrule(rule);

  const recurrences = rruleSet.between(new Date(start), new Date(end));
  return recurrences.map((date) => {
    return {
      eventId: entry.eventId,
      creatorId: entry.creatorId,
      title: entry.title,
      description: entry.description,
      allDay: entry.allDay,
      startTimeUtc: date,
      endTimeUtc: addMillisecondsToDate(date, duration),
      recurring: true,
      frequency: entry.frequency,
      recurrenceEndsUtc: entry.recurrenceEndsUtc,
    };
  });
};

const prepRecurringEvents = (entry) => {
  const timeDifference = getMillisecondsBetween(
    entry.startTimeUtc,
    entry.endTimeUtc,
  );
  const rule = new RRule({
    freq: FREQUENCY_MAPPING[entry.frequency],
    dtstart: entry.recurrenceBegins,
    until: entry.recurrenceEnds,
  });
  const recurrences = rule.all().slice(1);
  return recurrences.map((date) => {
    return {
      eventId: entry.eventId,
      creatorId: entry.creatorId,
      title: entry.title,
      description: entry.description,
      allDay: entry.allDay,
      startTimeUtc: date,
      endTimeUtc: addMillisecondsToDate(date, timeDifference),
      recurring: true,
      recurringEventId: entry._id,
      frequency: entry.frequency,
      recurrenceBegins: entry.recurrenceBegins,
      recurrenceEnds: entry.recurrenceEnds,
    };
  });
};

export const seedDatabaseWithEntry = async (
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const today = new Date();
  await CalendarEntry.insertMany([
    {
      eventId: "634b339218b3b892b312e5ca",
      creatorId: "424b339218b3b892b312e5cb",
      title: "Birthday party",
      description: "Let's celebrate Janie!",
      allDay: false,
      recurring: false,
      startTimeUtc: today,
      endTimeUtc: dayAfter(today),
    },
    {
      eventId: "634b339218b3b892b312e5ca",
      creatorId: "424b339218b3b892b312e5cb",
      title: "Dog walk",
      description: "Time for Scottie walking",
      allDay: false,
      recurring: false,
      startTimeUtc: today,
      endTimeUtc: dayAfter(today),
    },
    {
      eventId: "634b339218b3b892b312e5ca",
      creatorId: "424b339218b3b892b312e5cb",
      title: "Dog walk",
      description: "Time for Scottie walking",
      allDay: false,
      recurring: false,
      startTimeUtc: today,
      endTimeUtc: dayAfter(today),
    },
  ]);

  res.sendStatus(201);
};

export const testRrule = async (
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const rule = new RRule({
    freq: RRule.WEEKLY,
    byweekday: [RRule.MO, RRule.TU],
    dtstart: new Date("05 January 2023 14:48 UTC"),
    until: new Date("29 January 2023 14:48 UTC"),
  });

  console.log("rule string", rule.toString());
  console.log("all", rule.all());

  const ruleFromString = rrulestr(rule.toString());

  const rruleSet = new RRuleSet();
  rruleSet.rrule(ruleFromString);
  rruleSet.exdate(new Date("2023-01-16T14:48:00.000Z"));

  const match = rruleSet.between(
    new Date("2023-01-10T14:47:00.000Z"),
    new Date("2023-01-10T14:49:00.000Z"),
  );

  console.log({ match });
  console.log("rruleSet all", rruleSet.all());
  res.sendStatus(200);
};

export const createCalendarEntry = async (
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  try {
    const entry = await CalendarEntry.create(req.body as CalendarEntry);
    if (isRecurringEntry(entry)) {
      const rule = new RRule({
        freq: FREQUENCY_MAPPING[entry.frequency],
        dtstart: entry.startTimeUtc,
        until: entry.recurrenceEndsUtc,
      });
      entry.recurrencePattern = rule.toString();
      entry.save();
    }
    res.status(201).json(entry);
  } catch (err) {
    res.status(400);
    res.send(err);
  }
};

export const getCalendarEntries = async (
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  try {
    const { start, end } = req.query;
    const nonRecurringEntries: CalendarEntry = await CalendarEntry.find()
      .where("recurring")
      .equals(false)
      .where("startTimeUtc")
      .gte(start)
      .where("endTimeUtc")
      .lte(end);

    const recurringEntriesWithinDateRange: CalendarEntry =
      await CalendarEntry.find()
        .where("recurring")
        .equals(true)
        .where("startTimeUtc")
        .gte(start)
        .where("recurrenceEndsUtc")
        .lte(end);

    const recurringEntriesBeginsBeforeEndsWithin: CalendarEntry =
      await CalendarEntry.find()
        .where("recurring")
        .equals(true)
        .where("startTimeUtc")
        .lt(start)
        .where("recurrenceEndsUtc")
        .lte(end);

    const recurringEntriesBeginsWithinEndsAfter: CalendarEntry =
      await CalendarEntry.find()
        .where("recurring")
        .equals(true)
        .where("startTimeUtc")
        .gte(start)
        .where("recurrenceEndsUtc")
        .gte(end);

    const recurringEntriesBeginsBeforeEndsAfter: CalendarEntry =
      await CalendarEntry.find()
        .where("recurring")
        .equals(true)
        .where("startTimeUtc")
        .lt(start)
        .where("recurrenceEndsUtc")
        .gt(end);

    const allRecurringEntries = [
      ...recurringEntriesWithinDateRange,
      ...recurringEntriesBeginsBeforeEndsWithin,
      ...recurringEntriesBeginsWithinEndsAfter,
      ...recurringEntriesBeginsBeforeEndsAfter,
    ];
    let allRecurrences = [];
    allRecurringEntries.forEach((recurringEntry) => {
      const expandedEntries = expandRecurringEntry(recurringEntry, start, end);
      allRecurrences.push(expandedEntries);
    });

    const allEntries = [...nonRecurringEntries, ...allRecurrences.flat()];

    res.status(200).json(allEntries);
  } catch (err) {
    console.log("Caught an error");
    res.status(400);
    res.send(err);
  }
};

export const getCalendarEntry = async (
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const { id } = req.params;
  try {
    const entry = await CalendarEntry.findById(id);
    res.status(200).json(entry);
  } catch (err) {
    res.status(400);
    res.send(err);
  }
};

export const deleteCalendarEntry = async (
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const { id } = req.params;
  try {
    const entryToDelete = await CalendarEntry.findById(id);
    // if (isRecurringParentEntry(entryToDelete)) {
    //   await deleteChildEvents(entryToDelete);
    // }
    await CalendarEntry.deleteOne({ _id: id });
    res.sendStatus(200);
  } catch (err) {
    res.status(400);
    res.send(err);
  }
};

export const updateCalendarEntry = async (
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const { id } = req.params;
  try {
    const originalEntry = await CalendarEntry.findByIdAndUpdate(id, req.body);
    const updatedEntry = await CalendarEntry.findById(id);
    // if (
    //   isNonRecurringEntry(originalEntry) &&
    //   isRecurringParentEntry(updatedEntry)
    // ) {
    //   const recurringData = prepRecurringEvents(updatedEntry);
    //   await CalendarEntry.insertMany(recurringData);
    // }
    // if (
    //   isRecurringParentEntry(originalEntry) &&
    //   isNonRecurringEntry(updatedEntry)
    // ) {
    //   deleteChildEvents(updatedEntry);
    // }
    // if (
    //   isRecurringParentEntry(originalEntry) &&
    //   isRecurringParentEntry(updatedEntry)
    // ) {
    //   deleteChildEvents(updatedEntry);
    //   const recurringData = prepRecurringEvents(updatedEntry);
    //   await CalendarEntry.insertMany(recurringData);
    // }
    res.status(200).json(updatedEntry);
  } catch (err) {
    res.status(400);
    res.send(err);
  }
};
