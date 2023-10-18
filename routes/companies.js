"use strict";

/** Routes for companies. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError, ForbiddenError } = require("../expressError");
const { ensureLoggedIn } = require("../middleware/auth");
const Company = require("../models/company");

const companyNewSchema = require("../schemas/companyNew.json");
const companyUpdateSchema = require("../schemas/companyUpdate.json");

const router = new express.Router();

// Middleware to check if the user is an admin
function isAdmin(req, res, next) {
  // Check if the user is authenticated and is an admin
  if (req.user && req.user.isAdmin) {
    return next();
  } else {
    const err = new ForbiddenError("Unauthorized access");
    return next(err);
  }
}

/** POST / { company } =>  { company }
 *
 * company should be { handle, name, description, numEmployees, logoUrl }
 *
 * Returns { handle, name, description, numEmployees, logoUrl }
 *
 * Authorization required: login
 */
router.post("/", ensureLoggedIn, isAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, companyNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const company = await Company.create(req.body);
    return res.status(201).json({ company });
  } catch (err) {
    return next(err);
  }
});

/** GET /  =>
 *   { companies: [ { handle, name, description, numEmployees, logoUrl }, ...] }
 *
 * Can filter on provided search filters:
 * - minEmployees
 * - maxEmployees
 * - nameLike (will find case-insensitive, partial matches)
 *
 * Authorization required: none
 */
router.get("/", async function (req, res, next) {
  try {
    // Extract query parameters
    const { name, minEmployees, maxEmployees } = req.query;

    // Validate minEmployees and maxEmployees
    if (minEmployees && maxEmployees && parseInt(minEmployees) > parseInt(maxEmployees)) {
      throw new BadRequestError("minEmployees cannot be greater than maxEmployees");
    }

    // Fetch filtered companies based on query parameters
    const companies = await Company.findAll({ name, minEmployees, maxEmployees });
    return res.json({ companies });
  } catch (err) {
    return next(err);
  }
});

/** GET /[handle]  =>  { company }
 *
 *  Company is { handle, name, description, numEmployees, logoUrl, jobs }
 *   where jobs is [{ id, title, salary, equity }, ...]
 *
 * Authorization required: none
 */
router.get("/:handle", async function (req, res, next) {
  try {
    const company = await Company.get(req.params.handle);
    return res.json({ company });
  } catch (err) {
    return next(err);
  }
});

/** GET /[handle] => { company }
 *
 * Returns { handle, name, description, numEmployees, logoUrl, jobs }
 *   where jobs is [ { id, title, salary, equity }, ...]
 *
 * Authorization required: none
 */
router.get("/:handle", async function (req, res, next) {
  try {
    const companyWithJobs = await Company.getWithJobs(req.params.handle);
    return res.json({ company: companyWithJobs });
  } catch (err) {
    return next(err);
  }
});

/** PATCH /[handle] { fld1, fld2, ... } => { company }
 *
 * Patches company data.
 *
 * fields can be: { name, description, numEmployees, logo_url }
 *
 * Returns { handle, name, description, numEmployees, logo_url }
 *
 * Authorization required: login
 */
router.patch("/:handle", ensureLoggedIn, isAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, companyUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const company = await Company.update(req.params.handle, req.body);
    return res.json({ company });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /[handle]  =>  { deleted: handle }
 *
 * Authorization: login
 */
router.delete("/:handle", ensureLoggedIn, isAdmin, async function (req, res, next) {
  try {
    await Company.remove(req.params.handle);
    return res.json({ deleted: req.params.handle });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
