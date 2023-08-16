const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
/**
 * Returns the name of a month based on its numeric representation.
 *
 * @param {number} month - The numeric representation of the month (1 to 12).
 * @returns {string} The name of the month.
 */
export const getMonthName = (month: number) => {
  return monthNames[month - 1];
};

/**
 * Returns the start and end dates of a pay cycle based on the given pay cycle start date.
 * @param {Date} payCycleStart - The start date of any past pay cycle.
 * @returns {{startDate: string, endDate: string}} An object containing the start and end dates of the pay cycle in ISO string format.
 */
export const getCycleDates = (payCycleStart: Date) => {
  const today = new Date();
  const daylightSavingOffset = (300 - today.getTimezoneOffset()) / 60;
  today.setHours(daylightSavingOffset);

  const cycleDuration = 1000 * 60 * 60 * 24 * 14;

  const nbOfCycles = Math.floor(
    (today.getTime() - payCycleStart.getTime()) / cycleDuration
  );

  const startDate = new Date(
    payCycleStart.getTime() + nbOfCycles * cycleDuration
  );

  return {
    startDate: startDate.toISOString().split("T")[0],
    endDate: today.toISOString().split("T")[0],
  };
};
