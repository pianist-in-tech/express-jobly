"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("../models/job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  const newJob = {
    title: "New Job",
    salary: 70000,
    equity: 0.1,
    companyHandle: "c1",
  };

  test("works", async function () {
    let job = await Job.create(newJob);
    expect(job).toEqual({
      id: expect.any(Number),
      title: "New Job",
      salary: 70000,
      equity: 0.1,
      companyHandle: "c1",
    });

    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle AS "companyHandle"
       FROM jobs
       WHERE title = 'New Job'`);
    expect(result.rows).toEqual([
      {
        id: job.id,
        title: "New Job",
        salary: 70000,
        equity: 0.1,
        companyHandle: "c1",
      },
    ]);
  });

  test("bad request with invalid companyHandle", async function () {
    try {
      await Job.create({ ...newJob, companyHandle: "nope" });
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** findAll */

describe("findAll", function () {
  // Existing tests...

  test("works: filter by title", async function () {
    let jobs = await Job.findAll({ title: "Engineer" });
    expect(jobs).toEqual([
      {
        id: expect.any(Number),
        title: "Software Engineer",
        salary: 100000,
        equity: "0",
        companyHandle: "c1",
      },
    ]);
  });
});