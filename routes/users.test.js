"use strict";

const request = require("supertest");

const db = require("../db.js");
const app = require("../app");
const User = require("../models/user");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /users */

describe("POST /users", function () {
  // Existing tests...

  test("unauth for non-admin", async function () {
    const resp = await request(app)
        .post("/users")
        .send({
          username: "u-new",
          firstName: "First-new",
          lastName: "Last-newL",
          password: "password-new",
          email: "new@email.com",
          isAdmin: true,
        });
    expect(resp.statusCode).toEqual(403);
  });
});

/************************************** GET /users */

describe("GET /users", function () {
  // Existing tests...

  test("unauth for non-admin", async function () {
    const resp = await request(app)
        .get("/users");
    expect(resp.statusCode).toEqual(403);
  });
});

/************************************** GET /users/:username */

describe("GET /users/:username", function () {
  // Existing tests...

  test("unauth for non-admin and different user", async function () {
    const resp = await request(app)
        .get(`/users/u1`)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(403);
  });
});

/************************************** PATCH /users/:username */

describe("PATCH /users/:username", () => {
  // Existing tests...

  test("unauth for non-admin and different user", async function () {
    const resp = await request(app)
        .patch(`/users/u1`)
        .send({
          firstName: "New",
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(403);
  });
});

/************************************** DELETE /users/:username */

describe("DELETE /users/:username", function () {
  // Existing tests...

  test("unauth for non-admin and different user", async function () {
    const resp = await request(app)
        .delete(`/users/u1`)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(403);
  });
});
