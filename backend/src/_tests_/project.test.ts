import { describe, expect, it } from "vitest";
import request from "supertest";
import app from "../app.js";

describe("Projects API", () => {
    it("should reject project creation without authentication", async () => {
        const fakeOrganizationId = "00000000-0000-0000-0000-000000000000";

        const response = await request(app)
        .post(`/api/organizations/${fakeOrganizationId}/projects`)
        .send({
            name: "Test Project",
            description: "Testing project creation",
        });

        expect(response.status).toBe(401);
    });

    it("should create a project for an authenticated organization member", async () => {
        const email = `project-${Date.now()}@example.com`;
        const password = "password123";

        // Register user
        const registerResponse = await request(app)
            .post("/api/auth/register")
            .send({
            name: "Project Test User",
            email,
            password,
            });

        expect(registerResponse.status).toBe(201);

        // Login
        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({
            email,
            password,
            });

        expect(loginResponse.status).toBe(200);

        const token = loginResponse.body.token;

        // Create organization
        const organizationResponse = await request(app)
            .post("/api/organizations")
            .set("Authorization", `Bearer ${token}`)
            .send({
            name: `Project Test Organization ${Date.now()}`,
            description: "Testing project creation",
            });

        expect(organizationResponse.status).toBe(201);

        const organizationId = organizationResponse.body.organization.id;

        // Create project
        const projectResponse = await request(app)
            .post(`/api/organizations/${organizationId}/projects`)
            .set("Authorization", `Bearer ${token}`)
            .send({
            name: "Test Project",
            description: "Testing project creation",
            });

        expect(projectResponse.status).toBe(201);
        expect(projectResponse.body.status).toBe("success");
    });

    it("should reject project creation with invalid data", async () => {
        const email = `project-validation-${Date.now()}@example.com`;
        const password = "password123";

        // Register user
        await request(app)
            .post("/api/auth/register")
            .send({
            name: "Project Validation User",
            email,
            password,
            });

        // Login
        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({
            email,
            password,
            });

        expect(loginResponse.status).toBe(200);

        const token = loginResponse.body.token;

        // Create organization
        const organizationResponse = await request(app)
            .post("/api/organizations")
            .set("Authorization", `Bearer ${token}`)
            .send({
            name: `Project Validation Organization ${Date.now()}`,
            description: "Testing project validation",
            });

        expect(organizationResponse.status).toBe(201);

        const organizationId = organizationResponse.body.organization.id;

        // Invalid project data
        const projectResponse = await request(app)
            .post(`/api/organizations/${organizationId}/projects`)
            .set("Authorization", `Bearer ${token}`)
            .send({
            name: "",
            description: "x".repeat(1001),
            });

        expect(projectResponse.status).toBe(400);
        expect(projectResponse.body.status).toBe("error");
        expect(projectResponse.body.message).toBe("Validation failed");
    });
});