// jobRoutes.js

// ... Other imports and middleware ...

/** GET /  =>
 *   { jobs: [ { id, title, salary, equity, companyHandle }, ...] }
 *
 * Can filter on provided search filters:
 * - title (will find case-insensitive, partial matches)
 * - minSalary
 * - hasEquity (true/false)
 *
 * Authorization required: none
 */

router.get("/", async function (req, res, next) {
    try {
      const { title, minSalary, hasEquity } = req.query;
  
      // Construct filter options based on provided query parameters
      const filterOptions = {};
      if (title) filterOptions.title = title;
      if (minSalary) filterOptions.minSalary = minSalary;
      if (hasEquity !== undefined) filterOptions.hasEquity = hasEquity === 'true';
  
      const jobs = await Job.findAll(filterOptions);
      return res.json({ jobs });
    } catch (err) {
      return next(err);
    }
  });
  
  // ... Rest of the code ...
  
  module.exports = router;
  
  "use strict";
  
  const jsonschema = require("jsonschema");
  const express = require("express");
  
  const { BadRequestError } = require("../expressError");
  const { ensureLoggedIn, isAdmin } = require("../middleware/auth");
  const Job = require("../models/job");
  
  const jobNewSchema = require("../schemas/jobNew.json");
  const jobUpdateSchema = require("../schemas/jobUpdate.json");
  
  const router = new express.Router();
  
  /** POST / { job } =>  { job }
   *
   * job should be { title, salary, equity, companyHandle }
   *
   * Returns { id, title, salary, equity, companyHandle }
   *
   * Authorization required: login, admin
   */
  
  router.post("/", ensureLoggedIn, isAdmin, async function (req, res, next) {
    try {
      const validator = jsonschema.validate(req.body, jobNewSchema);
      if (!validator.valid) {
        const errs = validator.errors.map(e => e.stack);
        throw new BadRequestError(errs);
      }
  
      const job = await Job.create(req.body);
      return res.status(201).json({ job });
    } catch (err) {
      return next(err);
    }
  });
  
  /** GET /  =>
   *   { jobs: [ { id, title, salary, equity, companyHandle }, ...] }
   *
   * Can filter on provided search filters:
   * - minSalary
   * - hasEquity (true/false)
   * - title (will find case-insensitive, partial matches)
   *
   * Authorization required: none
   */
  
  router.get("/", async function (req, res, next) {
    try {
      const { minSalary, hasEquity, title } = req.query;
      const jobs = await Job.findAll({ minSalary, hasEquity, title });
      return res.json({ jobs });
    } catch (err) {
      return next(err);
    }
  });
  
  module.exports = router;
  