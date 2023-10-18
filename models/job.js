// job.js

// ... Other imports and code ...

class Job {
    // ... Other methods ...
  
    /** Find all jobs based on provided filters.
     *
     * filterOptions:
     * - title: string (partial match)
     * - minSalary: number (minimum salary)
     * - hasEquity: boolean (true for jobs with non-zero equity, false for all jobs)
     *
     * Returns [{ id, title, salary, equity, companyHandle }, ...]
     **/
  
    static async findAll(filterOptions) {
      let baseQuery = "SELECT id, title, salary, equity, company_handle AS \"companyHandle\" FROM jobs";
      let whereExpressions = [];
      let queryValues = [];
  
      // Filter by title (partial match)
      if (filterOptions.title) {
        queryValues.push(`%${filterOptions.title}%`);
        whereExpressions.push(`title ILIKE $${queryValues.length}`);
      }
  
      // Filter by minimum salary
      if (filterOptions.minSalary !== undefined) {
        queryValues.push(filterOptions.minSalary);
        whereExpressions.push(`salary >= $${queryValues.length}`);
      }
  
      // Filter by equity (true for non-zero equity, false for all jobs)
      if (filterOptions.hasEquity !== undefined) {
        if (filterOptions.hasEquity) {
          whereExpressions.push("equity > 0");
        }
      }
  
      if (whereExpressions.length > 0) {
        baseQuery += " WHERE " + whereExpressions.join(" AND ");
      }
  
      baseQuery += " ORDER BY title";
      const jobsRes = await db.query(baseQuery, queryValues);
      return jobsRes.rows;
    }
  
    // ... Rest of the code ...
  }
  
  module.exports = Job;
  
  "use strict";
  
  const db = require("../db");
  const { BadRequestError, NotFoundError } = require("../expressError");
  
  class Job {
    /** Create a job (from data), update db, return new job data.
     *
     * data should be { title, salary, equity, companyHandle }
     *
     * Returns { id, title, salary, equity, companyHandle }
     *
     * Throws BadRequestError if companyHandle does not exist.
     **/
  
    static async create({ title, salary, equity, companyHandle }) {
      const companyCheck = await db.query(
        `SELECT handle
         FROM companies
         WHERE handle = $1`,
        [companyHandle]
      );
  
      if (!companyCheck.rows[0]) {
        throw new BadRequestError(`Company with handle ${companyHandle} does not exist`);
      }
  
      const result = await db.query(
        `INSERT INTO jobs
         (title, salary, equity, company_handle)
         VALUES ($1, $2, $3, $4)
         RETURNING id, title, salary, equity, company_handle AS "companyHandle"`,
        [title, salary, equity, companyHandle]
      );
      const job = result.rows[0];
  
      return job;
    }
  
    /** Find all jobs (optional filter on searchFilters).
     *
     * searchFilters (all optional):
     * - minSalary
     * - hasEquity (true/false)
     * - title (will find case-insensitive, partial matches)
     *
     * Returns [{ id, title, salary, equity, companyHandle }, ...]
     **/
  
    static async findAll({ minSalary, hasEquity, title } = {}) {
      let baseQuery = "SELECT id, title, salary, equity, company_handle AS \"companyHandle\" FROM jobs";
      let whereExpressions = [];
      let queryValues = [];
  
      if (minSalary !== undefined) {
        queryValues.push(minSalary);
        whereExpressions.push(`salary >= $${queryValues.length}`);
      }
  
      if (hasEquity !== undefined) {
        whereExpressions.push(`equity ${hasEquity ? ">" : "="} 0`);
      }
  
      if (title !== undefined) {
        queryValues.push(`%${title}%`);
        whereExpressions.push(`title ILIKE $${queryValues.length}`);
      }
  
      if (whereExpressions.length > 0) {
        baseQuery += " WHERE " + whereExpressions.join(" AND ");
      }
  
      baseQuery += " ORDER BY title";
      const jobsRes = await db.query(baseQuery, queryValues);
      return jobsRes.rows;
    }
  }
  
  module.exports = Job;
  