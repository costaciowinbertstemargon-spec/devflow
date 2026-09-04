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

    it("should reject adding a member without authentication", async () => {
        const fakeOrganizationId = "00000000-0000-0000-0000-000000000000";

        const response = await request(app)
            .post(`/api/organizations/${fakeOrganizationId}/members`)
            .send({
            email: "member@example.com",
            role: "MEMBER",
            });

        expect(response.status).toBe(401);
    });

    it("should reject adding a member with an invalid role", async () => {
        const email = `org-role-${Date.now()}@example.com`;
        const password = "password123";

        // Register
        await request(app)
            .post("/api/auth/register")
            .send({
            name: "Organization Role User",
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
            name: `Role Validation Organization ${Date.now()}`,
            description: "Testing member role validation",
            });

        expect(organizationResponse.status).toBe(201);

        const organizationId = organizationResponse.body.organization.id;

        // Invalid role
        const memberResponse = await request(app)
            .post(`/api/organizations/${organizationId}/members`)
            .set("Authorization", `Bearer ${token}`)
            .send({
            email: "someuser@example.com",
            role: "INVALID_ROLE",
            });

        expect(memberResponse.status).toBe(400);
        expect(memberResponse.body.status).toBe("error");
        expect(memberResponse.body.message).toBe("Validation failed");
    });

    it("should add a member to an organization", async () => {
        const ownerEmail = `member-owner-${Date.now()}@example.com`;
        const memberEmail = `member-user-${Date.now()}@example.com`;
        const password = "password123";

        // Register owner
        await request(app)
            .post("/api/auth/register")
            .send({
            name: "Member Owner",
            email: ownerEmail,
            password,
            });

        // Register member
        const memberRegister = await request(app)
            .post("/api/auth/register")
            .send({
            name: "Member User",
            email: memberEmail,
            password,
            });

        expect(memberRegister.status).toBe(201);

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
            name: `Member Organization ${Date.now()}`,
            description: "Testing membership",
            });

        expect(organizationResponse.status).toBe(201);

        const organizationId = organizationResponse.body.organization.id;

        // Add member
        const memberResponse = await request(app)
            .post(`/api/organizations/${organizationId}/members`)
            .set("Authorization", `Bearer ${ownerToken}`)
            .send({
            email: memberEmail,
            role: "MEMBER",
            });

        expect(memberResponse.status).toBe(201);
        expect(memberResponse.body.status).toBe("success");
    });

    it("should reject adding a user who does not exist", async () => {
        const ownerEmail = `member-missing-owner-${Date.now()}@example.com`;
        const password = "password123";

        // Register owner
        await request(app)
            .post("/api/auth/register")
            .send({
            name: "Member Missing Owner",
            email: ownerEmail,
            password,
            });

        // Login owner
        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({
            email: ownerEmail,
            password,
            });

        expect(loginResponse.status).toBe(200);

        const token = loginResponse.body.token;

        // Create organization
        const organizationResponse = await request(app)
            .post("/api/organizations")
            .set("Authorization", `Bearer ${token}`)
            .send({
            name: `Missing User Organization ${Date.now()}`,
            description: "Testing missing user handling",
            });

        expect(organizationResponse.status).toBe(201);

        const organizationId = organizationResponse.body.organization.id;

        // Try to add non-existent user
        const memberResponse = await request(app)
            .post(`/api/organizations/${organizationId}/members`)
            .set("Authorization", `Bearer ${token}`)
            .send({
            email: `does-not-exist-${Date.now()}@example.com`,
            role: "MEMBER",
            });

        expect(memberResponse.status).toBe(404);
    });

    it("should reject a MEMBER from adding another member", async () => {
        const ownerEmail = `member-auth-owner-${Date.now()}@example.com`;
        const memberEmail = `member-auth-user-${Date.now()}@example.com`;
        const newMemberEmail = `member-auth-new-${Date.now()}@example.com`;
        const password = "password123";

        // Register owner
        await request(app)
            .post("/api/auth/register")
            .send({
            name: "Organization Owner",
            email: ownerEmail,
            password,
            });

        // Register member
        await request(app)
            .post("/api/auth/register")
            .send({
            name: "Organization Member",
            email: memberEmail,
            password,
            });

        // Register new member
        await request(app)
            .post("/api/auth/register")
            .send({
            name: "New Organization Member",
            email: newMemberEmail,
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

        // Login member
        const memberLogin = await request(app)
            .post("/api/auth/login")
            .send({
            email: memberEmail,
            password,
            });

        expect(memberLogin.status).toBe(200);

        const memberToken = memberLogin.body.token;

        // Create organization
        const organizationResponse = await request(app)
            .post("/api/organizations")
            .set("Authorization", `Bearer ${ownerToken}`)
            .send({
            name: `Member Authorization Organization ${Date.now()}`,
            description: "Testing member authorization",
            });

        expect(organizationResponse.status).toBe(201);

        const organizationId = organizationResponse.body.organization.id;

        // Add member
        const addMemberResponse = await request(app)
            .post(`/api/organizations/${organizationId}/members`)
            .set("Authorization", `Bearer ${ownerToken}`)
            .send({
            email: memberEmail,
            role: "MEMBER",
            });

        expect(addMemberResponse.status).toBe(201);

        // MEMBER attempts to add another member
        const unauthorizedResponse = await request(app)
            .post(`/api/organizations/${organizationId}/members`)
            .set("Authorization", `Bearer ${memberToken}`)
            .send({
            email: newMemberEmail,
            role: "MEMBER",
            });

        expect(unauthorizedResponse.status).toBe(403);
    });

    it("should reject adding the same member twice", async () => {
        const ownerEmail = `duplicate-member-owner-${Date.now()}@example.com`;
        const memberEmail = `duplicate-member-user-${Date.now()}@example.com`;
        const password = "password123";

        // Register owner
        await request(app)
            .post("/api/auth/register")
            .send({
            name: "Duplicate Member Owner",
            email: ownerEmail,
            password,
            });

        // Register member
        await request(app)
            .post("/api/auth/register")
            .send({
            name: "Duplicate Member User",
            email: memberEmail,
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
            name: `Duplicate Membership Organization ${Date.now()}`,
            description: "Testing duplicate membership",
            });

        expect(organizationResponse.status).toBe(201);

        const organizationId = organizationResponse.body.organization.id;

        // First membership
        const firstResponse = await request(app)
            .post(`/api/organizations/${organizationId}/members`)
            .set("Authorization", `Bearer ${ownerToken}`)
            .send({
            email: memberEmail,
            role: "MEMBER",
            });

        expect(firstResponse.status).toBe(201);

        // Duplicate membership
        const secondResponse = await request(app)
            .post(`/api/organizations/${organizationId}/members`)
            .set("Authorization", `Bearer ${ownerToken}`)
            .send({
            email: memberEmail,
            role: "MEMBER",
            });

        expect(secondResponse.status).toBe(409);
    });
});