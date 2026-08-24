/**
 * Validates that a value is a date string in the YYYY-MM-DD format.
 *
 * Empty/null values are considered valid so optional date fields are not
 * rejected. When provided, the value must match the YYYY-MM-DD pattern and
 * represent a real calendar date (e.g. rejects "2026-13-45" or "2026-02-30").
 *
 * @param {*} value - The date value to validate.
 * @returns {boolean} True if the value is empty or a valid YYYY-MM-DD date.
 */
export const isValidDateFormat = (value) => {
  // Allow empty values (field not filled in)
  if (!value || typeof value !== "string") return true;
  if (value.trim() === "") return true;

  // Value must match the YYYY-MM-DD pattern
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(value.trim())) return false;

  // Verify it is a real calendar date (e.g. not 2026-13-45)
  const [year, month, day] = value.trim().split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
};
