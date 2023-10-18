const { BadRequestError } = require("../expressError");

/**
 * Generate SQL query for partial updates.
 *
 * This function generates the SQL query for performing partial updates on a table.
 * It creates the SET clause for the SQL UPDATE statement based on the data to update
 * and a mapping of JavaScript field names to SQL column names.
 *
 * @param {Object} dataToUpdate - Data to be updated in the format {field: value}.
 * @param {Object} jsToSql - Mapping of JavaScript field names to SQL column names.
 * @returns {Object} An object containing the SET clause and corresponding values for the SQL UPDATE statement.
 * @throws {BadRequestError} If no data is provided for the update.
 */
function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  
  // Check if dataToUpdate is empty
  if (keys.length === 0) throw new BadRequestError("No data");

  // Generate the SET clause for the SQL UPDATE statement
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
