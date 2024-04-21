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
