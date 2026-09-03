import { describe, expect, it } from "vitest";
import request from "supertest";
import app from "../app.js";

describe("Organizations API", () => {
  it("should reject organization creation without authentication", async () => {
    const response = await request(app)
      .post("/api/organizations")
      .send({
        name: "Test Organization",
        description: "Testing organization creation",
      });

    expect(response.status).toBe(401);
  });

    it("should create an organization for an authenticated user", async () => {
        const email = `org-${Date.now()}@example.com`;
        const password = "password123";

        // Register the user
        const registerResponse = await request(app)
            .post("/api/auth/register")
            .send({
            name: "Organization Test User",
            email,
            password,
            });

        expect(registerResponse.status).toBe(201);

        // Login to get the JWT
        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({
            email,
            password,
            });

        expect(loginResponse.status).toBe(200);
        expect(loginResponse.body.status).toBe("success");
        expect(loginResponse.body).toHaveProperty("token");

        const token = loginResponse.body.token;

        // Create organization using the JWT
        const organizationResponse = await request(app)
            .post("/api/organizations")
            .set("Authorization", `Bearer ${token}`)
            .send({
            name: `Test Organization ${Date.now()}`,
            description: "Testing organization creation",
            });

        expect(organizationResponse.status).toBe(201);
        expect(organizationResponse.body.status).toBe("success");
    });

    it("should reject organization creation with invalid data", async () => {
        const email = `org-validation-${Date.now()}@example.com`;
        const password = "password123";

        // Register user
        await request(app)
            .post("/api/auth/register")
            .send({
            name: "Organization Validation User",
            email,
            password,
            });

        // Login to get token
        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({
            email,
            password,
            });

        expect(loginResponse.status).toBe(200);

        const token = loginResponse.body.token;

        // Invalid organization data
        const response = await request(app)
            .post("/api/organizations")
            .set("Authorization", `Bearer ${token}`)
            .send({
            name: "",
            description: "x".repeat(501),
            });

        expect(response.status).toBe(400);
        expect(response.body.status).toBe("error");
        expect(response.body.message).toBe("Validation failed");
    });
});