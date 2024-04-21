/**
 * Returns the start and end dates of a pay cycle.
 * @param {Date} payCycleStart - The start date of any past pay cycle.
 * @param {Date} [checkDate] - The returned start/end dates are for the cycle that belongs to this date
 * @returns {{startDate: string, endDate: string}} An object containing the start and end dates of the pay cycle in ISO string format.
 */
export const getCycleDates = (payCycleStart: Date, checkDate = new Date()) => {
  const daylightSavingOffset = (300 - checkDate.getTimezoneOffset()) / 60;
  checkDate.setHours(daylightSavingOffset);

  const cycleDuration = 1000 * 60 * 60 * 24 * 14; // 2 weeks

  const nbOfCycles = Math.floor((checkDate.getTime() - payCycleStart.getTime()) / cycleDuration);

  const startDate = new Date(payCycleStart.getTime() + nbOfCycles * cycleDuration);

  return {
    startDate: startDate.toISOString().split("T")[0],
    endDate: checkDate.toISOString().split("T")[0],
  };
};
