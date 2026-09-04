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

    it("should reject getting projects without authentication", async () => {
        const fakeOrganizationId = "00000000-0000-0000-0000-000000000000";

        const response = await request(app)
            .get(`/api/organizations/${fakeOrganizationId}/projects`);

        expect(response.status).toBe(401);
    });

    it("should reject project creation by a user outside the organization", async () => {
        const ownerEmail = `project-owner-${Date.now()}@example.com`;
        const outsiderEmail = `project-outsider-${Date.now()}@example.com`;
        const password = "password123";

        // Register owner
        await request(app)
            .post("/api/auth/register")
            .send({
            name: "Project Owner",
            email: ownerEmail,
            password,
            });

        // Register outsider
        await request(app)
            .post("/api/auth/register")
            .send({
            name: "Project Outsider",
            email: outsiderEmail,
            password,
            });

        // Login owner
        const ownerLogin = await request(app)
            .post("/api/auth/login")
            .send({
            email: ownerEmail,
            password,
            });

        expect(ownerLogin.status).toBe(200);

        const ownerToken = ownerLogin.body.token;

        // Login outsider
        const outsiderLogin = await request(app)
            .post("/api/auth/login")
            .send({
            email: outsiderEmail,
            password,
            });

        expect(outsiderLogin.status).toBe(200);

        const outsiderToken = outsiderLogin.body.token;

        // Create organization
        const organizationResponse = await request(app)
            .post("/api/organizations")
            .set("Authorization", `Bearer ${ownerToken}`)
            .send({
            name: `Project Security Organization ${Date.now()}`,
            description: "Testing project authorization",
            });

        expect(organizationResponse.status).toBe(201);

        const organizationId = organizationResponse.body.organization.id;

        // Outsider attempts to create project
        const projectResponse = await request(app)
            .post(`/api/organizations/${organizationId}/projects`)
            .set("Authorization", `Bearer ${outsiderToken}`)
            .send({
            name: "Unauthorized Project",
            description: "This should be rejected",
            });

        expect(projectResponse.status).toBe(403);
    });

    it("should get a project for an authenticated organization member", async () => {
        const email = `project-get-${Date.now()}@example.com`;
        const password = "password123";

        await request(app)
            .post("/api/auth/register")
            .send({
            name: "Project Get User",
            email,
            password,
            });

        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({
            email,
            password,
            });

        expect(loginResponse.status).toBe(200);

        const token = loginResponse.body.token;

        const organizationResponse = await request(app)
            .post("/api/organizations")
            .set("Authorization", `Bearer ${token}`)
            .send({
            name: `Project Get Organization ${Date.now()}`,
            description: "Testing project retrieval",
            });

        expect(organizationResponse.status).toBe(201);

        const organizationId = organizationResponse.body.organization.id;

        const projectResponse = await request(app)
            .post(`/api/organizations/${organizationId}/projects`)
            .set("Authorization", `Bearer ${token}`)
            .send({
            name: "Project Retrieval Test",
            description: "Testing project retrieval",
            });

        expect(projectResponse.status).toBe(201);

        const projectId = projectResponse.body.project.id;

        const getResponse = await request(app)
            .get(`/api/projects/${projectId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(getResponse.status).toBe(200);
        expect(getResponse.body.status).toBe("success");
        expect(getResponse.body.project.id).toBe(projectId);
        expect(getResponse.body.project.name).toBe("Project Retrieval Test");
    });

    it("should reject project retrieval by a user outside the organization", async () => {
        const ownerEmail = `project-get-owner-${Date.now()}@example.com`;
        const outsiderEmail = `project-get-outsider-${Date.now()}@example.com`;
        const password = "password123";

        // Register owner
        await request(app)
            .post("/api/auth/register")
            .send({
            name: "Project Get Owner",
            email: ownerEmail,
            password,
            });

        // Register outsider
        await request(app)
            .post("/api/auth/register")
            .send({
            name: "Project Get Outsider",
            email: outsiderEmail,
            password,
            });

        // Login owner
        const ownerLogin = await request(app)
            .post("/api/auth/login")
            .send({
            email: ownerEmail,
            password,
            });

        expect(ownerLogin.status).toBe(200);

        const ownerToken = ownerLogin.body.token;

        // Login outsider
        const outsiderLogin = await request(app)
            .post("/api/auth/login")
            .send({
            email: outsiderEmail,
            password,
            });

        expect(outsiderLogin.status).toBe(200);

        const outsiderToken = outsiderLogin.body.token;

        // Create organization
        const organizationResponse = await request(app)
            .post("/api/organizations")
            .set("Authorization", `Bearer ${ownerToken}`)
            .send({
            name: `Project Get Security Organization ${Date.now()}`,
            description: "Testing project security",
            });

        expect(organizationResponse.status).toBe(201);

        const organizationId = organizationResponse.body.organization.id;

        // Create project
        const projectResponse = await request(app)
            .post(`/api/organizations/${organizationId}/projects`)
            .set("Authorization", `Bearer ${ownerToken}`)
            .send({
            name: "Protected Project",
            description: "Testing project security",
            });

        expect(projectResponse.status).toBe(201);

        const projectId = projectResponse.body.project.id;

        // Outsider attempts to retrieve project
        const getResponse = await request(app)
            .get(`/api/projects/${projectId}`)
            .set("Authorization", `Bearer ${outsiderToken}`);

        expect(getResponse.status).toBe(403);
    });

    it("should reject getting projects by a user outside the organization", async () => {
        const ownerEmail = `projects-owner-${Date.now()}@example.com`;
        const outsiderEmail = `projects-outsider-${Date.now()}@example.com`;
        const password = "password123";

        // Register owner
        await request(app)
            .post("/api/auth/register")
            .send({
            name: "Projects Owner",
            email: ownerEmail,
            password,
            });

        // Register outsider
        await request(app)
            .post("/api/auth/register")
            .send({
            name: "Projects Outsider",
            email: outsiderEmail,
            password,
            });

        // Login owner
        const ownerLogin = await request(app)
            .post("/api/auth/login")
            .send({
            email: ownerEmail,
            password,
            });

        expect(ownerLogin.status).toBe(200);

        const ownerToken = ownerLogin.body.token;

        // Login outsider
        const outsiderLogin = await request(app)
            .post("/api/auth/login")
            .send({
            email: outsiderEmail,
            password,
            });

        expect(outsiderLogin.status).toBe(200);

        const outsiderToken = outsiderLogin.body.token;

        // Create organization
        const organizationResponse = await request(app)
            .post("/api/organizations")
            .set("Authorization", `Bearer ${ownerToken}`)
            .send({
            name: `Protected Projects Organization ${Date.now()}`,
            description: "Testing project access",
            });

        expect(organizationResponse.status).toBe(201);

        const organizationId = organizationResponse.body.organization.id;

        // Create project
        const projectResponse = await request(app)
            .post(`/api/organizations/${organizationId}/projects`)
            .set("Authorization", `Bearer ${ownerToken}`)
            .send({
            name: "Protected Project",
            description: "Testing project access",
            });

        expect(projectResponse.status).toBe(201);

        // Outsider attempts to list projects
        const projectsResponse = await request(app)
            .get(`/api/organizations/${organizationId}/projects`)
            .set("Authorization", `Bearer ${outsiderToken}`);

        expect(projectsResponse.status).toBe(403);
    });

    it("should return 404 when the project does not exist", async () => {
        const email = `project-not-found-${Date.now()}@example.com`;
        const password = "password123";

        // Register
        await request(app)
            .post("/api/auth/register")
            .send({
            name: "Project Not Found User",
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

        const fakeProjectId = "00000000-0000-0000-0000-000000000000";

        // Get non-existent project
        const response = await request(app)
            .get(`/api/projects/${fakeProjectId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(404);
    });
});