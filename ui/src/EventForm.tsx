import React, { useState } from "react";
import {
  formatDate,
  getDateTimeString,
  oneYearLater,
  singleModalDateFormat,
} from "./lib";
import { Checkbox } from "@chakra-ui/react";
import s from "./EventForm.module.css";

interface FormProps {
  initialStartDate: string;
  initialEndDate: string;
  initialStartTime: string;
  initialEndTime: string;
  initialTitle: string;
  initialDescription: string;
  initialAllDay: boolean;
  initialRecurring: boolean;
  onFormSubmit: Function;
  isCreate: boolean;
}

const EventForm = ({
  initialStartDate,
  initialEndDate,
  initialStartTime,
  initialEndTime,
  initialTitle,
  initialDescription,
  initialAllDay,
  initialRecurring,
  onFormSubmit,
  isCreate,
}: FormProps) => {
  const [startDate, setStartDate] = useState<string>(initialStartDate);
  const [endDate, setEndDate] = useState<string>(initialEndDate);
  const [startTime, setStartTime] = useState<string>(initialStartTime);
  const [endTime, setEndTime] = useState<string>(initialEndTime);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState<string>(initialTitle);
  const [description, setDescription] = useState<string>(initialDescription);
  const [allDay, setAllDay] = useState<boolean>(initialAllDay);
  const [recurring, setRecurring] = useState<boolean>(initialRecurring);
  const recurrenceStartDate = new Date(
    getDateTimeString(startDate, startTime)
  ).toUTCString();

  const handleFormSubmit = async (_: React.MouseEvent<HTMLButtonElement>) => {
    const startDateAndTime: string = getDateTimeString(startDate, startTime);
    const endDateAndTime: string = getDateTimeString(endDate, endTime);
    if (title === "") {
      setError("Error: title cannot be empty.");
      return;
    }
    if (startDateAndTime > endDateAndTime) {
      setError("Error: end cannot be before start.");
      return;
    }
    onFormSubmit({
      title,
      description,
      startDate,
      endDate,
      startTime,
      endTime,
      allDay,
    });
  };

  return (
    <div className={s.container}>
      <label htmlFor="title" className={s.formItem}>
        Title
        <input
          className={s.formInput}
          id="title"
          type="text"
          onChange={(e) => {
            setTitle(e.target.value);
          }}
          value={title}
        />
      </label>
      <label htmlFor="description" className={s.formItem}>
        Description
        <input
          className={s.formInput}
          id="description"
          type="text"
          onChange={(e) => {
            setDescription(e.target.value);
          }}
          value={description}
        />
      </label>
      <label htmlFor="startDate" className={s.formItem}>
        Start Date
        <input
          className={s.formInput}
          id="startDate"
          min={formatDate(new Date())}
          type="date"
          onChange={(e) => {
            setStartDate(e.target.value);
            setEndDate(e.target.value);
          }}
          value={startDate}
        />
      </label>
      <label htmlFor="endDate" className={s.formItem}>
        End Date
        <input
          className={s.formInput}
          id="endDate"
          min={startDate}
          type="date"
          onChange={(e) => {
            setEndDate(e.target.value);
          }}
          value={endDate}
        />
      </label>
      <div className={s.checkbox}>
        <Checkbox
          isChecked={allDay}
          onChange={(e) => {
            setAllDay(e.target.checked);
          }}
        >
          All Day
        </Checkbox>
      </div>
      {!allDay && (
        <>
          <label htmlFor="startTime" className={s.formItem}>
            Start Time
            <input
              className={s.formInput}
              id="startTime"
              type="time"
              onChange={(e) => {
                setStartTime(e.target.value);
              }}
              value={startTime}
              disabled={allDay}
            />
          </label>
          <label htmlFor="endTime" className={s.formItem}>
            End Time
            <input
              className={s.formInput}
              id="endTime"
              type="time"
              onChange={(e) => {
                setEndTime(e.target.value);
              }}
              value={endTime}
              disabled={allDay}
            />
          </label>
        </>
      )}
      <div className={s.checkbox}>
        <Checkbox
          isChecked={recurring}
          onChange={(e) => {
            setRecurring(e.target.checked);
          }}
        >
          Recurring
        </Checkbox>
      </div>
      {recurring && (
        <>
          <label htmlFor="recurrenceType" className={s.formItem}>
            {`Recurrence type: Monthly`}
          </label>
          <label htmlFor="recurrenceBegins" className={s.formItem}>
            {`Recurrence begins: ${singleModalDateFormat(recurrenceStartDate)}`}
          </label>
          <label htmlFor="recurrenceEnds" className={s.formItem}>
            {`Recurrence ends: ${singleModalDateFormat(
              oneYearLater(recurrenceStartDate)
            )}`}
          </label>
        </>
      )}
      <button className={s.formSubmit} onClick={handleFormSubmit}>
        {isCreate ? "Create Event" : "Save"}
      </button>
      {error && <p className={s.error}>{error}</p>}
    </div>
  );
};

export default EventForm;
