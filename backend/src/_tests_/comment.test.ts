import { describe, expect, it } from "vitest";
import request from "supertest";
import app from "../app.js";

describe("Comments API", () => {
    it("should reject comment creation without authentication", async () => {
        const fakeTaskId = "00000000-0000-0000-0000-000000000000";

        const response = await request(app)
        .post(`/api/tasks/${fakeTaskId}/comments`)
        .send({
            content: "This should not be allowed.",
        });

        expect(response.status).toBe(401);
    });

    it("should create a comment for an authenticated task member", async () => {
        const email = `comment-${Date.now()}@example.com`;
        const password = "password123";

        // Register
        const registerResponse = await request(app)
        .post("/api/auth/register")
        .send({
            name: "Comment Test User",
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
            name: `Comment Organization ${Date.now()}`,
            description: "Testing comments",
        });

        expect(organizationResponse.status).toBe(201);

        const organizationId = organizationResponse.body.organization.id;

        // Create project
        const projectResponse = await request(app)
        .post(`/api/organizations/${organizationId}/projects`)
        .set("Authorization", `Bearer ${token}`)
        .send({
            name: "Comment Test Project",
            description: "Testing comments",
        });

        expect(projectResponse.status).toBe(201);

        const projectId = projectResponse.body.project.id;

        // Create task
        const taskResponse = await request(app)
        .post(`/api/projects/${projectId}/tasks`)
        .set("Authorization", `Bearer ${token}`)
        .send({
            title: "Comment Test Task",
            description: "Testing comment creation",
            priority: "MEDIUM",
        });

        expect(taskResponse.status).toBe(201);

        const taskId = taskResponse.body.task.id;

        // Create comment
        const commentResponse = await request(app)
        .post(`/api/tasks/${taskId}/comments`)
        .set("Authorization", `Bearer ${token}`)
        .send({
            content: "This is a test comment.",
        });

        expect(commentResponse.status).toBe(201);
        expect(commentResponse.body.status).toBe("success");
    });

    it("should reject invalid comment data", async () => {
        const email = `comment-validation-${Date.now()}@example.com`;
        const password = "password123";

        // Register
        await request(app)
        .post("/api/auth/register")
        .send({
            name: "Comment Validation User",
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
            name: `Comment Validation Organization ${Date.now()}`,
            description: "Testing comment validation",
        });

        expect(organizationResponse.status).toBe(201);

        const organizationId = organizationResponse.body.organization.id;

        // Create project
        const projectResponse = await request(app)
        .post(`/api/organizations/${organizationId}/projects`)
        .set("Authorization", `Bearer ${token}`)
        .send({
            name: "Comment Validation Project",
            description: "Testing comment validation",
        });

        expect(projectResponse.status).toBe(201);

        const projectId = projectResponse.body.project.id;

        // Create task
        const taskResponse = await request(app)
        .post(`/api/projects/${projectId}/tasks`)
        .set("Authorization", `Bearer ${token}`)
        .send({
            title: "Comment Validation Task",
            priority: "MEDIUM",
        });

        expect(taskResponse.status).toBe(201);

        const taskId = taskResponse.body.task.id;

        // Invalid comment
        const commentResponse = await request(app)
        .post(`/api/tasks/${taskId}/comments`)
        .set("Authorization", `Bearer ${token}`)
        .send({
            content: "",
        });

        expect(commentResponse.status).toBe(400);
        expect(commentResponse.body.status).toBe("error");
        expect(commentResponse.body.message).toBe("Validation failed");
    });

    it("should reject comment creation from a user outside the organization", async () => {
        const ownerEmail = `comment-owner-${Date.now()}@example.com`;
        const outsiderEmail = `comment-outsider-${Date.now()}@example.com`;
        const password = "password123";

        // Register owner
        await request(app)
            .post("/api/auth/register")
            .send({
            name: "Comment Owner",
            email: ownerEmail,
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

        // Create organization
        const organizationResponse = await request(app)
            .post("/api/organizations")
            .set("Authorization", `Bearer ${ownerToken}`)
            .send({
            name: `Comment Security Organization ${Date.now()}`,
            description: "Testing comment security",
            });

        expect(organizationResponse.status).toBe(201);

        const organizationId = organizationResponse.body.organization.id;

        // Create project
        const projectResponse = await request(app)
            .post(`/api/organizations/${organizationId}/projects`)
            .set("Authorization", `Bearer ${ownerToken}`)
            .send({
            name: "Comment Security Project",
            description: "Testing comment security",
            });

        expect(projectResponse.status).toBe(201);

        const projectId = projectResponse.body.project.id;

        // Create task
        const taskResponse = await request(app)
            .post(`/api/projects/${projectId}/tasks`)
            .set("Authorization", `Bearer ${ownerToken}`)
            .send({
            title: "Protected Comment Task",
            description: "Testing cross-organization comment access",
            priority: "MEDIUM",
            });

        expect(taskResponse.status).toBe(201);

        const taskId = taskResponse.body.task.id;

        // Register outsider
        await request(app)
            .post("/api/auth/register")
            .send({
            name: "Comment Outsider",
            email: outsiderEmail,
            password,
            });

        // Login outsider
        const outsiderLogin = await request(app)
            .post("/api/auth/login")
            .send({
            email: outsiderEmail,
            password,
            });

        expect(outsiderLogin.status).toBe(200);

        const outsiderToken = outsiderLogin.body.token;

        // Outsider attempts to create a comment
        const commentResponse = await request(app)
            .post(`/api/tasks/${taskId}/comments`)
            .set("Authorization", `Bearer ${outsiderToken}`)
            .send({
            content: "Unauthorized comment",
            });

        expect(commentResponse.status).toBe(403);
    });
});