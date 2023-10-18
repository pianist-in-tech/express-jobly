"use strict";

/** Routes for users. */

const jsonschema = require("jsonschema");
const express = require("express");
const { ensureLoggedIn } = require("../middleware/auth");
const { ForbiddenError, BadRequestError } = require("../expressError");
const User = require("../models/user");
const { createToken } = require("../helpers/tokens");
const userNewSchema = require("../schemas/userNew.json");
const userUpdateSchema = require("../schemas/userUpdate.json");
const { ensureCorrectUserOrAdmin } = require('../middleware/auth');


const router = express.Router();

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

/** POST / { user }  => { user, token }
 *
 * Adds a new user. This is not the registration endpoint --- instead, this is
 * only for admin users to add new users. The new user being added can be an
 * admin.
 *
 * This returns the newly created user and an authentication token for them:
 *  {user: { username, firstName, lastName, email, isAdmin }, token }
 *
 * Authorization required: login
 **/

router.post("/", ensureLoggedIn, isAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, userNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const user = await User.register(req.body);
    const token = createToken(user);
    return res.status(201).json({ user, token });
  } catch (err) {
    return next(err);
  }
});

/** GET / => { users: [ {username, firstName, lastName, email }, ... ] }
 *
 * Returns list of all users.
 *
 * Authorization required: login
 **/

router.get("/", ensureLoggedIn, isAdmin, async function (req, res, next) {
  try {
    const users = await User.findAll();
    return res.json({ users });
  } catch (err) {
    return next(err);
  }
});

/** GET /:username => { user }
 *
 * Get a user's information including the jobs they have applied for.
 *
 * Authorization required: login
 */
router.get("/:username", ensureLoggedIn, async function (req, res, next) {
  try {
    const user = await User.get(req.params.username);
    const userInfo = await user.getAllInfo();
    return res.json({ user: userInfo });
  } catch (err) {
    return next(err);
  }
});

/** PATCH /[username] { user } => { user }
 *
 * Data can include:
 *   { firstName, lastName, password, email }
 *
 * Returns { username, firstName, lastName, email, isAdmin }
 *
 * Authorization required: login
 **/

router.patch("/:username", ensureLoggedIn, async function (req, res, next) {
  try {
    // Allow admin or the user itself to update user information
    if (!req.user || (req.user.username !== req.params.username && !req.user.isAdmin)) {
      const err = new ForbiddenError("Unauthorized access");
      return next(err);
    }

    const validator = jsonschema.validate(req.body, userUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const user = await User.update(req.params.username, req.body);
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /[username]  =>  { deleted: username }
 *
 * Authorization required: login
 **/

router.delete("/:username", ensureLoggedIn, async function (req, res, next) {
  try {
    // Allow admin or the user itself to delete the user
    if (!req.user || (req.user.username !== req.params.username && !req.user.isAdmin)) {
      const err = new ForbiddenError("Unauthorized access");
      return next(err);
    }

    await User.remove(req.params.username);
    return res.json({ deleted: req.params.username });
  } catch (err) {
    return next(err);
  }
});

/** POST /users/:username/jobs/:id => { applied: jobId }
 *
 * Allow a user (or admin) to apply for a job.
 *
 * Authorization required: login (for the user applying)
 */
router.post("/:username/jobs/:id", ensureCorrectUserOrAdmin, async function (req, res, next) {
  try {
    const username = req.params.username;
    const jobId = req.params.id;

    await User.applyForJob(username, jobId);
    return res.json({ applied: jobId });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
